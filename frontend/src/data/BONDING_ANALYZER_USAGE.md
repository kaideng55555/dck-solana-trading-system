# Bonding Analyzer Integration Guide

## Overview

The bonding analyzer provides sophisticated metrics for token bonding curves, including lifecycle stages, health scores, graduation predictions, and risk flags.

## Updated Token Structure

All tokens now include enhanced bonding metrics:

```typescript
interface Token {
  bonding: {
    // Core metrics
    bondingProgress: number;              // 0-100
    isMigrated: boolean;
    
    // ✨ NEW: Enhanced analysis
    curveStage: 'new' | 'ramping' | 'peak' | 'graduated';
    isCloseToMigration: boolean;          // Within 15% of graduation
    liquidityScore: number;               // 0-100 liquidity health
    curveHealth: number;                  // 0-100 overall health
    curveTrend: 'up' | 'down' | 'flat';
    estimatedGraduationTime: number;      // Minutes until graduation
    velocityScore: number;                // 0-100 growth rate
    stabilityScore: number;               // 0-100 price stability
    buyPressureRatio: number;             // 0-200 (100 = balanced)
    
    flags: {
      lowLiquidity: boolean;
      abnormalBuyPressure: boolean;
      abnormalSellPressure: boolean;
      curveFlattening: boolean;
      migrationLikely: boolean;
      rugRisk: boolean;
      healthyCurve: boolean;
    };
  };
}
```

## Curve Stages Explained

### 🌱 New (0-30%)
- Just launched
- High volatility expected
- Building initial liquidity
- High risk, high reward

### 📈 Ramping (30-70%)
- Active growth phase
- Volume increasing
- Curve trending upward
- Moderate risk

### 🔥 Peak (70-95%)
- Near graduation
- High liquidity
- Stable or flattening
- Lower risk, preparing for migration

### 🎓 Graduated (95-100%)
- Migrated to Raydium or other DEX
- Bonding curve complete
- LP typically locked/burned
- Lowest risk (if authorities disabled)

## Usage in Explorer.tsx

### 1. Categorize Tokens by Curve Stage (Recommended)

**BEFORE:**
```tsx
// Old: Group by simple bondingProgress thresholds
const newPairs = tokens.filter(t => t.bonding.bondingProgress < 40);
const aboutToGraduate = tokens.filter(t => 
  t.bonding.bondingProgress >= 40 && t.bonding.bondingProgress < 90
);
const graduated = tokens.filter(t => t.bonding.bondingProgress >= 90);
```

**AFTER:**
```tsx
// ✨ New: Group by intelligent curve stages
const newTokens = tokens.filter(t => t.bonding.curveStage === 'new');
const rampingTokens = tokens.filter(t => t.bonding.curveStage === 'ramping');
const peakTokens = tokens.filter(t => t.bonding.curveStage === 'peak');
const graduatedTokens = tokens.filter(t => t.bonding.curveStage === 'graduated');
```

### 2. Display Curve Stage in UI

```tsx
import { getCurveStageEmoji, getCurveStageDescription } from '../data';

function TokenCard({ token }: { token: Token }) {
  const stage = token.bonding.curveStage;
  
  return (
    <div className="token-card">
      {/* Stage badge */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{getCurveStageEmoji(stage)}</span>
        <span className="text-sm font-medium">
          {getCurveStageDescription(stage)}
        </span>
      </div>
      
      {/* Progress bar with stage-based color */}
      <div className="progress-bar">
        <div 
          className={`progress-fill ${getStageColor(stage)}`}
          style={{ width: `${token.bonding.bondingProgress}%` }}
        />
      </div>
      
      {/* Health indicators */}
      <div className="flex gap-2 text-xs">
        <span>Health: {token.bonding.curveHealth}%</span>
        <span>Liquidity: {token.bonding.liquidityScore}%</span>
        {token.bonding.flags?.healthyCurve && (
          <span className="text-green-400">✓ Healthy</span>
        )}
      </div>
    </div>
  );
}

function getStageColor(stage: CurveStage): string {
  switch (stage) {
    case 'new': return 'bg-cyan-500';      // New = cyan
    case 'ramping': return 'bg-green-500'; // Ramping = green
    case 'peak': return 'bg-yellow-500';   // Peak = yellow
    case 'graduated': return 'bg-purple-500'; // Graduated = purple
  }
}
```

### 3. Show Graduation Countdown

