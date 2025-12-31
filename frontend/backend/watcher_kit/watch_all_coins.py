import os, json, asyncio, logging, time
from collections import deque, defaultdict
from typing import List, Optional, Callable, Awaitable, Dict
import websockets
from aiohttp import ClientSession, TCPConnector

logger = logging.getLogger("watch_all_coins")
logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")

def _split(s: str) -> List[str]:
    return [x.strip() for x in s.split(",") if x.strip()]

# --- Multi-RPC config (parallel by default) ---
RPC_HTTP_URLS = _split(os.getenv("RPC_HTTP_URLS","")) or [os.getenv("RPC_HTTP_URL","https://api.mainnet-beta.solana.com")]
RPC_WS_URLS   = _split(os.getenv("RPC_WS_URLS",""))   or [os.getenv("RPC_WS_URL","wss://api.mainnet-beta.solana.com")]
MULTI_RPC_MODE = os.getenv("MULTI_RPC_MODE","parallel").lower()  # parallel | rr

# Programs to watch
WATCH_PROGRAMS    = _split(os.getenv("WATCH_PROGRAMS",""))
PUMP_FUN_PROGRAMS = _split(os.getenv("PUMP_FUN_PROGRAMS",""))
RAYDIUM_PROGRAMS  = _split(os.getenv("RAYDIUM_PROGRAMS",""))
PROGRAM_IDS = WATCH_PROGRAMS or (PUMP_FUN_PROGRAMS + RAYDIUM_PROGRAMS)

# Perf & batching
WATCHER_ENABLED = os.getenv("WATCHER_ENABLED","true").lower() not in ("0","false","no")
DEDUP_MAX = int(os.getenv("WATCH_DEDUP_MAX","50000"))
BACKFILL_CONCURRENCY = int(os.getenv("BACKFILL_CONCURRENCY","8"))
DB_BATCH_MAX = int(os.getenv("DB_BATCH_MAX","50"))
DB_BATCH_MS  = int(os.getenv("DB_BATCH_MS","250"))
FAST_MODE = os.getenv("FAST_MODE","true").lower() in ("1","true","yes")

# Circuit breaker (rr mode)
CB_FAIL_LIMIT    = int(os.getenv("CB_FAIL_LIMIT","4"))
CB_COOLDOWN_SEC  = int(os.getenv("CB_COOLDOWN_SEC","30"))

def looks_like_initialize(logs: List[str]) -> bool:
    for line in logs or []:
        l = line.lower()
        if "initializemint" in l or "initialize mint" in l or "instruction: initializemint" in l:
            return True
    return False

def solscan_tx(sig:str)->str: return f"https://solscan.io/tx/{sig}"

# ---------- HTTP backfill ----------
class Backfiller:
    def __init__(self, http_urls: List[str], concurrency: int):
        self._http_urls = deque(http_urls)
        self._sem = asyncio.Semaphore(concurrency)
        self._session: Optional[ClientSession] = None

    async def start(self):
        self._session = ClientSession(connector=TCPConnector(limit=64))

    async def close(self):
        if self._session: await self._session.close()

    def _next_http(self) -> str:
        self._http_urls.rotate(-1)
        return self._http_urls[0]

    async def get_mint(self, signature: str) -> Optional[str]:
        if not self._session: return None
        payload = {"jsonrpc":"2.0","id":1,"method":"getTransaction",
                   "params":[signature, {"encoding":"json","maxSupportedTransactionVersion":0}]}
        url = self._next_http()
        async with self._sem:
            try:
                async with self._session.post(url, json=payload, timeout=8) as r:
                    j = await r.json()
                    meta = (j.get("result") or {}).get("meta") or {}
                    tbs = meta.get("postTokenBalances") or []
                    return tbs[0]["mint"] if tbs else None
            except Exception:
                return None

# ---------- handler registry ----------
_handlers: List[Callable[[dict], Awaitable[None]]] = []
def register_handler(coro_func): _handlers.append(coro_func)

