# Swap Engine Usage Guide

Complete guide for using the Jupiter + Jito swap infrastructure.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Basic Swap Flow](#basic-swap-flow)
3. [Advanced Features](#advanced-features)
4. [Error Handling](#error-handling)
5. [UI Integration Examples](#ui-integration-examples)

---

## 🚀 Quick Start

### Installation Requirements

```bash
npm install @solana/web3.js @solana/wallet-adapter-react
```

### Basic Setup

```tsx
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSwapEngine, TOKEN_MINTS, DEFAULT_SLIPPAGE } from '../swap';

function SwapComponent() {
  const wallet = useWallet();
  const connection = new Connection(
    'https://api.mainnet-beta.solana.com',
    'confirmed'
  );

  const {
    fetchRoutes,
    executeSwap,
    bestRoute,
    isLoadingRoutes,
    isExecutingSwap,
    error,
  } = useSwapEngine({ connection, wallet });

  const handleSwap = async () => {
    // 1. Fetch routes
    await fetchRoutes({
      inputMint: TOKEN_MINTS.SOL,
      outputMint: TOKEN_MINTS.USDC,
      amountIn: 1_000_000_000, // 1 SOL in lamports
      slippage: DEFAULT_SLIPPAGE.MEDIUM, // 0.5%
      priorityFee: 100000, // 0.0001 SOL
      useJito: true,
    });

    // 2. Execute with best route
    const result = await executeSwap();
    console.log('Swap successful:', result.signature);
  };

  return (
    <button onClick={handleSwap} disabled={isLoadingRoutes || isExecutingSwap}>
      {isExecutingSwap ? 'Swapping...' : 'Swap SOL → USDC'}
    </button>
  );
}
```

---

## 🔄 Basic Swap Flow

### Step 1: Fetch Routes

```tsx
const swapRequest: SwapRequest = {
  inputMint: 'So11111111111111111111111111111111111111112', // SOL
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountIn: 1_000_000_000, // 1 SOL
  slippage: 50, // 0.5% in basis points
  priorityFee: 100000, // Optional: 0.0001 SOL
  useJito: true, // Enable Jito MEV protection
};

const routeResponse = await fetchRoutes(swapRequest);

console.log('Best route:', routeResponse.bestRoute);
console.log('Price impact:', routeResponse.bestRoute.priceImpact, '%');
console.log('Expected output:', routeResponse.bestRoute.outAmount);
```

### Step 2: Review Route

```tsx
{bestRoute && (
  <div>
    <p>Route: {bestRoute.marketInfos.map(m => m.label).join(' → ')}</p>
    <p>Input: {formatAmount(bestRoute.inAmount)} SOL</p>
    <p>Output: {formatAmount(bestRoute.outAmount)} USDC</p>
    <p>Price Impact: {bestRoute.priceImpact.toFixed(2)}%</p>
  </div>
)}
```

### Step 3: Execute Swap

```tsx
try {
  const result = await executeSwap();
  
  console.log('✅ Swap successful!');
  console.log('Signature:', result.signature);
  console.log('Output amount:', result.outputAmount);
  console.log('Total fees:', result.fees.totalFees, 'SOL');
  
  // Show success notification
  toast.success(`Swapped successfully! TX: ${result.signature.slice(0, 8)}...`);
} catch (error) {
  console.error('Swap failed:', error);
  toast.error('Swap failed: ' + error.message);
}
```

---

## ⚡ Advanced Features

### 1. Custom Priority Fees

```tsx
import { DEFAULT_PRIORITY_FEE } from '../swap';

// Different priority levels
const LOW_PRIORITY = DEFAULT_PRIORITY_FEE.LOW;      // ~0.00005 SOL
const MEDIUM_PRIORITY = DEFAULT_PRIORITY_FEE.MEDIUM; // ~0.0001 SOL
const HIGH_PRIORITY = DEFAULT_PRIORITY_FEE.HIGH;     // ~0.0005 SOL
const TURBO_PRIORITY = DEFAULT_PRIORITY_FEE.TURBO;   // ~0.001 SOL

await fetchRoutes({
  ...swapRequest,
  priorityFee: TURBO_PRIORITY, // Use for new token snipes
});
```

### 2. Jito MEV Protection

```tsx
import { DEFAULT_JITO_TIP } from '../swap';

// Enable Jito with custom tip
await fetchRoutes({
  ...swapRequest,
  useJito: true,
  jitoTipAmount: DEFAULT_JITO_TIP.HIGH, // 0.01 SOL tip
});
```

### 3. Slippage Validation

```tsx
const { validateSlippage } = useSwapEngine({ connection, wallet });

// After swap execution
const isValid = validateSlippage(
  bestRoute.outAmount,     // Expected output
  result.outputAmount,     // Actual output
  swapRequest.slippage     // Slippage tolerance
);

if (!isValid) {
  console.warn('Slippage exceeded tolerance!');
}
```

### 4. Route Refresh

```tsx
// Auto-refresh routes every 10 seconds
useEffect(() => {
  if (!bestRoute) return;
  
  const interval = setInterval(() => {
    refreshRoutes();
  }, 10000);
  
  return () => clearInterval(interval);
}, [bestRoute, refreshRoutes]);
```

### 5. Multiple Route Selection

```tsx
const { routes } = useSwapEngine({ connection, wallet });

// Show all routes to user
{routes.map((route, index) => (
  <div key={route.id}>
    <p>Route {index + 1}: {formatRoute(route)}</p>
    <p>Output: {route.outAmount}</p>
    <p>Impact: {route.priceImpact.toFixed(2)}%</p>
    <button onClick={() => executeSwap(route)}>
      Use this route
    </button>
  </div>
))}
```

---

## 🛡️ Error Handling

### Error Types

```tsx
import { SwapErrorCode } from '../swap';

if (error) {
  switch (error.code) {
    case SwapErrorCode.WALLET_NOT_CONNECTED:
      // Prompt user to connect wallet
      break;
      
    case SwapErrorCode.INSUFFICIENT_BALANCE:
      // Show insufficient balance message
      break;
      
    case SwapErrorCode.ROUTE_NOT_FOUND:
      // No routes available (token might be unliquid)
      break;
      
    case SwapErrorCode.SLIPPAGE_EXCEEDED:
      // Slippage too high - suggest increasing tolerance
      break;
      
    case SwapErrorCode.TRANSACTION_FAILED:
      // Transaction failed on-chain
      break;
      
    case SwapErrorCode.NETWORK_ERROR:
      // Network/RPC issues
      break;
      
    default:
      // Unknown error
      break;
  }
}
```

### Comprehensive Error Handling

```tsx
try {
  await fetchRoutes(swapRequest);
  const result = await executeSwap();
  
  // Success flow
  onSwapSuccess(result);
} catch (error) {
  if (error.code === SwapErrorCode.WALLET_NOT_CONNECTED) {
    toast.error('Please connect your wallet');
    openWalletModal();
  } else if (error.code === SwapErrorCode.ROUTE_NOT_FOUND) {
    toast.error('No swap routes found - token may have no liquidity');
  } else {
    toast.error(`Swap failed: ${error.message}`);
    console.error('Swap error:', error);
  }
}
```

---

## 🎨 UI Integration Examples

### Complete Swap Widget

```tsx
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import {
  useSwapEngine,
  TOKEN_MINTS,
  DEFAULT_SLIPPAGE,
  DEFAULT_PRIORITY_FEE,
} from '../swap';

function SwapWidget() {
  const wallet = useWallet();
  const connection = new Connection(RPC_URL, 'confirmed');
  
  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE.MEDIUM);
  const [useJito, setUseJito] = useState(true);
  
  const {
    fetchRoutes,
    executeSwap,
    bestRoute,
    result,
    error,
    isLoadingRoutes,
    isExecutingSwap,
    canExecuteSwap,
  } = useSwapEngine({ connection, wallet });

  const handleFetchRoutes = async () => {
    if (!inputAmount) return;
    
    const amountInLamports = parseFloat(inputAmount) * 1e9;
    
    await fetchRoutes({
      inputMint: TOKEN_MINTS.SOL,
      outputMint: TOKEN_MINTS.USDC,
      amountIn: amountInLamports,
      slippage,
      priorityFee: DEFAULT_PRIORITY_FEE.MEDIUM,
      useJito,
    });
  };

  const handleExecuteSwap = async () => {
    try {
      const swapResult = await executeSwap();
      toast.success(`Swap successful! TX: ${swapResult.signature.slice(0, 8)}...`);
    } catch (err) {
      toast.error('Swap failed: ' + err.message);
    }
  };

  return (
    <div className="swap-widget">
      {/* Input */}
      <div>
        <label>You Pay</label>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="0.0"
        />
        <span>SOL</span>
      </div>

      {/* Output */}
      <div>
        <label>You Receive</label>
        <input
          type="text"
          value={bestRoute ? (parseFloat(bestRoute.outAmount) / 1e6).toFixed(2) : '0.0'}
          disabled
        />
        <span>USDC</span>
      </div>

      {/* Settings */}
      <div>
        <label>Slippage: {slippage / 100}%</label>
        <input
          type="range"
          min="10"
          max="500"
          value={slippage}
          onChange={(e) => setSlippage(Number(e.target.value))}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={useJito}
            onChange={(e) => setUseJito(e.target.checked)}
          />
          Use Jito MEV Protection
        </label>
      </div>

      {/* Route Info */}
      {bestRoute && (
        <div className="route-info">
          <p>Route: {bestRoute.marketInfos.map(m => m.label).join(' → ')}</p>
          <p>Price Impact: {bestRoute.priceImpact.toFixed(2)}%</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error">
          {error.message}
        </div>
      )}

      {/* Buttons */}
      <button
        onClick={handleFetchRoutes}
        disabled={!inputAmount || isLoadingRoutes}
      >
        {isLoadingRoutes ? 'Finding routes...' : 'Get Quote'}
      </button>

      <button
        onClick={handleExecuteSwap}
        disabled={!canExecuteSwap}
      >
        {isExecutingSwap ? 'Swapping...' : 'Swap'}
      </button>

      {/* Result */}
      {result && (
        <div className="success">
          ✅ Swap successful!
          <a href={`https://solscan.io/tx/${result.signature}`} target="_blank">
            View Transaction
          </a>
        </div>
      )}
    </div>
  );
}
```

### Token Sniper Component

```tsx
function TokenSniper({ tokenMint }: { tokenMint: string }) {
  const wallet = useWallet();
  const connection = new Connection(RPC_URL);
  
  const { fetchRoutes, executeSwap, bestRoute, isExecutingSwap } = useSwapEngine({
    connection,
    wallet,
  });

  const snipe = async (solAmount: number) => {
    // Fast execution with high priority + Jito
    await fetchRoutes({
      inputMint: TOKEN_MINTS.SOL,
      outputMint: tokenMint,
      amountIn: solAmount * 1e9,
      slippage: DEFAULT_SLIPPAGE.TURBO, // 5% for new tokens
      priorityFee: DEFAULT_PRIORITY_FEE.TURBO, // Max priority
      useJito: true,
      jitoTipAmount: 0.05, // 0.05 SOL tip for MEV protection
    });

    return executeSwap();
  };

  return (
    <div>
      <button onClick={() => snipe(0.1)} disabled={isExecutingSwap}>
        Snipe 0.1 SOL
      </button>
      <button onClick={() => snipe(0.5)} disabled={isExecutingSwap}>
        Snipe 0.5 SOL
      </button>
      <button onClick={() => snipe(1.0)} disabled={isExecutingSwap}>
        Snipe 1.0 SOL
      </button>
    </div>
  );
}
```

---

## 📊 Helper Utilities

### Format Amounts

```tsx
function formatAmount(amountString: string, decimals: number = 9): string {
  const amount = parseFloat(amountString) / Math.pow(10, decimals);
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}
```

### Calculate USD Value

```tsx
async function calculateUsdValue(
  tokenMint: string,
  amount: string,
  jupiterClient: JupiterClient
): Promise<number> {
  const price = await jupiterClient.getTokenPrice(tokenMint);
  if (!price) return 0;
  
  const amountNum = parseFloat(amount);
  return amountNum * price;
}
```

### Format Route Display

```tsx
import { formatRoute } from '../swap';

