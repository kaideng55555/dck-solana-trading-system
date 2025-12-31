# Watcher + WebSocket Patch (FastAPI :8000)

Adds:
- **GET /events** — recent events from SQLite
- **WS /ws** — broadcast new events to dashboard
- **POST /test_emit** — quick test
- Solana watcher that pushes events to DB + WS

## Install
1) Unzip this at your project root so files land under `backend_python/watcher_kit/`.
2) Edit `backend_python/main.py` and add:

```py
from backend_python.watcher_kit.router import router as watcher_router, on_startup as watcher_startup
app.include_router(watcher_router)

@app.on_event("startup")
async def _start_watcher():
    await watcher_startup()
```

(If you already have a startup handler, call `await watcher_startup()` inside it.)

3) Deps:
```bash
python -m pip install fastapi uvicorn[standard] websockets requests aiosqlite python-dotenv
```

4) Env (`backend_python/.env`):
```env
RPC_HTTP_URL=https://api.mainnet-beta.solana.com
RPC_WS_URL=wss://api.mainnet-beta.solana.com
WATCHER_ENABLED=true
WATCH_DEDUP_MAX=10000
WATCH_PROGRAMS=TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
PUMP_FUN_PROGRAMS=
RAYDIUM_PROGRAMS=
```

5) Run:
```bash
uvicorn backend_python.main:app --host 127.0.0.1 --port 8000 --reload
```

6) Test:
- http://127.0.0.1:8000/events
- ws://127.0.0.1:8000/ws
- `curl -X POST http://127.0.0.1:8000/test_emit`