```tsx
function GraduationCountdown({ token }: { token: Token }) {
  const { estimatedGraduationTime, isCloseToMigration } = token.bonding;
  
  if (token.bonding.isMigrated) {
    return <span className="text-purple-400">🎓 Graduated</span>;
  }
  
  if (isCloseToMigration && estimatedGraduationTime < 60) {
    return (
      <span className="text-yellow-400 animate-pulse">
        ⚡ Graduating in ~{estimatedGraduationTime}m
      </span>
    );
  }
  
  if (estimatedGraduationTime < 1440) { // Less than 24 hours
    const hours = Math.floor(estimatedGraduationTime / 60);
    return (
      <span className="text-cyan-400">
        📈 Est. {hours}h to graduation
      </span>
    );
  }
  
  return null;
}
```

### 4. Display Risk Flags

```tsx
function RiskIndicators({ token }: { token: Token }) {
  const flags = token.bonding.flags;
  
  return (
    <div className="flex flex-wrap gap-2">
      {flags?.healthyCurve && (
        <Badge color="green">✓ Healthy Curve</Badge>
      )}
      {flags?.lowLiquidity && (
        <Badge color="red">⚠️ Low Liquidity</Badge>
      )}
      {flags?.rugRisk && (
        <Badge color="red">🚨 Rug Risk</Badge>
      )}
      {flags?.abnormalBuyPressure && (
        <Badge color="yellow">📈 High Buy Pressure</Badge>
      )}
      {flags?.abnormalSellPressure && (
        <Badge color="orange">📉 High Sell Pressure</Badge>
      )}
      {flags?.migrationLikely && (
        <Badge color="purple">🎓 Migration Soon</Badge>
      )}
      {flags?.curveFlattening && (
        <Badge color="gray">→ Flattening</Badge>
      )}
    </div>
  );
}
```

### 5. Sort by Curve Metrics

```tsx
// Sort by curve health
const healthiestTokens = [...tokens].sort((a, b) => 
  (b.bonding.curveHealth || 0) - (a.bonding.curveHealth || 0)
);

// Sort by velocity (fastest growing)
const fastestGrowing = [...tokens].sort((a, b) => 
  (b.bonding.velocityScore || 0) - (a.bonding.velocityScore || 0)
);

// Sort by stability (most stable)
const mostStable = [...tokens].sort((a, b) => 
  (b.bonding.stabilityScore || 0) - (a.bonding.stabilityScore || 0)
);

// Sort by graduation time (closest to graduating)
const nextToGraduate = [...tokens]
  .filter(t => !t.bonding.isMigrated)
  .sort((a, b) => 
    (a.bonding.estimatedGraduationTime || 999999) - 
    (b.bonding.estimatedGraduationTime || 999999)
  );
```

### 6. Filter by Curve Stage

```tsx
// Filter dropdown or tabs
const [selectedStage, setSelectedStage] = useState<CurveStage | 'all'>('all');

const filteredTokens = selectedStage === 'all' 
  ? tokens 
  : tokens.filter(t => t.bonding.curveStage === selectedStage);

// UI
<select value={selectedStage} onChange={e => setSelectedStage(e.target.value)}>
  <option value="all">All Stages</option>
  <option value="new">🌱 New (0-30%)</option>
  <option value="ramping">📈 Ramping (30-70%)</option>
  <option value="peak">🔥 Peak (70-95%)</option>
  <option value="graduated">🎓 Graduated (100%)</option>
</select>
```

### 7. Health-Based Filtering

```tsx
// Only show healthy tokens
const healthyTokens = tokens.filter(t => 
  t.bonding.flags?.healthyCurve && 
  !t.bonding.flags?.rugRisk
);

// Only show high-growth tokens
const highGrowthTokens = tokens.filter(t => 
  t.bonding.velocityScore && t.bonding.velocityScore > 50 &&
  t.bonding.curveTrend === 'up'
);

// Safe tokens near graduation
const safeGraduationCandidates = tokens.filter(t => 
  t.bonding.curveStage === 'peak' &&
  t.bonding.flags?.healthyCurve &&
  t.lpBurned &&
  t.mintAuthorityDisabled
);
```

### 8. Trend Indicator

```tsx
import { getCurveTrendEmoji } from '../data';

function TrendIndicator({ token }: { token: Token }) {
  const { curveTrend, bondingProgress } = token.bonding;
  
  if (token.bonding.isMigrated) {
    return <span className="text-purple-400">🎓 Graduated</span>;
  }
  
  const trendEmoji = getCurveTrendEmoji(curveTrend);
  const trendColor = curveTrend === 'up' ? 'text-green-400' : 
                     curveTrend === 'down' ? 'text-red-400' : 
                     'text-gray-400';
  
  return (
    <span className={trendColor}>
      {trendEmoji} {curveTrend.toUpperCase()} - {bondingProgress.toFixed(1)}%
    </span>
  );
}
```

## Recommended Explorer Layout

