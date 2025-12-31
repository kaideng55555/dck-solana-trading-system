# Liquidity Analyzer - Explorer Integration Guide

## 🎯 Overview

The liquidity analyzer automatically detects:
- **LP removals/rugs** - Instant detection when liquidity drops >90%
- **LP burns/locks** - Tracks LP token ownership
- **Early rug warnings** - Detects suspicious liquidity drops (40-90%)
- **Authority risks** - Flags active mint/freeze authorities on valuable tokens
- **Liquidity health** - 0-100 score based on amount, stability, security

All tokens in the global data store automatically include liquidity analysis - **no manual setup required**.

---

## 📊 Available Fields

Every `Token` object includes these liquidity fields:

```typescript
interface Token {
  // Liquidity metrics
  liquidityHealth: number;          // 0-100, overall health score
  liquidityDropPercent: number;     // Recent drop percentage
  
  // LP status flags
  lpRemoved: boolean;               // LP was pulled (rug detected)
  lpBurned: boolean;                // LP tokens burned (safe)
  lpLocked: boolean;                // LP tokens locked (safe)
  
  // Risk detection
  rugLikely: boolean;               // High probability rug pull
  earlyRugWarning: boolean;         // Warning signs of rug
  suspiciousAuthority: boolean;     // Dangerous authority config
  
  // Advanced detection
  lpMigrationDetected: boolean;     // LP migration in progress
  honeypotRisk: boolean;            // Honeypot pattern (placeholder)
  whaleExitSpike: boolean;          // Large holder dumping (placeholder)
  recentOutflow: number;            // Recent sell pressure ($)
  
  // Summary
  liquidityFlags: string[];         // All triggered warnings
}
```

---

## 🎨 Explorer UI Integration

### 1. Fade Out Dead/Rugged Coins

Update `CoinCardExplorer.tsx` to fade out rugged tokens:

```tsx
import { getLiquidityStatusEmoji } from '../data';

function CoinCardExplorer({ token }: { token: Token }) {
  // Determine if token should be faded
  const isDead = token.rugLikely || token.lpRemoved || !token.isAlive;
  
  return (
    <div
      className={`coin-card ${isDead ? 'dead-coin' : ''}`}
      style={{
        opacity: isDead ? 0.4 : 1,
        filter: isDead ? 'grayscale(60%)' : 'none',
        transition: 'all 0.5s ease-out',
      }}
    >
      {/* Rug warning badge */}
      {token.rugLikely && (
        <div className="absolute top-2 right-2 bg-red-500/90 px-2 py-1 rounded text-xs">
          💀 RUG DETECTED
        </div>
      )}
      
      {/* Early warning badge */}
      {token.earlyRugWarning && !token.rugLikely && (
        <div className="absolute top-2 right-2 bg-orange-500/90 px-2 py-1 rounded text-xs">
          ⚠️ RUG WARNING
        </div>
      )}
      
      {/* Card content */}
      {/* ... */}
    </div>
  );
}
```

### 2. Liquidity Health Color Indicator

Add health indicator to token cards:

```tsx
import { getLiquidityHealthColor, getLiquidityHealthDescription } from '../data';

function LiquidityHealthBadge({ token }: { token: Token }) {
  const color = getLiquidityHealthColor(token.liquidityHealth);
  const description = getLiquidityHealthDescription(token.liquidityHealth);
  
  return (
    <div className="flex items-center gap-2">
      <span className={`font-bold ${color}`}>
        {token.liquidityHealth}%
      </span>
      <span className="text-xs text-gray-400">
        {description}
      </span>
    </div>
  );
}
```

### 3. LP Status Badges

Show LP burn/lock/removal badges:

