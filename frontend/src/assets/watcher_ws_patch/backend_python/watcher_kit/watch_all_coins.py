import os, json, asyncio, logging
from collections import deque
from typing import List, Optional, Callable, Awaitable
import requests
import websockets

logger = logging.getLogger("watch_all_coins")
logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")

RPC_HTTP_URL = os.getenv("RPC_HTTP_URL", "https://api.mainnet-beta.solana.com")
RPC_WS_URL = os.getenv("RPC_WS_URL", "wss://api.mainnet-beta.solana.com")

def _split(s: str) -> List[str]:
    return [x.strip() for x in s.split(",") if x.strip()]

WATCH_PROGRAMS = _split(os.getenv("WATCH_PROGRAMS", ""))
PUMP_FUN_PROGRAMS = _split(os.getenv("PUMP_FUN_PROGRAMS", ""))
RAYDIUM_PROGRAMS = _split(os.getenv("RAYDIUM_PROGRAMS", ""))

PROGRAM_IDS = WATCH_PROGRAMS or (PUMP_FUN_PROGRAMS + RAYDIUM_PROGRAMS)
WATCHER_ENABLED = os.getenv("WATCHER_ENABLED", "true").lower() not in ("0","false","no")
DEDUP_MAX = int(os.getenv("WATCH_DEDUP_MAX", "10000"))

def _solscan_tx(sig:str)->str: return f"https://solscan.io/tx/{sig}"
def _solscan_token(mint:str)->str: return f"https://solscan.io/token/{mint}"

def _looks_like_initialize(logs: List[str]) -> bool:
    for line in logs or []:
        l = line.lower()
        if "initializemint" in l or "initialize mint" in l or "instruction: initializemint" in l:
            return True
    return False

def _get_mint_from_tx(signature: str) -> Optional[str]:
    try:
        payload = {"jsonrpc":"2.0","id":1,"method":"getTransaction",
                   "params":[signature,{"encoding":"json","maxSupportedTransactionVersion":0}]}
        r = requests.post(RPC_HTTP_URL, json=payload, timeout=8)
        r.raise_for_status()
        result = r.json().get("result") or {}
        meta = result.get("meta") or {}
        post_bal = meta.get("postTokenBalances") or []
        if post_bal:
            mint = post_bal[0].get("mint")
            if mint: return mint
    except Exception as e:
        logger.debug(f"getTransaction failed for {signature}: {e}")
    return None

async def _subscribe(ws, program_id: str) -> int:
    req = {"jsonrpc":"2.0","id":program_id,"method":"logsSubscribe",
           "params":[{"mentions":[program_id]},{"commitment":"confirmed"}]}
    await ws.send(json.dumps(req))
    msg = json.loads(await ws.recv())
    if "result" not in msg: raise RuntimeError(f"logsSubscribe failed for {program_id}: {msg}")
    sub_id = msg["result"]
    logger.info(f"Subscribed to program {program_id} (sub {sub_id})")
    return sub_id

_handlers: List[Callable[[dict], Awaitable[None]]] = []
def register_handler(coro_func): _handlers.append(coro_func)

async def start_watch():
    if not WATCHER_ENABLED:
        logger.info("Watcher disabled (WATCHER_ENABLED=false)."); return
    if not PROGRAM_IDS:
        logger.warning("No program IDs configured. Set WATCH_PROGRAMS or PUMP_FUN_PROGRAMS/RAYDIUM_PROGRAMS."); return

    seen, seen_set = deque(maxlen=DEDUP_MAX), set()
    backoff = 5
    while True:
        try:
            logger.info(f"Connecting to WS: {RPC_WS_URL}")
            async with websockets.connect(RPC_WS_URL, ping_interval=20, ping_timeout=20) as ws:
                for pid in PROGRAM_IDS:
                    try: await _subscribe(ws, pid)
                    except Exception as e: logger.warning(f"Subscribe failed for {pid}: {e}")
                backoff = 5; logger.info("Watcher online.")
                while True:
                    data = json.loads(await ws.recv())
                    if data.get("method") != "logsNotification": continue
                    res = data["params"]["result"]
                    sig = res["value"]["signature"]
                    if sig in seen_set: continue
                    logs = res["value"].get("logs") or []
                    is_init = _looks_like_initialize(logs)
                    mint = _get_mint_from_tx(sig)
                    seen.append(sig); seen_set.add(sig)
                    if len(seen_set) > DEDUP_MAX - 500:
                        for _ in range(500): seen_set.discard(seen.popleft())
                    event = {
                        "signature": sig, "mint": mint, "is_initialize": is_init,
                        "tx_url": _solscan_tx(sig), "mint_url": _solscan_token(mint) if mint else None
                    }
                    for h in _handlers:
                        try: await h(event)
                        except Exception as e: logger.warning(f"handler failed: {e}")
                    logger.info(f"NEW TX {sig} → {event['tx_url']}"
                                f"{' | mint: '+mint if mint else ''}"
                                f"{' | InitializeMint' if is_init else ''}")
        except asyncio.CancelledError:
            raise
        except Exception as e:
            logger.warning(f"Watcher error: {e} (reconnecting in {backoff}s)")
            await asyncio.sleep(backoff); backoff = min(backoff*2, 60)
