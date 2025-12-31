#!/bin/bash
# set_speed.sh - Toggle between FAST and SAFE performance modes
# Usage: ./set_speed.sh {FAST|SAFE}

MODE="${1:-SAFE}"
ENV_FILE="backend/.env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Error: $ENV_FILE not found"
    exit 1
fi

case "$MODE" in
    FAST)
        echo "🚀 Setting FAST mode (BACKFILL_CONCURRENCY=16, DB_BATCH_MS=150)"
        sed -i 's/^BACKFILL_CONCURRENCY=.*/BACKFILL_CONCURRENCY=16/' "$ENV_FILE"
        sed -i 's/^DB_BATCH_MS=.*/DB_BATCH_MS=150/' "$ENV_FILE"
        ;;
    SAFE)
        echo "🛡️  Setting SAFE mode (BACKFILL_CONCURRENCY=8, DB_BATCH_MS=250)"
        sed -i 's/^BACKFILL_CONCURRENCY=.*/BACKFILL_CONCURRENCY=8/' "$ENV_FILE"
        sed -i 's/^DB_BATCH_MS=.*/DB_BATCH_MS=250/' "$ENV_FILE"
        ;;
    *)
        echo "❌ Usage: $0 {FAST|SAFE}"
        exit 1
        ;;
esac

echo "✅ Updated $ENV_FILE"
echo ""
echo "Current settings:"
grep -E "^(BACKFILL_CONCURRENCY|DB_BATCH_MS)=" "$ENV_FILE"
echo ""
echo "💡 Restart backend with:"
echo "   lsof -nP -iTCP:8000 -sTCP:LISTEN -t | xargs -r kill"
echo "   cd /workspaces/src/backend && python3 main.py > /tmp/backend_watcher.log 2>&1 &"