```tsx
import { getLiquidityStatusEmoji } from '../data';

function LPStatusBadges({ token }: { token: Token }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {/* LP Burned (safest) */}
      {token.lpBurned && (
        <span className="badge badge-success">
          🔥 LP Burned
        </span>
      )}
      
      {/* LP Locked (safe) */}
      {token.lpLocked && !token.lpBurned && (
        <span className="badge badge-info">
          🔒 LP Locked
        </span>
      )}
      
      {/* LP Removed (rug) */}
      {token.lpRemoved && (
        <span className="badge badge-danger">
          💀 LP Removed
        </span>
      )}
      
      {/* Migration detected */}
      {token.lpMigrationDetected && (
        <span className="badge badge-warning">
          🔄 LP Migrating
        </span>
      )}
      
      {/* Suspicious authorities */}
      {token.suspiciousAuthority && (
        <span className="badge badge-warning">
          ⚠️ Risky Authority
        </span>
      )}
    </div>
  );
}
```

### 4. Liquidity Flags Display

Show all triggered warnings:

```tsx
function LiquidityWarnings({ token }: { token: Token }) {
  if (token.liquidityFlags.length === 0) return null;
  
  return (
    <div className="warnings-section">
      <h4 className="text-sm font-bold text-orange-400 mb-2">
        ⚠️ Liquidity Warnings
      </h4>
      <div className="flex flex-wrap gap-1">
        {token.liquidityFlags.map((flag, i) => (
          <span
            key={i}
            className="text-xs bg-orange-900/30 border border-orange-500/50 px-2 py-1 rounded"
          >
            {flag.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎭 CSS Animations for Dead Coins

Add these styles to fade out rugged/dead tokens:

```css
/* styles/dckNeonTheme.css or Explorer.tsx <style> */

