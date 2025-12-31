# FeedNormalizer Usage Guide

## Overview
FeedNormalizer converts raw `TokenLiveEntry` updates from LiveFeedEngine into fully enriched, unified `Token` objects ready for UI consumption. It maintains price history, calculates trends, and generates trading signals.

## Quick Start

```typescript
import { Connection } from '@solana/web3.js';
import LiveFeedEngine, { TokenLiveEntry } from '../live/LiveFeedEngine';
import FeedNormalizer from './FeedNormalizer';

// Initialize
const connection = new Connection('https://api.mainnet-beta.solana.com');
const engine = new LiveFeedEngine(connection);
const normalizer = new FeedNormalizer();

// Subscribe to live feed
const mintAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

engine.addSubscription(mintAddress, (update: TokenLiveEntry) => {
  // Normalize the raw update
  const token = normalizer.normalize(update);
  
  console.log('Normalized Token:', {
    mint: token.mint,
    symbol: token.metadata.symbol,
    price: token.market.price,
    marketCap: token.market.marketCap,
    bondingStage: token.bonding.curveStage,
    bondingProgress: token.bonding.bondingProgress,
    velocity: token.bonding.velocityScore,
    riskScore: token.riskScore,
    isAlive: token.isAlive,
  });
  
  // Check for sniper signals
  if (token.bonding.flags?.snipeFresh) {
    console.log('🚨 FRESH TOKEN - Less than 90 seconds old!');
  }
  
  if (token.bonding.flags?.snipeCurveEdge) {
    console.log('🎯 CURVE EDGE - About to graduate!');
  }
  
  // Check trending
  const trendEmoji = token.bonding.curveTrend === 'up' ? '📈' : 
                     token.bonding.curveTrend === 'down' ? '📉' : '➡️';
  console.log(`Trend: ${trendEmoji} ${token.bonding.curveTrend}`);
});
```

## Features

### 1. **Complete Token Enrichment**
Raw `TokenLiveEntry` → Fully normalized `Token` with:
- Metadata (name, symbol, decimals)
- Market data (price, marketCap, liquidity, volume)
- Bonding curve analysis (stage, progress, health, trend)
- Authority analysis (mint/freeze authorities, renounce status)
- Liquidity analysis (health score, LP status, rug risk)
- Risk scoring (0-100 comprehensive risk assessment)

### 2. **Price History Tracking**
- Maintains last 20 price points per token
- Calculates velocity (price momentum)
- Calculates acceleration (rate of momentum change)
- Detects trends (up/down/flat over last 3 points)
- Computes 24h price change percentage

### 3. **Bonding Curve Intelligence**
- **Stage Classification**:
  - `new`: 0-20% progress
  - `mid`: 20-70% progress
  - `late`: 70-99% progress
  - `graduated`: 100%+ (migrated to DEX)

- **Prediction**: Estimates time to graduation in minutes
- **Health Scoring**: 0-100 curve health based on progress, velocity, liquidity
- **Trend Detection**: Identifies if curve is trending up/down/flat

### 4. **Sniper Signal Generation**

```typescript
interface SniperSignals {
  snipeFresh: boolean;        // Token < 90 seconds old
  snipeCurveEdge: boolean;    // Bonding >= 96% & velocity > 1.0
  snipeVolumeSpike: boolean;  // Volume > 2x previous update
}

// Access via bonding.flags
if (token.bonding.flags?.snipeFresh) {
  // Execute snipe strategy for fresh tokens
}

if (token.bonding.flags?.snipeCurveEdge) {
  // Execute curve edge strategy (near graduation)
}
```

### 5. **Trend Signals**

```typescript
// Trending up: Last 3 prices strictly increasing
if (token.bonding.curveTrend === 'up') {
  console.log('Token trending up! 📈');
}

// Trending down: Last 3 prices strictly decreasing
if (token.bonding.curveTrend === 'down') {
  console.log('Token trending down! 📉');
}
```