# ---------- stats ----------
class Stats:
    def __init__(self):
        self.ts = deque(maxlen=6000)
        self.total = 0
        self.per_ws_ok = defaultdict(int)
        self.per_ws_err = defaultdict(int)
        self.cb_until: Dict[str, float] = {}  # ws_url -> resume_time
    def mark(self, ws_url: str):
        now = time.time()
        self.ts.append(now); self.total += 1
        self.per_ws_ok[ws_url] += 1
    def err(self, ws_url: str):
        self.per_ws_err[ws_url] += 1
    def tps_60s(self) -> float:
        now = time.time()
        while self.ts and now - self.ts[0] > 60: self.ts.popleft()
        return len(self.ts) / 60.0

stats = Stats()

# ---------- ingest helpers ----------
async def _subscribe(ws, program_id: str) -> int:
    req = {"jsonrpc":"2.0","id":program_id,"method":"logsSubscribe",
           "params":[{"mentions":[program_id]},{"commitment":"confirmed"}]}
    await ws.send(json.dumps(req))
    msg = json.loads(await ws.recv())
    if "result" not in msg: raise RuntimeError(f"logsSubscribe failed for {program_id}: {msg}")
    return msg["result"]

async def _ingest_one(ws_url: str, out_q: asyncio.Queue):
    while True:
        try:
            logger.info(f"[ws] connect {ws_url}")
            async with websockets.connect(ws_url, ping_interval=20, ping_timeout=20) as ws:
                for pid in PROGRAM_IDS:
                    try:
                        sub_id = await _subscribe(ws, pid)
                        logger.info(f"[ws] {ws_url} subscribed {pid} ({sub_id})")
                    except Exception as e:
                        logger.warning(f"[ws] subscribe failed {pid} on {ws_url}: {e}")
                while True:
                    data = json.loads(await ws.recv())
                    if data.get("method") != "logsNotification":
                        continue
                    res = data["params"]["result"]
                    logs = res["value"].get("logs") or []
                    sig  = res["value"]["signature"]
                    await out_q.put({"ws_url": ws_url, "signature": sig,
                                     "is_initialize": looks_like_initialize(logs),
                                     "tx_url": solscan_tx(sig)})
        except asyncio.CancelledError:
            raise
        except Exception as e:
            stats.err(ws_url)
            logger.warning(f"[ws] {ws_url} error {e}; retrying in 3s")
            await asyncio.sleep(3)

async def _ingest_rr(ws_urls: List[str], out_q: asyncio.Queue):
    idx = 0
    backoff = 3
    fails = defaultdict(int)
    while True:
        ws_url = ws_urls[idx % len(ws_urls)]
        now = time.time()
        resume_at = stats.cb_until.get(ws_url, 0)
        if now < resume_at:
            logger.info(f"[ws] {ws_url} circuit open, skip {int(resume_at-now)}s")
            idx += 1
            await asyncio.sleep(1)
            continue
        try:
            logger.info(f"[ws] RR connect {ws_url}")
            async with websockets.connect(ws_url, ping_interval=20, ping_timeout=20) as ws:
                backoff = 3; fails[ws_url] = 0
                for pid in PROGRAM_IDS:
                    try:
                        sub_id = await _subscribe(ws, pid)
                        logger.info(f"[ws] {ws_url} subscribed {pid} ({sub_id})")
                    except Exception as e:
                        logger.warning(f"[ws] subscribe failed {pid} on {ws_url}: {e}")
                while True:
                    data = json.loads(await ws.recv())
                    if data.get("method") != "logsNotification":
                        continue
                    res = data["params"]["result"]
                    logs = res["value"].get("logs") or []
                    sig  = res["value"]["signature"]
                    await out_q.put({"ws_url": ws_url, "signature": sig,
                                     "is_initialize": looks_like_initialize(logs),
                                     "tx_url": solscan_tx(sig)})
        except asyncio.CancelledError:
            raise
        except Exception as e:
            stats.err(ws_url); fails[ws_url] += 1
            logger.warning(f"[ws] RR {ws_url} error {e}; fail#{fails[ws_url]} backoff {backoff}s")
            if fails[ws_url] >= CB_FAIL_LIMIT:
                stats.cb_until[ws_url] = time.time() + CB_COOLDOWN_SEC
                logger.warning(f"[ws] RR {ws_url} circuit OPEN {CB_COOLDOWN_SEC}s")
                fails[ws_url] = 0
            await asyncio.sleep(backoff)
            backoff = min(backoff*2, 30)
            idx += 1  # next URL