.coin-card {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.coin-card.dead-coin {
  opacity: 0.4;
  filter: grayscale(60%) brightness(0.7);
  transform: scale(0.98);
  pointer-events: none; /* Prevent interactions */
}

.coin-card.dead-coin:hover {
  opacity: 0.5; /* Slight hover effect */
}

/* Fade-in animation for new coins */
.coin-card {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade-out animation when coin dies */
.coin-card.dead-coin {
  animation: fadeOutDeath 0.8s ease-out forwards;
}

@keyframes fadeOutDeath {
  0% {
    opacity: 1;
    filter: grayscale(0%);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    opacity: 0.4;
    filter: grayscale(60%) brightness(0.7);
    transform: scale(0.98);
  }
}
```

---

## 📋 Complete Token Card Example

Full example with all liquidity features:

```tsx
import { 
  getLiquidityHealthColor, 
  getLiquidityStatusEmoji,
  getLiquidityHealthDescription 
} from '../data';
import type { Token } from '../data';

function CoinCardExplorer({ token }: { token: Token }) {
  const isDead = token.rugLikely || token.lpRemoved || !token.isAlive;
  const healthColor = getLiquidityHealthColor(token.liquidityHealth);
  const statusEmoji = getLiquidityStatusEmoji(token);
  
  return (
    <div
      className={`
        coin-card 
        ${isDead ? 'dead-coin' : ''}
        bg-gradient-to-br from-slate-900 to-slate-800
        border border-cyan-500/30
        rounded-lg p-4
        relative
      `}
    >
      {/* Top badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {token.rugLikely && (
          <span className="badge bg-red-500/90 px-2 py-1 rounded text-xs font-bold">
            💀 RUG
          </span>
        )}
        {token.earlyRugWarning && !token.rugLikely && (
          <span className="badge bg-orange-500/90 px-2 py-1 rounded text-xs font-bold">
            ⚠️ WARNING
          </span>
        )}
      </div>
      
      {/* Token header */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={token.metadata.image || '/default-token.png'} 
          alt={token.metadata.symbol}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="font-bold text-lg">{token.metadata.symbol}</h3>
          <p className="text-sm text-gray-400">{token.metadata.name}</p>
        </div>
      </div>
      
      {/* Market data */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <span className="text-xs text-gray-400">Price</span>
          <p className="font-bold">${token.market.price.toFixed(8)}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Market Cap</span>
          <p className="font-bold">${(token.market.marketCap / 1000).toFixed(1)}K</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Liquidity</span>
          <p className="font-bold">${(token.market.liquidity / 1000).toFixed(1)}K</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Volume 24h</span>
          <p className="font-bold">${(token.market.volume24h / 1000).toFixed(1)}K</p>
        </div>
      </div>
      
      {/* Liquidity health indicator */}
      <div className="mb-3 p-2 bg-slate-800/50 rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Liquidity Health</span>
          <span className={`font-bold ${healthColor}`}>
            {statusEmoji} {token.liquidityHealth}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              token.liquidityHealth >= 70 ? 'bg-green-500' :
              token.liquidityHealth >= 50 ? 'bg-yellow-500' :
              token.liquidityHealth >= 30 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${token.liquidityHealth}%` }}
          />
        </div>
      </div>
      
      {/* LP status badges */}
      <div className="flex gap-2 flex-wrap mb-3">
        {token.lpBurned && (
          <span className="text-xs bg-green-900/30 border border-green-500/50 px-2 py-1 rounded">
            🔥 LP Burned
          </span>
        )}
        {token.lpLocked && !token.lpBurned && (
          <span className="text-xs bg-blue-900/30 border border-blue-500/50 px-2 py-1 rounded">
            🔒 LP Locked
          </span>
        )}
        {token.lpRemoved && (
          <span className="text-xs bg-red-900/30 border border-red-500/50 px-2 py-1 rounded">
            💀 LP Removed
          </span>
        )}
        {token.suspiciousAuthority && (
          <span className="text-xs bg-orange-900/30 border border-orange-500/50 px-2 py-1 rounded">
            ⚠️ Risky Authority
          </span>
        )}
      </div>
      
      {/* Liquidity warnings */}
      {token.liquidityFlags.length > 0 && (
        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded">
          <p className="text-xs font-bold text-orange-400 mb-1">Warnings:</p>
          <div className="flex flex-wrap gap-1">
            {token.liquidityFlags.map((flag, i) => (
              <span key={i} className="text-xs text-orange-300">
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Additional info */}
      {token.liquidityDropPercent > 0 && (
        <p className="text-xs text-red-400 mt-2">
          ⚠️ Liquidity dropped {token.liquidityDropPercent.toFixed(1)}%
        </p>
      )}
      {token.recentOutflow > 0 && (
        <p className="text-xs text-orange-400 mt-1">
          📉 Recent outflow: ${(token.recentOutflow / 1000).toFixed(1)}K
        </p>
      )}
    </div>
  );
}
```

---

## 🔄 Explorer.tsx Integration

Update Explorer sections to filter dead/rugged coins:

```tsx
import { useFilteredTokenList } from '../data';

function Explorer() {
  // Get all tokens
  const allTokens = useFilteredTokenList();
  
  // Separate live vs dead/rugged tokens
  const liveTokens = allTokens.filter(t => !t.rugLikely && !t.lpRemoved && t.isAlive);
  const deadTokens = allTokens.filter(t => t.rugLikely || t.lpRemoved || !t.isAlive);
  const warningTokens = allTokens.filter(t => t.earlyRugWarning && !t.rugLikely);
  
  return (
    <div className="explorer">
      {/* Warning section - tokens at risk */}
      {warningTokens.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-orange-400">
            ⚠️ Early Rug Warnings ({warningTokens.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warningTokens.map(token => (
              <CoinCardExplorer key={token.mint} token={token} />
            ))}
          </div>
        </section>
      )}
      
      {/* Live tokens - categorize by curve stage */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">
          ✅ Live Tokens ({liveTokens.length})
        </h2>
        {/* ... categorize by curveStage ... */}
      </section>
      
      {/* Dead/rugged section - faded out */}
      {deadTokens.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-400">
            💀 Dead/Rugged ({deadTokens.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deadTokens.map(token => (
              <CoinCardExplorer key={token.mint} token={token} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## 🚦 Liquidity Health Thresholds

### Health Score Interpretation

```typescript
// Excellent (90-100)
✅ Deep liquidity, LP secured (burned/locked), stable

// Good (70-89)
✅ Healthy liquidity, low risk, minor concerns

// Fair (50-69)
⚠️ Adequate liquidity, moderate risk

// Poor (30-49)
⚠️ Low liquidity, high risk, significant concerns

// Critical (0-29)
🚨 Insufficient liquidity, extreme risk, avoid
```

### Color Scheme

```typescript
liquidityHealth >= 70: text-green-400  (safe)
liquidityHealth >= 50: text-yellow-400 (caution)
liquidityHealth >= 30: text-orange-400 (warning)
liquidityHealth < 30:  text-red-400    (danger)
```

---

## 🎯 Quick Start Checklist

1. **Update CoinCardExplorer component**:
   - Add `isDead` calculation
   - Apply `dead-coin` CSS class when `rugLikely || lpRemoved`
   - Add rug warning badges
   - Show liquidity health indicator

2. **Add CSS animations**:
   - `.dead-coin` fade-out style
   - `@keyframes fadeOutDeath` animation
   - Grayscale filter for dead tokens

3. **Update Explorer sections**:
   - Filter out rugged tokens from main sections
   - Create separate "Dead/Rugged" section
   - Add "Early Warning" section for at-risk tokens

4. **Add LP status badges**:
   - 🔥 LP Burned (green)
   - 🔒 LP Locked (blue)
   - 💀 LP Removed (red)
   - ⚠️ Risky Authority (orange)

5. **Display liquidity warnings**:
   - Show `liquidityFlags` array
   - Highlight liquidity drops
   - Show recent outflow for declining tokens

---

## 📊 Example Usage

```tsx
// Simple rug check
if (token.rugLikely) {
  console.log('🚨 RUG DETECTED - DO NOT TRADE');
}

// Early warning check
if (token.earlyRugWarning) {
  console.log('⚠️ Warning signs - liquidity dropping');
}

// Safe token check
if (token.lpBurned && token.liquidityHealth >= 70) {
  console.log('✅ Safe token - LP burned and healthy');
}

// Authority risk check
if (token.suspiciousAuthority) {
  console.log('⚠️ Risky - authorities active on valuable token');
}
```

---

## 🔍 Debugging

All liquidity analysis is logged in browser console:

```typescript
console.log('Liquidity Analysis:', {
  health: token.liquidityHealth,
  rugLikely: token.rugLikely,
  lpRemoved: token.lpRemoved,
  flags: token.liquidityFlags,
});
```

Check `token.liquidityFlags` array for detailed warnings.

---

## 🚀 Advanced Features

### Custom Fade Animation

```tsx
// Gradual fade based on liquidity health
const opacity = token.liquidityHealth / 100; // 0.0 to 1.0

<div style={{ opacity, transition: 'opacity 0.5s' }}>
  {/* Token card */}
</div>
```

### Color-Coded Backgrounds

```tsx
const bgColor = 
  token.rugLikely ? 'bg-red-900/20' :
  token.earlyRugWarning ? 'bg-orange-900/20' :
  token.liquidityHealth >= 70 ? 'bg-green-900/10' :
  'bg-slate-900';
```

### Sort by Liquidity Health

```tsx
const sortedByHealth = tokens.sort((a, b) => 
  b.liquidityHealth - a.liquidityHealth
);
```

---

## 📚 Additional Resources

- **liquidityAnalyzer.ts**: Full implementation with 15 metrics
- **tokenTypes.ts**: Complete Token interface with liquidity fields
- **tokenNormalizer.ts**: Automatic integration during normalization
- **BONDING_ANALYZER_USAGE.md**: Bonding curve integration guide

All liquidity analysis is **automatic** - just use the `Token` objects from the global store! 🎉
