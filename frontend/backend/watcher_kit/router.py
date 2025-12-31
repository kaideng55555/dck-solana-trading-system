from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import asyncio
from .db import init_db, save_event, recent_events
from .watch_all_coins import start_watch, register_handler

router = APIRouter(tags=["watcher"])

class WSManager:
    def __init__(self): self.active: List[WebSocket] = []
    async def connect(self, ws: WebSocket): await ws.accept(); self.active.append(ws)
    def disconnect(self, ws: WebSocket):
        try: self.active.remove(ws)
        except ValueError: pass
    async def broadcast(self, message: dict):
        dead=[]
        for ws in self.active:
            try: await ws.send_json(message)
            except Exception: dead.append(ws)
        for d in dead: self.disconnect(d)

ws_manager = WSManager()

@router.get("/events")
async def events(limit: int = 50):
    return {"items": await recent_events(limit)}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@router.post("/test_emit")
async def test_emit():
    evt = {"kind":"test","msg":"hello","tx_url":None}
    await save_event(evt)
    await ws_manager.broadcast(evt)
    return {"ok": True}

async def on_startup():
    await init_db()
    async def _persist_and_broadcast(event: dict):
        await save_event(event)
        await ws_manager.broadcast(event)
    register_handler(_persist_and_broadcast)
    
    # Update handler for backfill (signature, mint) updates
    async def _on_mint_update(signature: str, mint: str | None):
        if mint:
            # Broadcast mint update via WS
            await ws_manager.broadcast({
                "type": "update",
                "signature": signature,
                "mint": mint
            })
    
    asyncio.create_task(start_watch(_on_mint_update))
