# Stability Hardener Patch

This patch improves reliability and reduces 429 errors by:
- Raw WebSocket + exponential backoff + jitter (cap 30s)
- Honors `retryAfterMs` from WS close reason
- Heartbeat (ping/pong) and outbound queue
- Axios 429 retry honoring `Retry-After`
- 60s cache for token history
- RPC helpers (Solana/EVM) using env

## Apply
unzip -o ~/Downloads/stability-hardeners-patch.zip -d .

## Env
VITE_API_URL=http://127.0.0.1:8000
VITE_WS_URL=ws://127.0.0.1:8000/ws/feed
VITE_NETWORK=mainnet-beta
# optional
VITE_SOLANA_RPC_URL=https://your-solana-rpc
VITE_EVM_RPC_URL=https://your-evm-rpc

## Commit
git add -A
git commit -m "stability: WS backoff+jitter, heartbeat, HTTP 429 retry, RPC helpers"
