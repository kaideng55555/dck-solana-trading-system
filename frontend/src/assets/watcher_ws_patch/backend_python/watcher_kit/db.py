import aiosqlite
import json
from typing import Any, Dict, List

DB_PATH = "events.sqlite"

EVENTS_SCHEMA = "
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signature TEXT,
  mint TEXT,
  is_initialize INTEGER,
  raw TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_sig ON events(signature);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
"

async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(EVENTS_SCHEMA)
        await db.commit()

async def save_event(event: Dict[str, Any]) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO events(signature, mint, is_initialize, raw) VALUES(?,?,?,?)",
            (
                event.get("signature"),
                event.get("mint"),
                1 if event.get("is_initialize") else 0,
                json.dumps(event, ensure_ascii=False),
            ),
        )
        await db.commit()

async def recent_events(limit: int = 50) -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, ts, signature, mint, is_initialize FROM events ORDER BY id DESC LIMIT ?",
            (limit,),
        ) as cur:
            rows = await cur.fetchall()
            return [dict(r) for r in rows]
