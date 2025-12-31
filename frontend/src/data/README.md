# Global Token Data Engine

## Quick Start

```tsx
import { useGlobalTokenData, useFilteredTokenList } from './data';

// In your root component (App.tsx or layout)
function App() {
  const { isLoading, error } = useGlobalTokenData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <YourApp />;
}

// In any child component
function TokenList() {
  const tokens = useFilteredTokenList({
    onlyAlive: true,
    minLiquidity: 1000,
  });
  
  return (
    <div>
      {tokens.map(token => (
        <div key={token.mint}>
          {token.metadata.name} - ${token.market.price}
        </div>
      ))}
    </div>
  );
}
```

## Files

- **tokenTypes.ts** - All TypeScript type definitions
- **tokenNormalizer.ts** - Convert raw API data to unified Token objects
- **mockApi.ts** - Mock API for development (replace with real API later)
- **tokenDataStore.ts** - Zustand store for global state
- **useGlobalTokenData.ts** - Main React hooks
- **index.ts** - Public exports
- **MIGRATION_GUIDE.md** - Complete migration instructions
- **EXAMPLE_EXPLORER_MIGRATION.tsx** - Example of migrating Explorer.tsx

## Main Hooks

### useGlobalTokenData()
Initializes and manages global token data with polling.

```tsx
const { tokens, isLoading, error, refetch } = useGlobalTokenData({
  enabled: true,
  interval: 10000, // Poll every 10 seconds
});
```

### useFilteredTokenList(filters)
Get filtered tokens without managing state.

```tsx
const safeTokens = useFilteredTokenList({
  onlySafe: true,
  minLiquidity: 1000,
  onlyAlive: true,
});
```

### useTokenByMint(mint)
Get a single token by mint address.

```tsx
const token = useTokenByMint('7x1g...k9mP');
```

### useSortedTokens(sortBy, direction)
Get sorted token list.

```tsx
const topTokens = useSortedTokens('marketCap', 'desc');
```

### useTokensByGraduation()
Get tokens grouped by bonding progress.

```tsx
const { newPairs, aboutToGraduate, graduated } = useTokensByGraduation();
```

## Token Type

```typescript
interface Token {
  mint: string; // Primary key
  metadata: {
    name: string;
    symbol: string;
    image?: string;
    decimals: number;
  };
  market: {
    price: number;
    marketCap: number;
    liquidity: number;
    volume24h: number;
    holders?: number;
  };
  bonding: {
    bondingProgress: number; // 0-100
    isMigrated: boolean;
  };
  authorities: {
    mintAuthority: string | null;
    freezeAuthority: string | null;
  };
  lpBurned: boolean;
  mintAuthorityDisabled: boolean;
  freezeAuthorityDisabled: boolean;
  socials: {
    twitter?: string;
    telegram?: string;
  };
  createdAt: number; // Unix timestamp
  ageMinutes: number;
  isAlive: boolean;
  riskScore: number; // 0-100
}
```

## Replacing Mock API

When ready, update `mockApi.ts`:

```typescript
// Old:
export async function fetchTokens() {
  return generateMockData();
}

// New:
export async function fetchTokens() {
  const response = await fetch('/api/tokens');
  return await response.json();
}
```

## Performance

- Zustand store with selectors (minimal re-renders)
- Map-based token lookup (O(1) access)
- Polling updates only changed data
- Filters computed on-demand
- Normalized data structure

## Troubleshooting

**Tokens not loading?**
- Check console for errors
- Verify `useGlobalTokenData()` is called in parent

**Stale data?**
- Enable polling: `useGlobalTokenData({ enabled: true })`
- Adjust interval: `{ interval: 5000 }`

**Type errors?**
- Replace `CoinInfo` with `Token`
- Update field access: `coin.name` → `token.metadata.name`
