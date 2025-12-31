"""
DCK Tools Backend API
FastAPI + WebSocket server for real-time Solana token data
"""

# --- load .env early (works from any working dir) ---
import os
from pathlib import Path

try:
    from dotenv import load_dotenv  # pip install python-dotenv
except Exception:
    load_dotenv = None

def _load_env():
    if load_dotenv is None:
        return
    # Priority: ENV_FILE if you set it; else common locations
    candidates = [
        os.environ.get("ENV_FILE"),                                  # explicit path
        Path(__file__).with_name(".env"),                            # same folder as this file
        Path(__file__).parent / ".env",                              # backend_python/.env
        Path.cwd() / "backend_python" / ".env",                      # CWD/backend_python/.env
        Path.cwd() / ".env",                                         # CWD/.env
        Path(__file__).resolve().parents[1] / "backend_python" / ".env",  # repoRoot/backend_python/.env
    ]
    for c in [Path(x) for x in candidates if x]:
        if c.exists():
            load_dotenv(dotenv_path=c, override=False)
            print(f"✅ Loaded .env from: {c}")
            break
    else:
        # fallback: search upwards
        load_dotenv(override=False)

_load_env()
# --- end .env loader ---

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from datetime import datetime
from watcher_kit.router import router as watcher_router, on_startup as watcher_startup

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 DCK Tools Backend starting...")
    # Initialize watcher on startup
    await watcher_startup()
    yield
    # Shutdown
    print("🛑 DCK Tools Backend shutting down...")

app = FastAPI(
    title="DCK Tools API",
    description="Real-time Solana token data and trading API",
    version="1.0.0",
    lifespan=lifespan
)

# Include watcher router
app.include_router(watcher_router)

# CORS middleware - allow Vite dev server origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "dck-tools-backend"
    }

# Token data endpoint
@app.get("/api/tokens")
async def get_tokens():
    """Get all tokens from Raydium and Pump.fun"""
    # TODO: Implement token discovery
    return {
        "tokens": [],
        "count": 0,
        "timestamp": datetime.now().isoformat()
    }

# Token detail endpoint
@app.get("/api/tokens/{mint}")
async def get_token(mint: str):
    """Get specific token by mint address"""
    # TODO: Implement token lookup
    return {
        "mint": mint,
        "found": False
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive subscription requests
            data = await websocket.receive_json()
            
            # TODO: Handle subscription logic
            action = data.get("action")
            
            if action == "subscribe":
                mint = data.get("mint")
                await websocket.send_json({
                    "type": "subscribed",
                    "mint": mint
                })
            
            elif action == "unsubscribe":
                mint = data.get("mint")
                await websocket.send_json({
                    "type": "unsubscribed",
                    "mint": mint
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
