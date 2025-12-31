import asyncio, json, websockets

# Test QuickNode WebSocket connection
WS = "wss://ultra-ultra-fog.solana-mainnet.quiknode.pro/48fa88a641cbd2a15f2e0c4f8d9c96c41c70fcf5"

async def main():
    try:
        async with websockets.connect(WS, ping_interval=20, ping_timeout=20) as ws:
            await ws.send(json.dumps({
                "jsonrpc":"2.0","id":1,"method":"logsSubscribe",
                "params":[{"mentions":["11111111111111111111111111111111"]},{"commitment":"confirmed"}]
            }))
            print("SUB RESP:", await ws.recv())
            print("✅ OK: handshake + subscribe succeeded")
    except Exception as e:
        print(f"❌ ERROR: {e}")

asyncio.run(main())