### 6. **Risk Assessment**
Comprehensive 0-100 risk score considering:
- Authority status (mint/freeze authorities active = high risk)
- LP status (not burned/locked = high risk)
- Token age (< 5 min = high risk)
- Liquidity depth (< $500 = high risk)
- Authority risk score from analyzer
- Liquidity health score

```typescript
if (token.riskScore > 70) {
  console.log('⚠️ HIGH RISK TOKEN - Proceed with caution!');
}

if (token.rugLikely) {
  console.log('🚨 RUG PULL LIKELY - DO NOT APE!');
}
```

## API Reference

### Constructor
```typescript
new FeedNormalizer()
```
No configuration needed. Initializes empty state.

### Methods

#### `normalize(update: TokenLiveEntry): Token`
Main method. Converts raw live feed update to enriched Token.

**Returns**: Fully normalized `Token` object with:
- All required fields populated
- Price history updated
- Signals calculated
- Risk scores computed

#### `getSnapshot(mint: string): Token | undefined`
Get last normalized token for a specific mint address.

```typescript
const token = normalizer.getSnapshot(mintAddress);
if (token) {
  console.log('Last known state:', token);
}
```

#### `getAll(): Token[]`
Get all currently tracked tokens.

```typescript
const allTokens = normalizer.getAll();
console.log(`Tracking ${allTokens.length} tokens`);
```

#### `reset(): void`
Clear all internal state (price history, snapshots).

```typescript
normalizer.reset();
```

#### `getTrackedCount(): number`
Get number of mints being tracked.

```typescript
console.log(`Tracking ${normalizer.getTrackedCount()} mints`);
```

## Integration Patterns

### Pattern 1: Real-Time UI Updates

```typescript
import { useState, useEffect } from 'react';

export function useLiveToken(mint: string) {
  const [token, setToken] = useState<Token | null>(null);
  const [normalizer] = useState(() => new FeedNormalizer());

  useEffect(() => {
    const engine = new LiveFeedEngine(connection);
    
    engine.addSubscription(mint, (update) => {
      const normalized = normalizer.normalize(update);
      setToken(normalized);
    });

    return () => {
      engine.removeSubscription(mint, callback);
    };
  }, [mint]);

  return token;
}
```

### Pattern 2: Multi-Token Dashboard

```typescript
import { create } from 'zustand';

interface LiveFeedStore {
  tokens: Map<string, Token>;
  normalizer: FeedNormalizer;
  subscribe: (mint: string) => void;
  unsubscribe: (mint: string) => void;
}

export const useLiveFeedStore = create<LiveFeedStore>((set, get) => ({
  tokens: new Map(),
  normalizer: new FeedNormalizer(),
  
  subscribe: (mint) => {
    const { normalizer } = get();
    
    engine.addSubscription(mint, (update) => {
      const token = normalizer.normalize(update);
      
      set((state) => {
        const newTokens = new Map(state.tokens);
        newTokens.set(mint, token);
        return { tokens: newTokens };
      });
    });
  },
  
  unsubscribe: (mint) => {
    set((state) => {
      const newTokens = new Map(state.tokens);
      newTokens.delete(mint);
      return { tokens: newTokens };
    });
  },
}));
```

### Pattern 3: Alert System Integration

```typescript
import { useAlertsStore } from './stores/alertsStore';

const normalizer = new FeedNormalizer();

engine.addSubscription(mint, (update) => {
  const token = normalizer.normalize(update);
  const alerts = useAlertsStore.getState();
  
  // Sniper alerts
  if (token.bonding.flags?.snipeFresh) {
    alerts.addAlert({
      type: 'sniper',
      level: 'success',
      message: `Fresh token detected: ${token.metadata.symbol}`,
      data: { mint: token.mint },
    });
  }
  
  if (token.bonding.flags?.snipeCurveEdge) {
    alerts.addAlert({
      type: 'sniper',
      level: 'warning',
      message: `Curve edge: ${token.metadata.symbol} at ${token.bonding.bondingProgress}%`,
      data: { mint: token.mint },
    });
  }
  
  // Risk alerts
  if (token.rugLikely) {
    alerts.addAlert({
      type: 'rug',
      level: 'danger',
      message: `⚠️ RUG RISK: ${token.metadata.symbol}`,
      data: { mint: token.mint, riskScore: token.riskScore },
    });
  }
});
```

