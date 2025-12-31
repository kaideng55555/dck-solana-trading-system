# Multi-RPC Failover System

## Overview
The watcher system now supports **automatic failover** between multiple Solana RPC endpoints to ensure continuous operation even when individual endpoints experience issues.

## Implementation

### Configuration (.env)
```bash
# Multi-RPC Configuration (comma-separated lists)
RPC_HTTP_URLS=https://api.mainnet-beta.solana.com,https://ultra-ultra-fog.solana-mainnet.quiknode.pro/48fa88a641cbd2a15f2e0c4f8d9c96c41c70fcf5/
RPC_WS_URLS=wss://api.mainnet-beta.solana.com,wss://ultra-ultra-fog.solana-mainnet.quiknode.pro/48fa88a641cbd2a15f2e0c4f8d9c96c41c70fcf5/

# Legacy single URL support (deprecated - use multi-URL format above)
RPC_HTTP_URL=https://api.mainnet-beta.solana.com
RPC_WS_URL=wss://api.mainnet-beta.solana.com
```

### Code Changes (`watch_all_coins.py`)

#### 1. Multi-URL Parsing
```python
def _split(s: str) -> List[str]:
    return [x.strip() for x in s.split(",") if x.strip()]

RPC_HTTP_URLS = _split(os.getenv("RPC_HTTP_URLS","")) or [os.getenv("RPC_HTTP_URL","https://api.mainnet-beta.solana.com")]
RPC_WS_URLS   = _split(os.getenv("RPC_WS_URLS",""))   or [os.getenv("RPC_WS_URL","wss://api.mainnet-beta.solana.com")]
```

#### 2. Round-Robin Helpers
```python
_http_i = 0
_ws_i = 0

def next_http():
    """Get next HTTP RPC URL in round-robin fashion"""
    global _http_i
    url = RPC_HTTP_URLS[_http_i % len(RPC_HTTP_URLS)]
    _http_i += 1
    return url

def next_ws():
    """Get next WebSocket RPC URL in round-robin fashion"""
    global _ws_i
    url = RPC_WS_URLS[_ws_i % len(RPC_WS_URLS)]
    _ws_i += 1
    return url
```

#### 3. WebSocket Connection with Failover
```python
async def start_watch():
    # ...
    while True:
        ws_url = next_ws()  # Round-robin through available WebSocket URLs
        try:
            logger.info(f"Connecting to WS: {ws_url}")
            async with websockets.connect(ws_url, ping_interval=20, ping_timeout=20) as ws:
                # Subscribe to programs...
                # Handle messages...
        except Exception as e:
            logger.warning(f"Watcher error on {ws_url}: {e} (reconnecting in {backoff}s)")
            # On failure, next iteration will try the next URL
```

#### 4. HTTP Transaction Fetching with Failover
```python
def _get_mint_from_tx(signature: str) -> Optional[str]:
    http_url = next_http()  # Round-robin through available HTTP URLs
    try:
        r = requests.post(http_url, json=payload, timeout=8)
        # ...
    except Exception as e:
        logger.debug(f"getTransaction failed for {signature} on {http_url}: {e}")
        # On failure, next call will try the next URL
```

## Behavior

### On Connection Failure
When a WebSocket connection fails:
1. Error is logged with the specific URL that failed
2. Backoff timer increases (5s → 10s → 20s → ... up to 60s max)
3. Next connection attempt uses the **next URL** in the list (round-robin)
4. System continues cycling through URLs until successful connection

### Example Startup Sequence
```
INFO | Connecting to WS: wss://api.mainnet-beta.solana.com
WARNING | Watcher error on wss://api.mainnet-beta.solana.com: HTTP 429 (reconnecting in 5s)
INFO | Connecting to WS: wss://ultra-ultra-fog.solana-mainnet.quiknode.pro/...
WARNING | Watcher error on wss://ultra-ultra-fog.solana-mainnet.quiknode.pro/...: [SSL: TLSV1_ALERT_INTERNAL_ERROR] (reconnecting in 10s)
INFO | Connecting to WS: wss://api.mainnet-beta.solana.com
INFO | Subscribed to program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P (sub 235830257)
INFO | Watcher online.
```

## Benefits

1. **Automatic Recovery**: System recovers from RPC failures without manual intervention
2. **Load Distribution**: HTTP requests distribute across multiple endpoints
3. **Rate Limit Mitigation**: Can cycle between free and paid RPCs to avoid rate limits
4. **High Availability**: Service continues even if one RPC endpoint is down
5. **Easy Configuration**: Just add URLs to comma-separated .env variables

## RPC Endpoint Status

### Public Solana RPC
- **HTTP**: `https://api.mainnet-beta.solana.com`
- **WebSocket**: `wss://api.mainnet-beta.solana.com`
- **Status**: ✅ Working (occasional rate limits)
- **Notes**: Free tier, subject to HTTP 429 errors under load

### QuickNode Premium
- **HTTP**: `https://ultra-ultra-fog.solana-mainnet.quiknode.pro/48fa88a641cbd2a15f2e0c4f8d9c96c41c70fcf5/`
- **WebSocket**: `wss://ultra-ultra-fog.solana-mainnet.quiknode.pro/48fa88a641cbd2a15f2e0c4f8d9c96c41c70fcf5/`
- **Status**: ❌ SSL/TLS errors
- **Notes**: Endpoint format or credentials may need verification with QuickNode support

## Future Enhancements

1. **Health Checks**: Pre-validate RPC endpoints before use
2. **Smart Routing**: Prioritize faster/more reliable endpoints
3. **Circuit Breaker**: Temporarily disable consistently failing endpoints
4. **Metrics**: Track success rate per endpoint
5. **Dynamic Failover**: Adjust order based on performance

## Testing

Test RPC failover by:
1. Setting multiple URLs in `.env`
2. Intentionally break one endpoint (e.g., invalid URL)
3. Monitor logs to see automatic failover to next URL
4. Verify transactions continue being captured

## Troubleshooting

### QuickNode SSL Errors
If seeing `[SSL: TLSV1_ALERT_INTERNAL_ERROR]`:
- Verify endpoint URL format with QuickNode documentation
- Check if trailing slash is required
- Confirm API key/credentials are active
- Test with HTTP probe:
  ```bash
  curl -sS "https://ultra-ultra-fog.solana-mainnet.quiknode.pro/48fa88a641cbd2a15f2e0c4f8d9c96c41c70fcf5/" \
    -H 'content-type: application/json' \
    --data '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
  ```

### Rate Limit (HTTP 429)
- Add more RPC endpoints to `.env`
- Consider upgrading to paid RPC tier
- Reduce subscription count (fewer programs to watch)

### Connection Timeout
- Increase `ping_interval` and `ping_timeout` in WebSocket connection
- Check firewall/network settings
- Verify RPC endpoint is reachable: `telnet <host> 443`

---

**Last Updated**: 2025-12-04  
**Status**: ✅ Production Ready
