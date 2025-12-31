# Authority Analyzer - Explorer Integration Guide

## 🎯 Overview

The authority analyzer automatically detects:
- **Fake renounces** - Authority moved to burner wallets instead of null
- **Authority risks** - Mint/freeze authorities still active
- **Recent authority changes** - Suspicious timing patterns
- **Migration eligibility** - Fully renounced + LP secured tokens
- **Authority risk scoring** - 0-100 scale for quick assessment

All tokens in the global data store automatically include authority analysis - **no manual setup required**.

---

## 📊 Available Fields

Every `Token` object includes these authority fields:

```typescript
interface Token {
  // Authority addresses (from authorities object)
  authorities: {
    mintAuthority: string | null;
    freezeAuthority: string | null;
    updateAuthority: string | null;
  };
  
  // Basic authority flags
  mintAuthorityDisabled: boolean;
  freezeAuthorityDisabled: boolean;
  
  // Advanced authority analysis
  fakeRenounceDetected: boolean;     // Fake renounce pattern detected
  authorityRiskScore: number;        // 0-100, risk level
  isFullyRenounced: boolean;         // All authorities disabled + LP active
  isMigratedEligible: boolean;       // Renounced + LP secured
  authorityFlags: string[];          // All triggered warnings
}
```

---

## 🚨 Fake Renounce Detection

### What is a Fake Renounce?

A "fake renounce" is when a token creator **appears** to renounce ownership but actually maintains control:

1. **Authority moved to burner wallet** instead of null address
2. **Partial renounce** - Only one authority disabled
3. **Recent authority changes** - Changed after launch (suspicious)
4. **Toggle patterns** - Authority turned on/off repeatedly

### Detection Signals

```typescript
// Signal 1: Suspicious address patterns
if (mintAuthority.includes('temp') || mintAuthority.includes('test')) {
  // FAKE RENOUNCE - moved to temporary wallet
}

// Signal 2: Recent changes on old tokens
if (tokenAge > 1 hour && authorityChangedAt < 1 hour ago) {
  // FAKE RENOUNCE - why change now?
}

// Signal 3: Partial renounce
if (mintDisabled && !freezeDisabled) {
  // FAKE RENOUNCE - only one authority disabled
}
```

---

## 🎨 Explorer UI Integration

### 1. Authority Status Badges

Display authority status with color-coded badges:

```tsx
import { 
  getAuthorityStatusEmoji, 
  getAuthorityStatusLabel,
  getAuthorityRiskColor 
} from '../data';

function AuthorityBadge({ token }: { token: Token }) {
  const emoji = getAuthorityStatusEmoji(token);
  const label = getAuthorityStatusLabel(token);
  const color = getAuthorityRiskColor(token.authorityRiskScore);
  
  return (
    <div className={`authority-badge ${color}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

// Badge styles based on status:
// 🚨 FAKE RENOUNCE      - text-red-400, bg-red-900/30
// ✅ FULLY RENOUNCED    - text-green-400, bg-green-900/30
// 🎓 MIGRATION READY    - text-blue-400, bg-blue-900/30
// ⛔ NOT RENOUNCED      - text-red-400, bg-red-900/30
// ⚠️ MINT ACTIVE        - text-orange-400, bg-orange-900/30
// ⚠️ FREEZE ACTIVE      - text-orange-400, bg-orange-900/30
// ⚡ PARTIALLY RENOUNCED - text-yellow-400, bg-yellow-900/30
```

### 2. Fake Renounce Warning (Critical)

Add prominent warning for fake renounces:

```tsx
function CoinCardExplorer({ token }: { token: Token }) {
  return (
    <div className="coin-card">
      {/* CRITICAL: Fake renounce warning */}
      {token.fakeRenounceDetected && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/90 p-2 text-center font-bold animate-pulse">
          🚨 FAKE RENOUNCE DETECTED - DO NOT TRADE
        </div>
      )}
      
      {/* Card content */}
    </div>
  );
}
```

### 3. Authority Risk Score Indicator

Visual risk indicator with color coding:

```tsx
import { getAuthorityRiskColor, getAuthorityRiskDescription } from '../data';

