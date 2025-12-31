# Global Token Data Engine - Migration Guide

## Overview

The global token data engine provides a centralized data layer for all token information across the app. It replaces local mock data with a unified, normalized data source.

## Architecture

```
src/data/
├── tokenTypes.ts          # TypeScript type definitions
├── tokenNormalizer.ts     # Data normalization logic
├── mockApi.ts            # Temporary mock API (replace with real API)
├── tokenDataStore.ts     # Zustand store (global state)
├── useGlobalTokenData.ts # Main React hooks
└── index.ts              # Public exports
```

## Key Features

✅ **Unified Token Type**: Single `Token` interface used everywhere
✅ **Auto-normalized Data**: Raw API responses automatically converted to `Token` objects
✅ **Global State**: Zustand store with selectors for optimal performance
✅ **Live Updates**: Automatic polling (configurable interval)
✅ **Type Safety**: Full TypeScript support with strict types
✅ **Filtering**: Built-in filter system with 10+ criteria
✅ **Sorting**: Multiple sort options (marketCap, volume, age, risk)
✅ **Computed Fields**: Automatic calculation of risk score, age, migration status
✅ **Error Handling**: Loading and error states managed automatically

## Installation

The data layer is self-contained. No additional dependencies needed (Zustand already installed).

## Basic Usage

### 1. Initialize in Root Component

```tsx
// src/App.tsx or main layout
import { useGlobalTokenData } from './data';

function App() {
  const { tokens, isLoading, error } = useGlobalTokenData({
    enabled: true,
    interval: 10000, // Poll every 10 seconds
  });
  
  if (isLoading) return <div>Loading tokens...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <YourApp tokens={tokens} />;
}
```

### 2. Use in Any Component

```tsx
import { useFilteredTokenList, useTokenByMint } from '../data';

function TokenList() {
  // Get all safe tokens
  const safeTokens = useFilteredTokenList({
    onlySafe: true,
    minLiquidity: 1000,
    onlyAlive: true,
  });
  
  return (
    <div>
      {safeTokens.map(token => (
        <TokenCard key={token.mint} token={token} />
      ))}
    </div>
  );
}

function TokenDetails({ mint }: { mint: string }) {
  const token = useTokenByMint(mint);
  
  if (!token) return <div>Token not found</div>;
  
  return (
    <div>
      <h1>{token.metadata.name}</h1>
      <p>Price: ${token.market.price}</p>
      <p>Market Cap: ${token.market.marketCap.toLocaleString()}</p>
    </div>
  );
}
```

## Migration: Explorer.tsx

### Before (using local mock data):

```tsx
// OLD CODE - Remove this
const [allCoins, setAllCoins] = useState<CoinInfo[]>([]);

useEffect(() => {
  const fetchCoins = async () => {
    setIsLoading(true);
    // ... fetch logic ...
    setAllCoins(generateMockCoins(100));
    setIsLoading(false);
  };
  fetchCoins();
}, []);
```

### After (using global data):

```tsx
// NEW CODE - Add this
import { useGlobalTokenData, useFilteredTokenList, type Token } from '../data';

// Initialize global data (only in root component or layout)
const { isLoading, error } = useGlobalTokenData();

// Access filtered data anywhere
const tokens = useFilteredTokenList({
  onlyAlive: true,
  minLiquidity: 500,
});
```

## Token Type Mapping

The new `Token` type replaces the old `CoinInfo` type:

| Old (CoinInfo) | New (Token) | Notes |
|----------------|-------------|-------|
| `address` | `mint` | Renamed for clarity |
| `name` | `metadata.name` | Nested in metadata |
| `symbol` | `metadata.symbol` | Nested in metadata |
| `logo` | `metadata.image` | Renamed to `image` |
| `marketCap` | `market.marketCap` | Nested in market |
| `price` | `market.price` | Nested in market |
| `volume24h` | `market.volume24h` | Nested in market |
| `bondingProgress` | `bonding.bondingProgress` | Nested in bonding |
| `isMigrated` | `bonding.isMigrated` | Nested in bonding |
| `lpBurned` | `lpBurned` | Top-level boolean |
| `mintDisabled` | `mintAuthorityDisabled` | Renamed |
| `freezeDisabled` | `freezeAuthorityDisabled` | Renamed |
| `alive` | `isAlive` | Renamed |
| `age` (seconds) | `ageMinutes` | Changed to minutes |

## Available Hooks

### Data Access Hooks

- `useGlobalTokenData()` - Main hook, fetches and polls data
- `useTokenByMint(mint)` - Get single token by address
- `useFilteredTokenList(filters)` - Get filtered token array
- `useTokenSearch(query)` - Search by name/symbol/mint
- `useSortedTokens(sortBy, direction)` - Get sorted tokens
- `useTokensByGraduation()` - Get tokens grouped by bonding progress
- `useSafeTokens()` - Get only safe tokens (LP burned + authorities disabled)
- `useHighRiskTokens(threshold)` - Get high-risk tokens

### State Hooks

- `useTokensLoading()` - Get loading state
- `useTokensError()` - Get error state
- `useTokensCount()` - Get total token count
- `useLastFetch()` - Get last fetch timestamp

## Filter Options

```typescript
interface TokenFilters {
  minMarketCap?: number;
  maxMarketCap?: number;
  minLiquidity?: number;
  minVolume24h?: number;
  onlyMigrated?: boolean;
  onlyAlive?: boolean;
  onlySafe?: boolean; // LP burned + authorities disabled
  minAge?: number; // in minutes
  maxAge?: number; // in minutes
  hasTwitter?: boolean;
  hasTelegram?: boolean;
  search?: string; // Search name/symbol/mint
}
```

## Replacing Mock API with Real API

When backend is ready, update `mockApi.ts`:

```typescript
// Replace this:
export async function fetchTokens() {
  await mockDelay(500);
  const tokens = generateMockTokens(100);
  return { success: true, data: tokens };
}

// With this:
export async function fetchTokens() {
  const response = await fetch('/api/tokens');
  const data = await response.json();
  return { success: true, data };
}
```

## Performance Notes

- Store uses Zustand with selectors for minimal re-renders
- Polling only updates changed tokens
- Filters are computed on-demand (not stored)
- Map-based lookup for O(1) token access by mint
- Normalized data reduces memory footprint

## Example: Complete Explorer Migration

See the updated `Explorer.tsx` file for a complete example of migrating from local mock data to the global data layer.

## Troubleshooting

**Q: Tokens not loading?**
A: Check console for API errors. Verify `useGlobalTokenData()` is called in a parent component.

**Q: Stale data?**
A: Check polling is enabled: `useGlobalTokenData({ enabled: true, interval: 10000 })`

**Q: Type errors?**
A: Update `CoinInfo` references to `Token` and adjust nested field access (e.g., `token.name` → `token.metadata.name`)

**Q: Filters not working?**
A: Verify filter keys match `TokenFilters` interface. Use `onlySafe` instead of individual security flags.