# ---------- fanout + persist ----------
class Persistor:
    def __init__(self, batch_ms: int, batch_max: int):
        self.batch_ms = batch_ms; self.batch_max = batch_max
    async def run(self, q: asyncio.Queue):
        try:
            from watcher_kit.db import batch_save
        except ImportError:
            from .db import batch_save
        import time as _t
        batch = []; last = _t.time()
        while True:
            try:
                ev = await asyncio.wait_for(q.get(), timeout=self.batch_ms/1000)
                batch.append({"signature": ev.get("signature"),
                              "mint": ev.get("mint"),
                              "is_initialize": ev.get("is_initialize")})
                q.task_done()
            except asyncio.TimeoutError:
                pass
            now = _t.time()
            if batch and (len(batch) >= self.batch_max or (now-last)*1000 >= self.batch_ms):
                try:
                    await batch_save(batch)
                finally:
                    batch.clear(); last = now

class StatsFanout:
    def __init__(self): self.seen = set(); self.ring = deque(maxlen=DEDUP_MAX)
    async def run(self, in_q: asyncio.Queue, persist_q: asyncio.Queue, backfill_q: asyncio.Queue):
        while True:
            ev = await in_q.get()
            sig = ev["signature"]; ws_url = ev.get("ws_url","")
            if sig in self.seen:
                in_q.task_done(); continue
            self.seen.add(sig); self.ring.append(sig)
            stats.mark(ws_url)
            # handlers (WS push etc.)
            for h in _handlers:
                try: await h({"signature": sig, "is_initialize": ev.get("is_initialize")})
                except Exception as e: logger.warning(f"handler failed: {e}")
            # persist stub
            await persist_q.put(ev)
            # backfill later
            if FAST_MODE:
                await backfill_q.put(sig)
            in_q.task_done()

async def backfill_loop(backfill_q: asyncio.Queue, bf: Backfiller, on_update: Callable[[str, Optional[str]], Awaitable[None]]):
    while True:
        sig = await backfill_q.get()
        mint = await bf.get_mint(sig)
        try: await on_update(sig, mint)
        except Exception as e: logger.warning(f"update handler failed: {e}")
        backfill_q.task_done()

# ---------- public start ----------
async def start_watch(register_update_handler: Callable[[str, Optional[str]], Awaitable[None]]):
    if not WATCHER_ENABLED:
        logger.info("Watcher disabled."); return
    if not PROGRAM_IDS:
        logger.warning("No program IDs configured."); return

    in_q, bf_q, persist_q = asyncio.Queue(10000), asyncio.Queue(10000), asyncio.Queue(10000)
    bf = Backfiller(RPC_HTTP_URLS, BACKFILL_CONCURRENCY)
    await bf.start()

    tasks = []
    if MULTI_RPC_MODE == "parallel":
        logger.info(f"Mode=parallel; connecting to all WS endpoints: {RPC_WS_URLS}")
        for u in RPC_WS_URLS:
            tasks.append(asyncio.create_task(_ingest_one(u, in_q)))
    else:
        logger.info(f"Mode=rr; single active WS with failover: {RPC_WS_URLS}")
        tasks.append(asyncio.create_task(_ingest_rr(RPC_WS_URLS, in_q)))

    fan = StatsFanout()
    per = Persistor(DB_BATCH_MS, DB_BATCH_MAX)
    tasks.append(asyncio.create_task(fan.run(in_q, persist_q, bf_q)))
    tasks.append(asyncio.create_task(per.run(persist_q)))
    tasks.append(asyncio.create_task(backfill_loop(bf_q, bf, on_update=register_update_handler)))

    logger.info(f"Watcher online. http={RPC_HTTP_URLS} ws={RPC_WS_URLS} progs={len(PROGRAM_IDS)} mode={MULTI_RPC_MODE}")

    try:
        await asyncio.gather(*tasks)
    finally:
        await bf.close()

# ---------- stats for API ----------
def get_internal_stats():
    return {
        "tps_60s": round(stats.tps_60s(),2),
        "total": stats.total,
        "per_ws_ok": dict(stats.per_ws_ok),
        "per_ws_err": dict(stats.per_ws_err),
        "cb_until": {k:int(v-time.time()) for k,v in stats.cb_until.items() if v>time.time()}
    }
