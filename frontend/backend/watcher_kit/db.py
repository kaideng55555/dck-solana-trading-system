import aiosqlite, json
from typing import Any, Dict, List, Optional
from pathlib import Path

# Use absolute path relative to this file's directory
DB_PATH = str(Path(__file__).parent.parent / "events.sqlite")

EVENTS_SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA temp_store=MEMORY;

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts REAL DEFAULT (strftime('%s','now')),
  signature TEXT,
  mint TEXT,
  is_initialize INTEGER,
  raw TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_sig   ON events(signature);
CREATE INDEX IF NOT EXISTS idx_events_ts    ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_mint  ON events(mint);
CREATE INDEX IF NOT EXISTS idx_events_init  ON events(is_initialize);
"""

async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(EVENTS_SCHEMA)
        await db.commit()

async def save_event(event: Dict[str, Any]) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO events(signature, mint, is_initialize, raw) VALUES (?,?,?,?)",
            (
                event.get("signature"),
                event.get("mint"),
                1 if event.get("is_initialize") else 0,
                json.dumps(event, ensure_ascii=False),
            ),
        )
        await db.commit()

async def batch_save(events: List[Dict[str, Any]]) -> None:
    if not events: return
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executemany(
            "INSERT INTO events(signature, mint, is_initialize, raw) VALUES (?,?,?,?)",
            [
                (
                    e.get("signature"),
                    e.get("mint"),
                    1 if e.get("is_initialize") else 0,
                    json.dumps(e, ensure_ascii=False),
                )
                for e in events
            ],
        )
        await db.commit()

async def update_event(signature: str, mint: Optional[str], is_initialize: Optional[bool]) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE events SET mint = COALESCE(?, mint), is_initialize = COALESCE(?, is_initialize) WHERE signature = ?",
            (mint, 1 if (is_initialize is True) else None, signature),
        )
        await db.commit()

async def recent_events(limit: int = 50):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, ts, signature, mint, is_initialize FROM events ORDER BY id DESC LIMIT ?",
            (limit,),
        ) as cur:
            rows = await cur.fetchall()
            return [dict(r) for r in rows]
