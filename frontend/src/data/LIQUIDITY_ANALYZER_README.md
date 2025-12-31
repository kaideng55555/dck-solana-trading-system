# Liquidity Analyzer - Quick Reference Card

## 🎯 What It Does

Detects rug pulls, LP removals, and liquidity risks in real-time:
- **Instant rug detection** when LP is pulled (>90% drop)
- **Early warnings** for suspicious drops (40-90%)
- **LP status tracking** (burned, locked, removed)
- **Authority risk assessment** (mint/freeze still active)
- **Liquidity health scoring** (0-100 scale)

## 📊 Core Metrics

| Field | Type | Description | Risk Level |
|-------|------|-------------|------------|
| `rugLikely` | boolean | Confirmed rug pull detected | 🚨 CRITICAL |
| `lpRemoved` | boolean | LP was pulled/removed | 🚨 CRITICAL |
| `earlyRugWarning` | boolean | Warning signs (40-90% drop) | ⚠️ HIGH |
| `liquidityHealth` | 0-100 | Overall liquidity health | ℹ️ INFO |
| `lpBurned` | boolean | LP tokens burned (safe) | ✅ SAFE |
| `lpLocked` | boolean | LP tokens locked | ✅ SAFE |
| `suspiciousAuthority` | boolean | Risky authority config | ⚠️ MEDIUM |
| `liquidityDropPercent` | number | Recent liquidity drop % | ℹ️ INFO |
| `liquidityFlags` | string[] | All triggered warnings | ⚠️ VARIES |

## 🚦 Liquidity Health Scale

```
90-100: ✅ Excellent - Deep liquidity, LP secured
70-89:  ✅ Good - Healthy liquidity, low risk
50-69:  ⚠️ Fair - Adequate liquidity, moderate risk
30-49:  ⚠️ Poor - Low liquidity, high risk
0-29:   🚨 Critical - Insufficient liquidity, extreme risk
```

## 🔥 Common Patterns

### Rug Detection
```typescript
// Confirmed rug
if (token.rugLikely || token.lpRemoved) {
  // Fade out coin, show warning, prevent trades
}

// Early warning
if (token.earlyRugWarning) {
  // Show warning badge, monitor closely
}
```

### Safe Token Check
```typescript
// Very safe token
if (token.lpBurned && token.liquidityHealth >= 70) {
  // Green badge, promote in UI
}

// Reasonably safe
if (token.lpLocked && !token.suspiciousAuthority) {
  // Blue badge, acceptable risk
}
```

### LP Status
```typescript
// Check LP security
if (token.lpBurned) {
  badge = '🔥 LP Burned'; // Best case
} else if (token.lpLocked) {
  badge = '🔒 LP Locked'; // Good
} else if (token.lpRemoved) {
  badge = '💀 LP Removed'; // Rug
} else {
  badge = '⚡ LP Active'; // Risky (can be removed)
}
```

## 🎨 UI Integration

### Fade Dead Coins
```tsx
const isDead = token.rugLikely || token.lpRemoved || !token.isAlive;

<div
  className={isDead ? 'dead-coin' : ''}
  style={{
    opacity: isDead ? 0.4 : 1,
    filter: isDead ? 'grayscale(60%)' : 'none',
    transition: 'all 0.5s ease-out',
  }}
>
```

### Health Color
```tsx
import { getLiquidityHealthColor } from '../data';

const color = getLiquidityHealthColor(token.liquidityHealth);
// Returns: 'text-green-400', 'text-yellow-400', 'text-orange-400', or 'text-red-400'

<span className={color}>
  {token.liquidityHealth}%
</span>
```

### Status Emoji
```tsx
import { getLiquidityStatusEmoji } from '../data';

const emoji = getLiquidityStatusEmoji(token);
// Returns: 💀 (rug), ⚠️ (warning), 🔥 (burned), 🔒 (locked), ✅ (healthy), ⚡ (active)

<span>{emoji} {token.liquidityHealth}%</span>
```

## 🏷️ Common Liquidity Flags

| Flag | Meaning | Action |
|------|---------|--------|
| `RUG_LIKELY` | Confirmed rug pull | ❌ Do not trade |
| `LP_REMOVED` | LP was pulled | ❌ Do not trade |
| `EARLY_RUG_WARNING` | Suspicious activity | ⚠️ Monitor closely |
| `LP_BURNED` | LP permanently locked | ✅ Safe |
| `LP_LOCKED` | LP temporarily locked | ✅ Safe |
| `LIQUIDITY_DROP_XX%` | Recent drop detected | ℹ️ Check details |
| `MINT_AUTHORITY_ACTIVE` | Can mint more tokens | ⚠️ Moderate risk |
| `FREEZE_AUTHORITY_ACTIVE` | Can freeze accounts | ⚠️ Moderate risk |
| `SUSPICIOUS_AUTHORITY` | Authorities + high value | ⚠️ High risk |
| `LP_MIGRATION_DETECTED` | LP moving to new pool | ℹ️ Monitor |
| `HIGH_OUTFLOW_$XXK` | Large sell pressure | ⚠️ Declining |