```tsx
function Explorer() {
  const tokens = useFilteredTokenList({ onlyAlive: true });
  
  // Group by stage
  const tokensByStage = {
    new: tokens.filter(t => t.bonding.curveStage === 'new'),
    ramping: tokens.filter(t => t.bonding.curveStage === 'ramping'),
    peak: tokens.filter(t => t.bonding.curveStage === 'peak'),
    graduated: tokens.filter(t => t.bonding.curveStage === 'graduated'),
  };
  
  return (
    <div className="explorer">
      {/* New Launches Section */}
      <Section title="🌱 New Launches" count={tokensByStage.new.length}>
        <TokenGrid tokens={tokensByStage.new} />
      </Section>
      
      {/* Ramping Up Section */}
      <Section title="📈 Ramping Up" count={tokensByStage.ramping.length}>
        <TokenGrid tokens={tokensByStage.ramping} />
      </Section>
      
      {/* Peak / Near Graduation Section */}
      <Section title="🔥 Near Graduation" count={tokensByStage.peak.length}>
        <TokenGrid tokens={tokensByStage.peak} />
      </Section>
      
      {/* Graduated Section */}
      <Section title="🎓 Graduated" count={tokensByStage.graduated.length}>
        <TokenGrid tokens={tokensByStage.graduated} />
      </Section>
    </div>
  );
}
```

## Key Metrics Explained

### Curve Health (0-100)
- Combines: liquidity score, progress position, security flags, age
- 70+: Healthy curve, low risk
- 40-69: Moderate health
- <40: Concerning, review flags

### Liquidity Score (0-100)
- Based on: liquidity amount + volume/liquidity ratio
- 60+: Excellent liquidity
- 40-59: Adequate liquidity
- <40: Low liquidity risk

### Velocity Score (0-100)
- Measures: growth rate (progress per minute × volume multiplier)
- 70+: Very fast growth
- 30-69: Moderate growth
- <30: Slow growth

### Stability Score (0-100)
- Measures: price stability vs volume
- 80+: Very stable
- 50-79: Moderate volatility
- <50: High volatility

### Buy Pressure Ratio (0-200)
- 100 = balanced buy/sell
- >130 = strong buy pressure
- <70 = strong sell pressure

## Migration Checklist for Explorer.tsx

- [ ] Replace `bondingProgress` thresholds with `curveStage` checks
- [ ] Update section headers to use curve stage emojis
- [ ] Add health score indicators to cards
- [ ] Show graduation countdown for peak tokens
- [ ] Display risk flags for low-health tokens
- [ ] Add sort option for curve health
- [ ] Add filter for healthy curves only
- [ ] Show trend indicator (up/down/flat)
- [ ] Highlight tokens near graduation
- [ ] Add tooltip with full bonding metrics

## Example: Complete Token Card

```tsx
function EnhancedTokenCard({ token }: { token: Token }) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3>{token.metadata.name}</h3>
          <span className="text-gray-400">{token.metadata.symbol}</span>
        </div>
        <span className="text-2xl">{getCurveStageEmoji(token.bonding.curveStage)}</span>
      </div>
      
      {/* Stage & Trend */}
      <div className="flex items-center gap-2 text-sm">
        <span>{getCurveStageDescription(token.bonding.curveStage)}</span>
        <span>{getCurveTrendEmoji(token.bonding.curveTrend)}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-container">
        <div 
          className={`progress ${getStageColor(token.bonding.curveStage)}`}
          style={{ width: `${token.bonding.bondingProgress}%` }}
        />
        <span className="progress-text">{token.bonding.bondingProgress.toFixed(1)}%</span>
      </div>
      
      {/* Metrics */}
      <div className="metrics-grid">
        <Metric label="Health" value={token.bonding.curveHealth} suffix="%" />
        <Metric label="Liquidity" value={token.bonding.liquidityScore} suffix="%" />
        <Metric label="Velocity" value={token.bonding.velocityScore} suffix="%" />
        <Metric label="Stability" value={token.bonding.stabilityScore} suffix="%" />
      </div>
      
      {/* Graduation Info */}
      {token.bonding.isCloseToMigration && !token.bonding.isMigrated && (
        <div className="graduation-alert">
          ⚡ Graduating in ~{token.bonding.estimatedGraduationTime}m
        </div>
      )}
      
      {/* Risk Flags */}
      <RiskIndicators token={token} />
      
      {/* Market Data */}
      <div className="market-data">
        <div>MC: ${token.market.marketCap.toLocaleString()}</div>
        <div>Vol: ${token.market.volume24h.toLocaleString()}</div>
      </div>
    </div>
  );
}
```

## Benefits

✅ **Better UX**: Users see meaningful stages instead of raw percentages
✅ **Risk Awareness**: Clear flags for risky tokens
✅ **Predictive**: Graduation time estimates help timing
✅ **Comprehensive**: 10+ metrics for informed decisions
✅ **Automated**: All metrics computed automatically
