# Bonding Curve Analyzer - Quick Reference

## What It Does

Analyzes token bonding curves and provides:
- **Lifecycle stage** detection (new → ramping → peak → graduated)
- **Health scores** (curve health, liquidity score, stability)
- **Graduation prediction** (estimated time to migration)
- **Risk flags** (rug risk, low liquidity, abnormal pressure)
- **Growth metrics** (velocity, trend, buy/sell pressure)

## Core Metrics

| Metric | Range | Good Value | Description |
|--------|-------|------------|-------------|
| `bondingProgress` | 0-100 | Any | Percentage to graduation |
| `curveHealth` | 0-100 | 70+ | Overall curve health |
| `liquidityScore` | 0-100 | 60+ | Liquidity sufficiency |
| `velocityScore` | 0-100 | 30+ | Growth rate |
| `stabilityScore` | 0-100 | 50+ | Price stability |
| `buyPressureRatio` | 0-200 | 80-120 | Buy/sell balance |
| `estimatedGraduationTime` | minutes | <1440 | Time to graduate |

## Curve Stages

```
🌱 New (0-30%)
   - Just launched
   - Building liquidity
   - High risk/reward

📈 Ramping (30-70%)
   - Active growth
   - Volume increasing
   - Moderate risk

🔥 Peak (70-95%)
   - Near graduation
   - High liquidity
   - Lower risk

🎓 Graduated (95-100%)
   - Migrated to DEX
   - LP locked/burned
   - Lowest risk
```

## Risk Flags

| Flag | Meaning | Risk Level |
|------|---------|------------|
| `healthyCurve` | All metrics good | ✅ Safe |
| `lowLiquidity` | Insufficient liquidity | ⚠️ Medium |
| `rugRisk` | Multiple red flags | 🚨 High |
| `migrationLikely` | Near graduation | ℹ️ Info |
| `abnormalBuyPressure` | Unusual buying | ⚠️ Medium |
| `abnormalSellPressure` | Unusual selling | ⚠️ Medium |
| `curveFlattening` | Stalled growth | ⚠️ Medium |

## Usage

### Basic Analysis

```typescript
import { analyzeBondingCurve } from './data';

const bondingInfo = analyzeBondingCurve(rawToken);

console.log(bondingInfo.curveStage);         // 'ramping'
console.log(bondingInfo.curveHealth);        // 75
console.log(bondingInfo.estimatedGraduationTime); // 180 (minutes)
```

### In Token Normalization (Automatic)

```typescript
// Already integrated! Just use normalized tokens:
const token = normalizeToken(rawToken);

console.log(token.bonding.curveStage);       // 'peak'
console.log(token.bonding.curveHealth);      // 82
console.log(token.bonding.flags.healthyCurve); // true
```

### Display in UI

```tsx
import { getCurveStageEmoji, getCurveStageDescription } from './data';

function TokenCard({ token }) {
  return (
    <div>
      <span>{getCurveStageEmoji(token.bonding.curveStage)}</span>
      <span>{getCurveStageDescription(token.bonding.curveStage)}</span>
      <span>Health: {token.bonding.curveHealth}%</span>
      
      {token.bonding.flags?.healthyCurve && (
        <span className="text-green">✓ Healthy</span>
      )}
      {token.bonding.flags?.rugRisk && (
        <span className="text-red">⚠️ High Risk</span>
      )}
    </div>
  );
}
```

## Health Score Interpretation

### Curve Health (0-100)
- **90-100**: Excellent - All metrics optimal
- **70-89**: Good - Safe to trade
- **50-69**: Fair - Some concerns
- **30-49**: Poor - High risk
- **0-29**: Critical - Avoid

Calculated from:
- Liquidity score (30%)
- Progress position (20%)
- Security flags (30%)
- Token age (20%)

### Liquidity Score (0-100)
- **80-100**: Excellent - Deep liquidity
- **60-79**: Good - Adequate liquidity
- **40-59**: Fair - Thin liquidity
- **20-39**: Poor - Very thin
- **0-19**: Critical - Near zero

Calculated from:
- Liquidity amount (60%)
- Volume/liquidity ratio (40%)

## Graduation Prediction

### Estimation Logic

```typescript
remainingProgress = 100 - bondingProgress;
velocity = calculateVelocity(volume, trend);
estimatedTime = remainingProgress / velocity;
```

### Velocity Factors
- High volume + uptrend = 20%/hour → ~3h to graduate
- Medium volume + uptrend = 10%/hour → ~10h to graduate
- Low volume + flat = 2%/hour → ~50h to graduate
- Downtrend = 1%/hour → ~100h to graduate

### Close to Migration
Returns `true` if:
- Progress > 85%, OR
- Progress > 75% AND LP burned

## Integration Points

### 1. tokenNormalizer.ts ✅
- Calls `analyzeBondingCurve()` for each token
- Attaches all metrics to `token.bonding`

### 2. Explorer.tsx (Recommended)
- Replace progress thresholds with `curveStage`
- Display health scores and flags
- Show graduation countdown
- Filter by stage/health

### 3. Dashboard.tsx (Optional)
- Show top tokens by health
- Highlight graduation candidates
- Display risk alerts

## Algorithm Details

### Bonding Progress Calculation
1. Use explicit `bondingProgress` field if available
2. Check `graduated`/`migrated` flags → 100%
3. Estimate from liquidity + market cap + volume:
   - Liquidity: 0-40 points (target: $100k)
   - Market cap: 0-40 points (target: $500k)
   - Volume: 0-20 points (target: $50k)

### Curve Health Calculation
- Liquidity score × 0.3
- Progress position × 0.2 (sweet spot: 20-80%)
- Security flags × 0.3 (LP burned, authorities disabled)
- Age × 0.2 (prefer 30+ minutes)

### Risk Flag Logic

```typescript
rugRisk = !lpBurned && liquidityScore < 30 && curveHealth < 40
healthyCurve = curveHealth >= 70 && liquidityScore >= 60 && lpBurned
lowLiquidity = liquidity < $500
abnormalBuyPressure = buyPressureRatio > 250
abnormalSellPressure = buyPressureRatio < -150
migrationLikely = progress > 85 || (lpBurned && progress > 70)
curveFlattening = trend === 'flat' && 30 < progress < 90
```

## Performance Notes

- **Computation time**: <1ms per token
- **Memory overhead**: ~200 bytes per token
- **Updates**: Recalculated on each normalization
- **Caching**: Not needed (fast enough)

## Future Enhancements

Potential additions:
- Historical trend analysis (require time-series data)
- Whale wallet detection (require holder data)
- Smart contract analysis (require on-chain queries)
- Social sentiment scoring (require Twitter API)
- Comparative benchmarking (require dataset)

## Troubleshooting

**Q: All tokens show 'new' stage?**
A: Check if `bondingProgress` field exists in raw data. Analyzer will estimate if missing.

**Q: Graduation time seems wrong?**
A: Based on current velocity. Can change rapidly with volume spikes.

**Q: Health score too low?**
A: Check individual components: liquidity score, security flags, age.

**Q: Flags seem inaccurate?**
A: Thresholds are configurable in `bondingAnalyzer.ts` constants section.