## Data Flow

```
LiveFeedEngine
    ↓ (TokenLiveEntry - raw data)
FeedNormalizer.normalize()
    ↓ (Token - enriched data)
UI Components / Zustand Store
```

## Performance Characteristics

- **Memory**: ~2KB per tracked token (includes 20-point price history)
- **CPU**: Minimal - simple calculations per update
- **History Management**: Automatic trimming to 20 points max
- **State Isolation**: Each mint tracked independently

## Advanced Features

### Custom Bonding Prediction

```typescript
const token = normalizer.normalize(update);

if (token.bonding.estimatedGraduationTime < 10) {
  console.log(`🚀 GRADUATING IN ${token.bonding.estimatedGraduationTime} MINUTES!`);
}
```

### Liquidity Health Monitoring

```typescript
if (token.liquidityHealth < 30) {
  console.log('⚠️ Low liquidity health - potential rug risk');
}

if (token.lpRemoved) {
  console.log('🚨 LP REMOVED - RUG PULL CONFIRMED!');
}

if (token.whaleExitSpike) {
  console.log('🐋 Whale dumping detected!');
}
```

### Authority Analysis

```typescript
if (!token.isFullyRenounced) {
  console.log('⚠️ Authorities not renounced');
}

if (token.fakeRenounceDetected) {
  console.log('🚨 FAKE RENOUNCE DETECTED!');
}

if (token.isMigratedEligible) {
  console.log('✅ Safe for migration - fully renounced + LP secured');
}
```

### Volume Spike Detection

```typescript
if (token.bonding.flags?.snipeVolumeSpike) {
  console.log('📊 Volume spike detected - 2x increase!');
  console.log(`24h Volume: $${token.market.volume24h.toFixed(2)}`);
}
```

## Testing

```typescript
// Create test instance
const normalizer = new FeedNormalizer();

// Test normalization
const testUpdate: TokenLiveEntry = {
  mint: 'TEST_MINT_ADDRESS',
  symbol: 'TEST',
  price: 0.00001,
  marketCap: 50000,
  volume24h: 1000,
  liq: 2500,
  createdAt: Date.now() - 60000, // 1 minute ago
  ageSeconds: 60,
  bondingProgress: 45,
  velocity: 2.5,
  risks: {
    liquidity: 'LOW',
    authority: 'SAFE',
  },
};

const token = normalizer.normalize(testUpdate);

console.assert(token.mint === 'TEST_MINT_ADDRESS');
console.assert(token.bonding.curveStage === 'mid'); // 45% = mid stage
console.assert(token.ageMinutes === 1);
console.assert(token.isAlive === true);

console.log('✅ All tests passed');
```

## Troubleshooting

### Issue: Velocity always returns 0
**Solution**: Need at least 2 price points. First update will have velocity=0. Second update onwards will calculate velocity.

### Issue: Trends not detecting
**Solution**: Need at least 3 price points for trend detection. Wait for 3+ updates.

### Issue: Memory growing unbounded
**Solution**: Price history automatically trimmed to 20 points. If tracking 1000+ mints, consider calling `reset()` periodically to clear inactive tokens.

### Issue: Risk scores seem high
**Solution**: Risk scoring is intentionally conservative. New tokens (<5 min) get +15 risk points. Check individual flags (lpBurned, authorities, etc.) for details.

## Best Practices

1. **Single Normalizer Instance**: Create one FeedNormalizer per LiveFeedEngine
2. **Snapshot Access**: Use `getSnapshot()` to retrieve last known state without re-normalization
3. **State Persistence**: Consider serializing `getAll()` to localStorage for session persistence
4. **Alert Throttling**: Use alert system's built-in throttling, not manual checks
5. **Memory Management**: Call `reset()` when unmounting dashboard or switching contexts

## License
MIT - Part of DCK Tools trading platform.