function AuthorityRiskIndicator({ token }: { token: Token }) {
  const color = getAuthorityRiskColor(token.authorityRiskScore);
  const description = getAuthorityRiskDescription(token.authorityRiskScore);
  
  return (
    <div className="risk-indicator">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Authority Risk</span>
        <span className={`font-bold ${color}`}>
          {token.authorityRiskScore}%
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            token.authorityRiskScore >= 75 ? 'bg-red-500' :
            token.authorityRiskScore >= 50 ? 'bg-orange-500' :
            token.authorityRiskScore >= 25 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${token.authorityRiskScore}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
}
```

### 4. Authority Details Section

Expandable section showing all authority info:

```tsx
function AuthorityDetails({ token }: { token: Token }) {
  return (
    <div className="authority-details">
      <h4 className="text-sm font-bold mb-2">Authority Status</h4>
      
      {/* Mint authority */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">Mint Authority</span>
        <span className={token.mintAuthorityDisabled ? 'text-green-400' : 'text-red-400'}>
          {token.mintAuthorityDisabled ? '✅ Disabled' : '⚠️ Active'}
        </span>
      </div>
      
      {/* Freeze authority */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">Freeze Authority</span>
        <span className={token.freezeAuthorityDisabled ? 'text-green-400' : 'text-red-400'}>
          {token.freezeAuthorityDisabled ? '✅ Disabled' : '⚠️ Active'}
        </span>
      </div>
      
      {/* Migration eligibility */}
      {token.isMigratedEligible && (
        <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/50 rounded">
          <p className="text-xs text-blue-400">
            🎓 Migration Eligible - Fully renounced + LP secured
          </p>
        </div>
      )}
      
      {/* Fully renounced badge */}
      {token.isFullyRenounced && !token.isMigratedEligible && (
        <div className="mt-2 p-2 bg-green-900/30 border border-green-500/50 rounded">
          <p className="text-xs text-green-400">
            ✅ Fully Renounced - All authorities disabled
          </p>
        </div>
      )}
    </div>
  );
}
```

### 5. Authority Flags Display

Show all triggered authority warnings:

```tsx
function AuthorityWarnings({ token }: { token: Token }) {
  if (token.authorityFlags.length === 0) return null;
  
  // Determine severity
  const isCritical = token.fakeRenounceDetected || 
                     token.authorityFlags.includes('CRITICAL_AUTHORITY_RISK');
  const isHigh = token.authorityFlags.includes('HIGH_AUTHORITY_RISK');
  
  return (
    <div className={`warnings-section ${
      isCritical ? 'border-red-500' : 
      isHigh ? 'border-orange-500' : 
      'border-yellow-500'
    }`}>
      <h4 className={`text-sm font-bold mb-2 ${
        isCritical ? 'text-red-400' : 
        isHigh ? 'text-orange-400' : 
        'text-yellow-400'
      }`}>
        {isCritical ? '🚨' : isHigh ? '⚠️' : '⚡'} Authority Warnings
      </h4>
      <div className="flex flex-wrap gap-1">
        {token.authorityFlags.map((flag, i) => (
          <span
            key={i}
            className={`text-xs px-2 py-1 rounded ${
              flag.includes('CRITICAL') || flag.includes('FAKE') ? 
                'bg-red-900/30 border border-red-500/50 text-red-300' :
              flag.includes('HIGH') || flag.includes('SUSPICIOUS') ? 
                'bg-orange-900/30 border border-orange-500/50 text-orange-300' :
              flag.includes('ACTIVE') ? 
                'bg-yellow-900/30 border border-yellow-500/50 text-yellow-300' :
                'bg-blue-900/30 border border-blue-500/50 text-blue-300'
            }`}
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

## 🔍 Explorer Filtering & Organization

### Filter by Authority Status

Add filter options for authority-safe tokens:

```tsx
import { useFilteredTokenList } from '../data';

function Explorer() {
  const [showOnlyRenounced, setShowOnlyRenounced] = useState(false);
  const [showOnlyMigrationReady, setShowOnlyMigrationReady] = useState(false);
  const [hideFakeRenounces, setHideFakeRenounces] = useState(true);
  
  const allTokens = useFilteredTokenList();
  
  // Apply authority filters
  const filteredTokens = allTokens.filter(token => {
    if (hideFakeRenounces && token.fakeRenounceDetected) return false;
    if (showOnlyRenounced && !token.isFullyRenounced) return false;
    if (showOnlyMigrationReady && !token.isMigratedEligible) return false;
    return true;
  });
  
  return (
    <div className="explorer">
      {/* Filter controls */}
      <div className="filters">
        <label>
          <input 
            type="checkbox" 
            checked={showOnlyRenounced}
            onChange={e => setShowOnlyRenounced(e.target.checked)}
          />
          ✅ Only Fully Renounced
        </label>
        
        <label>
          <input 
            type="checkbox" 
            checked={showOnlyMigrationReady}
            onChange={e => setShowOnlyMigrationReady(e.target.checked)}
          />
          🎓 Only Migration Ready
        </label>
        
        <label>
          <input 
            type="checkbox" 
            checked={hideFakeRenounces}
            onChange={e => setHideFakeRenounces(e.target.checked)}
          />
          🚫 Hide Fake Renounces
        </label>
      </div>
      
      {/* Token grid */}
    </div>
  );
}
```

### Categorize by Authority Status

Organize tokens into sections based on authority safety:

```tsx
function Explorer() {
  const allTokens = useFilteredTokenList();
  
  // Categorize by authority status
  const migrationReady = allTokens.filter(t => t.isMigratedEligible);
  const fullyRenounced = allTokens.filter(t => t.isFullyRenounced && !t.isMigratedEligible);
  const partiallyRenounced = allTokens.filter(t => 
    (t.mintAuthorityDisabled || t.freezeAuthorityDisabled) && 
    !t.isFullyRenounced
  );
  const notRenounced = allTokens.filter(t => 
    !t.mintAuthorityDisabled && 
    !t.freezeAuthorityDisabled &&
    !t.fakeRenounceDetected
  );
  const fakeRenounces = allTokens.filter(t => t.fakeRenounceDetected);
  
  return (
    <div className="explorer">
      {/* CRITICAL: Fake renounces section */}
      {fakeRenounces.length > 0 && (
        <section className="mb-8 border-2 border-red-500 rounded p-4">
          <h2 className="text-xl font-bold mb-4 text-red-400">
            🚨 Fake Renounces Detected ({fakeRenounces.length})
          </h2>
          <p className="text-sm text-red-300 mb-4">
            These tokens claim to be renounced but maintain control. DO NOT TRADE.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fakeRenounces.map(token => (
              <CoinCardExplorer key={token.mint} token={token} />
            ))}
          </div>
        </section>
      )}
      
      {/* Migration ready section */}
      {migrationReady.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-400">
            🎓 Migration Ready ({migrationReady.length})
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Fully renounced with secured LP - eligible for DEX migration
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {migrationReady.map(token => (
              <CoinCardExplorer key={token.mint} token={token} />
            ))}
          </div>
        </section>
      )}
      
      {/* Fully renounced section */}
      {fullyRenounced.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-green-400">
            ✅ Fully Renounced ({fullyRenounced.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fullyRenounced.map(token => (
              <CoinCardExplorer key={token.mint} token={token} />
            ))}
          </div>
        </section>
      )}
      
      {/* Partially renounced section */}
      {partiallyRenounced.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">
            ⚡ Partially Renounced ({partiallyRenounced.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partiallyRenounced.map(token => (
              <CoinCardExplorer key={token.mint} token={token} />
            ))}
          </div>
        </section>
      )}
      
      {/* Not renounced section */}
      {notRenounced.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-orange-400">
            ⚠️ Not Renounced ({notRenounced.length})
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Authorities still active - higher risk
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notRenounced.map(token => (
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

## 🎭 CSS Styling for Authority Status

### Warning Glow for Risky Tokens

Add animated glow effect for fake renounces and high-risk authorities:

```css
/* Fake renounce - critical red glow */
.coin-card.fake-renounce {
  border: 2px solid #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
  animation: dangerPulse 2s infinite;
}

@keyframes dangerPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
  }
  50% {
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.9);
  }
}

/* High authority risk - orange glow */
.coin-card.high-authority-risk {
  border: 1px solid #f97316;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.4);
}

/* Fully renounced - green glow */
.coin-card.fully-renounced {
  border: 1px solid #22c55e;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

/* Migration ready - blue glow */
.coin-card.migration-ready {
  border: 1px solid #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}
```

### Apply in Component

```tsx
function CoinCardExplorer({ token }: { token: Token }) {
  const cardClass = `coin-card ${
    token.fakeRenounceDetected ? 'fake-renounce' :
    token.authorityRiskScore >= 75 ? 'high-authority-risk' :
    token.isMigratedEligible ? 'migration-ready' :
    token.isFullyRenounced ? 'fully-renounced' :
    ''
  }`;
  
  return <div className={cardClass}>...</div>;
}
```

---

## 📋 Complete Token Card Example

Full implementation with all authority features:

```tsx
import { 
  getAuthorityRiskColor,
  getAuthorityRiskDescription,
  getAuthorityStatusEmoji,
  getAuthorityStatusLabel 
} from '../data';

function CoinCardExplorer({ token }: { token: Token }) {
  const riskColor = getAuthorityRiskColor(token.authorityRiskScore);
  const riskDesc = getAuthorityRiskDescription(token.authorityRiskScore);
  const statusEmoji = getAuthorityStatusEmoji(token);
  const statusLabel = getAuthorityStatusLabel(token);
  
  return (
    <div className={`coin-card ${
      token.fakeRenounceDetected ? 'fake-renounce' :
      token.authorityRiskScore >= 75 ? 'high-authority-risk' :
      token.isMigratedEligible ? 'migration-ready' :
      token.isFullyRenounced ? 'fully-renounced' :
      ''
    }`}>
      {/* CRITICAL: Fake renounce banner */}
      {token.fakeRenounceDetected && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/90 p-2 text-center">
          <p className="text-sm font-bold animate-pulse">
            🚨 FAKE RENOUNCE - DO NOT TRADE
          </p>
        </div>
      )}
      
      {/* Token header */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={token.metadata.image} 
          alt={token.metadata.symbol}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="font-bold">{token.metadata.symbol}</h3>
          <p className="text-sm text-gray-400">{token.metadata.name}</p>
        </div>
      </div>
      
      {/* Authority status badge */}
      <div className={`mb-3 p-2 rounded flex items-center gap-2 ${
        token.fakeRenounceDetected ? 'bg-red-900/30 border border-red-500' :
        token.isFullyRenounced ? 'bg-green-900/30 border border-green-500' :
        token.isMigratedEligible ? 'bg-blue-900/30 border border-blue-500' :
        'bg-orange-900/30 border border-orange-500'
      }`}>
        <span className="text-xl">{statusEmoji}</span>
        <span className="text-sm font-bold">{statusLabel}</span>
      </div>
      
      {/* Authority risk indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Authority Risk</span>
          <span className={`font-bold ${riskColor}`}>
            {token.authorityRiskScore}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              token.authorityRiskScore >= 75 ? 'bg-red-500' :
              token.authorityRiskScore >= 50 ? 'bg-orange-500' :
              token.authorityRiskScore >= 25 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${token.authorityRiskScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{riskDesc}</p>
      </div>
      
      {/* Authority details */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <span className="text-gray-400">Mint Authority</span>
          <p className={token.mintAuthorityDisabled ? 'text-green-400' : 'text-red-400'}>
            {token.mintAuthorityDisabled ? '✅ Disabled' : '⚠️ Active'}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Freeze Authority</span>
          <p className={token.freezeAuthorityDisabled ? 'text-green-400' : 'text-red-400'}>
            {token.freezeAuthorityDisabled ? '✅ Disabled' : '⚠️ Active'}
          </p>
        </div>
      </div>
      
      {/* Authority warnings */}
      {token.authorityFlags.length > 0 && (
        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded">
          <p className="text-xs font-bold text-orange-400 mb-1">Authority Warnings:</p>
          <div className="flex flex-wrap gap-1">
            {token.authorityFlags.slice(0, 3).map((flag, i) => (
              <span key={i} className="text-xs text-orange-300">
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
            {token.authorityFlags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{token.authorityFlags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Special badges */}
      <div className="flex gap-2 flex-wrap mt-3">
        {token.isMigratedEligible && (
          <span className="text-xs bg-blue-900/30 border border-blue-500/50 px-2 py-1 rounded">
            🎓 Migration Ready
          </span>
        )}
        {token.isFullyRenounced && !token.isMigratedEligible && (
          <span className="text-xs bg-green-900/30 border border-green-500/50 px-2 py-1 rounded">
            ✅ Fully Renounced
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Quick Start Checklist

1. **Add authority status badge** to CoinCardExplorer
   - Use `getAuthorityStatusEmoji()` and `getAuthorityStatusLabel()`
   - Color-code based on `authorityRiskScore`

2. **Show fake renounce warnings**
   - Banner at top of card when `fakeRenounceDetected === true`
   - Red pulsing animation
   - DO NOT TRADE message

3. **Add authority risk indicator**
   - Progress bar showing `authorityRiskScore`
   - Color: green (safe) → yellow → orange → red (critical)

4. **Display authority details**
   - Mint authority status (✅/⚠️)
   - Freeze authority status (✅/⚠️)

5. **Add filter options**
   - "Only Fully Renounced" checkbox
   - "Only Migration Ready" checkbox
   - "Hide Fake Renounces" checkbox

6. **Reorganize sections**
   - Fake Renounces (critical warning section)
   - Migration Ready (premium section)
   - Fully Renounced (safe section)
   - Partially Renounced (caution section)
   - Not Renounced (risky section)

7. **Add warning glows**
   - Red pulsing glow for fake renounces
   - Orange glow for high authority risk
   - Green glow for fully renounced
   - Blue glow for migration ready

---

## 📚 Additional Resources

- **authorityAnalyzer.ts**: Full implementation
- **tokenTypes.ts**: Token interface with authority fields
- **tokenNormalizer.ts**: Automatic integration
- **LIQUIDITY_ANALYZER_USAGE.md**: Liquidity features guide

All authority analysis is **automatic** - just use the `Token` objects! 🎉
