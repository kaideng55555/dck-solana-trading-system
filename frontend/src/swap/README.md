# Swap Engine

Complete swap infrastructure using Jupiter V6 aggregator + Jito MEV protection.

## Architecture

```
UI Component
    ↓
useSwapEngine (React Hook)
    ↓
┌───────────────┬─────────────────┐
│               │                 │
Jupiter Client  │   Jito Client   │
(Routing)       │   (MEV Protection)
│               │                 │
└───────────────┴─────────────────┘
    ↓
Solana Network
```

## Files

### `swapTypes.ts`
Type definitions for the entire swap system:
- `SwapRequest` - Input parameters for swap
- `SwapRoute` - Route information from Jupiter
- `SwapResult` - Swap execution result
- `SwapError` - Error handling
- `PriceQuote` - Formatted price data for UI

### `jupiterClient.ts`
Jupiter V6 integration:
- `getRoutes(request)` - Fetch best routes
- `getBestRoute(request)` - Get single best route
- `executeSwap(route, wallet, priorityFee)` - Build swap transaction
- Helper functions for route analysis

### `jitoClient.ts`
Jito MEV protection:
- `prepareJitoTip(amount)` - Configure tip
- `attachJitoTipToTransaction(tx, config)` - Add tip to transaction
- Tip amount presets (LOW, MEDIUM, HIGH, TURBO)
- Smart tip recommendations based on network conditions

### `useSwapEngine.ts`
Main React hook for UI integration:
- `fetchRoute(request)` - Get route from Jupiter
- `executeSwap(params)` - Execute the swap
- `getPriceQuote(route)` - Format quote for display
- Loading states, error handling, wallet validation

## Usage

### 1. Basic Swap Flow

```tsx
import { useSwapEngine } from './swap';

function SwapComponent() {
  const { state, fetchRoute, executeSwap } = useSwapEngine();
  
  // Step 1: Fetch route
  const handleFetchRoute = async () => {
    await fetchRoute({
      inputMint: 'So11111111111111111111111111111111111111112', // SOL
      outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      amountIn: 1000000000, // 1 SOL (in lamports)
      slippage: 1, // 1%
    });
  };
  
  // Step 2: Execute swap
  const handleSwap = async () => {
    if (!state.route) return;
    
    await executeSwap({
      route: state.route,
      priorityFee: 10000, // 0.00001 SOL priority fee
      useJito: true, // Enable MEV protection
    });
  };
  
  return (
    <div>
      {state.isFetchingRoute && <p>Fetching best route...</p>}
      {state.route && (
        <div>
          <p>Route: {state.route.steps.map(s => s.protocol).join(' → ')}</p>
          <p>Output: {parseInt(state.route.outAmount) / 1e6} USDC</p>
          <p>Price Impact: {state.route.priceImpact}%</p>
        </div>
      )}
      <button onClick={handleFetchRoute}>Get Quote</button>
      <button onClick={handleSwap} disabled={!state.route}>
        Swap
      </button>
      {state.result && (
        <p>✅ Swap successful! Signature: {state.result.signature}</p>
      )}
    </div>
  );
}
```

### 2. Advanced: Auto-Refresh Routes

```tsx
useEffect(() => {
  // Refresh route every 10 seconds
  const interval = setInterval(() => {
    refreshRoute();
  }, 10000);
  
  return () => clearInterval(interval);
}, [refreshRoute]);
```

### 3. Price Quote Display

```tsx
const quote = getPriceQuote(state.route);

if (quote) {
  return (
    <div>
      <p>Price: 1 SOL = {quote.pricePerUnit.toFixed(6)} USDC</p>
      <p>Minimum Output: {quote.minimumOutput} USDC</p>
      <p>Route: {quote.routeSummary}</p>
    </div>
  );
}
```

### 4. Jito MEV Protection

```tsx
import { JITO_TIP_AMOUNTS, shouldUseJito } from './swap';

// Recommend Jito for large/popular swaps
const useJito = shouldUseJito(
  swapAmountUsd, // Swap amount in USD
  priceImpact,   // Price impact %
  'high'         // Token popularity
);

// Execute with appropriate tip
await executeSwap({
  route: state.route,
  useJito,
  jitoTipAmount: JITO_TIP_AMOUNTS.HIGH, // 0.0001 SOL
});
```

## Error Handling

```tsx
const { state, clearError } = useSwapEngine();

if (state.error) {
  switch (state.error.code) {
    case 'WALLET_NOT_CONNECTED':
      return <p>Please connect wallet</p>;
    
    case 'INSUFFICIENT_LIQUIDITY':
      return <p>Not enough liquidity. Reduce amount.</p>;
    
    case 'SLIPPAGE_EXCEEDED':
      return <p>Price impact too high. Increase slippage or reduce amount.</p>;
    
    case 'ROUTE_NOT_FOUND':
      return <p>No route found. Try different tokens or amount.</p>;
    
    default:
      return <p>Error: {state.error.message}</p>;
  }
}
```

## Integration with UI

### Step 1: Wrap app with wallet provider

```tsx
import { WalletProvider } from '@solana/wallet-adapter-react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';

<ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
  <WalletProvider wallets={[]}>
    <App />
  </WalletProvider>
</ConnectionProvider>
```

### Step 2: Use swap engine in component

```tsx
import { useSwapEngine } from './swap';

function SwapUI() {
  const { state, fetchRoute, executeSwap, getPriceQuote } = useSwapEngine();
  
  // Your UI logic here
}
```

## Production Checklist

- [ ] Add real Jupiter V6 API integration (currently uses mock fallback)
- [ ] Implement Jito bundle submission (currently logs tip intent)
- [ ] Add transaction retry logic for failed swaps
- [ ] Implement route caching with expiration
- [ ] Add network congestion monitoring for Jito tips
- [ ] Add swap history tracking
- [ ] Implement referral fee support
- [ ] Add multi-hop route visualization
- [ ] Add gas estimation
- [ ] Add token metadata fetching

## API Requirements

### Jupiter V6 API
- Quote endpoint: `https://quote-api.jup.ag/v6/quote`
- Swap endpoint: `https://quote-api.jup.ag/v6/swap`
- No API key required (rate limited)

### Jito (Optional)
- Bundle submission requires Jito RPC endpoint
- Install: `npm install @jito-foundation/jito-ts-rpc`

## Common Issues

### "No routes found"
- Check token mints are valid Solana addresses
- Ensure sufficient liquidity exists
- Reduce swap amount

### "Slippage exceeded"
- Increase slippage tolerance
- Reduce swap amount
- Wait for better market conditions

### "Transaction failed"
- Check wallet has sufficient SOL for fees
- Ensure token accounts exist
- Retry with higher priority fee

## Performance Tips

1. **Debounce route fetching** - Don't fetch on every input change
2. **Cache routes** - Routes valid for ~30 seconds
3. **Refresh periodically** - Auto-refresh every 10-15 seconds
4. **Use Jito selectively** - Only for large swaps or high MEV risk
5. **Optimize priority fees** - Monitor network congestion

## Next Steps

To build the UI:
1. Create `SwapInterface.tsx` component
2. Add token selection with search
3. Add amount input with max button
4. Show price quote and route visualization
5. Add settings panel (slippage, Jito toggle)
6. Show transaction status and history