const routeText = formatRoute(bestRoute);
// Returns: "Direct swap via Raydium" or "Multi-hop: Raydium → Orca"
```

---

## 🎯 Best Practices

1. **Always validate wallet connection** before calling swap functions
2. **Use appropriate slippage** - lower for stable pairs, higher for new tokens
3. **Enable Jito for new tokens** - prevents frontrunning/sandwich attacks
4. **Show price impact warnings** - warn users if impact > 5%
5. **Refresh routes periodically** - every 10-30 seconds for active swaps
6. **Handle all error cases** - provide clear user feedback
7. **Display total fees** - show users the complete cost breakdown
8. **Confirm large swaps** - add confirmation modal for swaps > 1 SOL
9. **Track swap history** - store results for user reference
10. **Test on devnet first** - use devnet for development

---

## 🔗 Integration Checklist

- [ ] Install required dependencies
- [ ] Set up wallet adapter in your app
- [ ] Create Solana connection (RPC endpoint)
- [ ] Import `useSwapEngine` hook
- [ ] Build swap UI component
- [ ] Handle all error states
- [ ] Add loading indicators
- [ ] Test with small amounts first
- [ ] Implement slippage controls
- [ ] Add Jito toggle option
- [ ] Display route information
- [ ] Show fee breakdown
- [ ] Link to transaction explorer

---

## 📞 Support

For issues or questions:
- Check console logs for detailed error messages
- Verify wallet connection and balance
- Ensure token mints are valid Solana addresses
- Test with mock mode enabled first (see `jupiterClient.ts`)

Mock mode is enabled by default - set `USE_MOCK_MODE = false` in `jupiterClient.ts` and `jitoClient.ts` when ready for production.
