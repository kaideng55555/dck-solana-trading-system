#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/backend"

echo "🛑 Stopping backend (port 8000)..."
lsof -nP -iTCP:8000 -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9 || true

echo "⏳ Waiting for port to release..."
sleep 1

echo "🚀 Starting FAST mode (XIE off, 16 workers, 150ms batch)..."
uvicorn main:app --host 127.0.0.1 --port 8000 --reload &

echo "⏳ Waiting for startup..."
sleep 3

echo "📊 Stats summary:"
curl -sS http://127.0.0.1:8000/stats/summary | jq .

echo "✅ Backend restarted successfully!"
echo "   WebSocket: ws://127.0.0.1:8000/ws/feed"
echo "   Test: open ws_test.html in browser"