## 🔍 Algorithm Details

### LP Removal Detection
```typescript
lpRemoved = (liquidity === 0) || (liquidityDrop >= 90%)
```

### Rug Likelihood
```typescript
rugLikely = 
  lpRemoved ||
  (liquidityDrop >= 95%) ||
  (liquidity < $100) ||
  (liquidityHealth < 20)
```

### Early Warning
```typescript
earlyRugWarning = 
  !rugLikely &&
  (liquidityDrop >= 40%) &&
  (liquidityDrop < 95%)
```

### Liquidity Health Formula
```typescript
health = 
  liquidityAmount (0-40 pts) +
  volumeRatio (0-20 pts) +
  lpStatus (0-30 pts) +
  stability (0-10 pts)

Where:
- liquidityAmount: Based on $$ (excellent: $5k+, critical: <$100)
- volumeRatio: volume/liquidity should be 0.5-2.0
- lpStatus: burned=30, locked=20, active=5
- stability: Based on recent drops
```

### Suspicious Authority
```typescript
suspiciousAuthority = 
  (mintAuthority || freezeAuthority) &&
  (liquidity > $1000 || marketCap > $50k)
```

## 📋 Explorer Integration Checklist

- [x] Import `getLiquidityHealthColor`, `getLiquidityStatusEmoji`
- [x] Calculate `isDead = rugLikely || lpRemoved || !isAlive`
- [x] Apply `.dead-coin` CSS class with fade-out animation
- [x] Show rug warning badge when `rugLikely === true`
- [x] Show early warning badge when `earlyRugWarning === true`
- [x] Display liquidity health with color indicator
- [x] Add LP status badges (burned/locked/removed)
- [x] Show `liquidityFlags` in warnings section
- [x] Filter dead/rugged tokens into separate section
- [x] Add grayscale + opacity animation for dead coins

## 🚀 Advanced Usage

### Sort by Safety
```typescript
// Safest first
const sorted = tokens.sort((a, b) => 
  b.liquidityHealth - a.liquidityHealth
);
```

### Filter Safe Tokens Only
```typescript
const safeTokens = tokens.filter(t => 
  t.liquidityHealth >= 70 &&
  (t.lpBurned || t.lpLocked) &&
  !t.suspiciousAuthority
);
```

### Highlight At-Risk Tokens
```typescript
const atRiskTokens = tokens.filter(t =>
  t.earlyRugWarning ||
  t.liquidityDropPercent > 30 ||
  t.suspiciousAuthority
);
```

## 🛡️ Security Best Practices

1. **Always check `rugLikely` before trading**
   - If `true`, do NOT trade
   - Fade out in UI immediately

2. **Monitor `earlyRugWarning` tokens**
   - Show warning badges
   - Track liquidity changes
   - Alert users to exit positions

3. **Prefer `lpBurned` over `lpLocked`**
   - Burned = permanent (safest)
   - Locked = temporary (safer)
   - Active = removable (risky)

4. **Flag `suspiciousAuthority` tokens**
   - Active authorities = rug risk
   - Especially dangerous on high-value tokens

5. **Use `liquidityHealth` for quick assessment**
   - >= 70 = generally safe
   - < 50 = high risk
   - < 30 = extreme risk

## 📊 Real-World Examples

### Confirmed Rug
```typescript
{
  rugLikely: true,
  lpRemoved: true,
  liquidityHealth: 0,
  liquidityDropPercent: 100,
  liquidityFlags: ['RUG_LIKELY', 'LP_REMOVED', 'LIQUIDITY_DROP_100%']
}
// Action: Fade out, show 💀 badge, disable trading
```

### Early Warning
```typescript
{
  rugLikely: false,
  earlyRugWarning: true,
  liquidityHealth: 45,
  liquidityDropPercent: 65,
  liquidityFlags: ['EARLY_RUG_WARNING', 'LIQUIDITY_DROP_65%', 'SUSPICIOUS_AUTHORITY']
}
// Action: Show ⚠️ badge, monitor closely
```

### Safe Token
```typescript
{
  rugLikely: false,
  lpBurned: true,
  liquidityHealth: 92,
  liquidityDropPercent: 0,
  suspiciousAuthority: false,
  liquidityFlags: ['LP_BURNED']
}
// Action: Show ✅ badge, promote in UI
```

## 🔧 Debugging

```typescript
// Log full liquidity analysis
console.log('Liquidity Analysis:', {
  health: token.liquidityHealth,
  rugLikely: token.rugLikely,
  lpRemoved: token.lpRemoved,
  lpBurned: token.lpBurned,
  flags: token.liquidityFlags,
  drop: token.liquidityDropPercent,
});
```

## 📚 Related Files

- **liquidityAnalyzer.ts** (680 lines) - Core analysis engine
- **LIQUIDITY_ANALYZER_USAGE.md** - Complete integration guide
- **tokenTypes.ts** - Token interface with liquidity fields
- **tokenNormalizer.ts** - Automatic integration
- **index.ts** - Exports

All analysis is **automatic** during token normalization! 🎉
