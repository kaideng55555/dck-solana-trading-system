import React, { memo, useEffect, useState } from 'react';
import { getTokenStatus, formatRiskLevel, type TokenStatusResult } from '../utils/tokenStatus';

interface CoinInfo {
  address: string;
  name: string;
  logo: string;
  age: number;
  marketCap: number;
  price: number;
  bondingProgress: number;
  alive: boolean;
  migrated?: boolean; // Migration status
  isMigrated?: boolean; // Computed: graduated + authorities renounced
  isOnCurve?: boolean; // Computed: still on bonding curve
  isFairLaunch?: boolean; // Computed: no presale/team allocation
  launchAgeMinutes?: number; // Computed: age in minutes
  launchTimestamp?: number; // Computed: launch timestamp
}

interface CoinCardProps {
  coin: CoinInfo;
}

export const CoinCard: React.FC<CoinCardProps> = memo(({ coin }) => {
  const isNew = coin.age < 120; // Less than 2 minutes (120 seconds)
  const isDying = coin.alive === false;
  const isGraduated = coin.bondingProgress >= 100;
  const isMigrated = coin.isMigrated === true || coin.migrated === true; // Use computed field or legacy
  const isOnBondingCurve = coin.isOnCurve === true || coin.bondingProgress < 100;
  const isFairLaunch = coin.isFairLaunch === true;

  // Token security status
  const [tokenStatus, setTokenStatus] = useState<TokenStatusResult | null>(null);

  useEffect(() => {
    // Fetch token status on mount
    getTokenStatus(coin.address, {
      bondingProgress: coin.bondingProgress,
      marketCap: coin.marketCap,
      tokenAge: coin.age,
    }).then(setTokenStatus);
  }, [coin.address, coin.bondingProgress, coin.marketCap, coin.age]);

  return (
    <div
      className={`relative p-3 rounded-xl border transition-all duration-300 panel-shadow ${
        isDying 
          ? 'border-red-500/40 bg-gradient-to-r from-red-900/20 to-gray-900 animate-fadeOut' 
          : isGraduated
          ? 'dck-aura-border bg-gradient-to-r from-yellow-900/10 to-gray-900 md:card-hover-glow'
          : 'border-cyan-500/20 bg-gradient-to-r from-gray-900 to-gray-800 md:card-hover-glow hover:border-cyan-500/40'
      }`}
      style={{
        animation: isDying ? 'fadeOut 0.6s ease-out forwards' : 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Pulsing ring for new coins */}
      {isNew && !isDying && (
        <div
          className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-cyan-500/30 rounded-xl animate-neonPulse"
          style={{
            filter: 'blur(8px)',
            zIndex: -1,
          }}
        />
      )}

      {/* Red warning overlay for dying coins */}
      {isDying && (
        <div
          className="absolute -inset-1 bg-red-500/20 rounded-xl"
          style={{
            filter: 'blur(6px)',
            zIndex: -1,
          }}
        />
      )}

      {/* Gold glow for graduated coins */}
      {isGraduated && !isDying && (
        <div
          className="absolute -inset-2 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-yellow-500/30 rounded-xl animate-goldPulse"
          style={{
            filter: 'blur(12px)',
            zIndex: -1,
          }}
        />
      )}

      <div className={`flex items-center gap-3 ${isDying ? 'opacity-60 grayscale' : ''}`}>
        {/* Circle logo */}
        <div className="relative flex-shrink-0">
          <img
            src={coin.logo}
            alt={coin.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full border-2 border-cyan-400/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="24" fill="%2300F5FF"/><text x="24" y="30" text-anchor="middle" fill="%23000" font-size="20" font-weight="bold">${coin.name.charAt(0)}</text></svg>`;
            }}
          />
          {isNew && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
          )}
        </div>

        {/* Name + Age */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-cyan-100 font-bold text-sm truncate">
              {coin.name}
            </h3>
            {isNew && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded">
                NEW
              </span>
            )}
            {isMigrated && (
              <span 
                className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-400 rounded border border-pink-500/40 animate-glowPulse"
              >
                🚀 MIGRATED
              </span>
            )}
            {isOnBondingCurve && !isGraduated && (
              <span 
                className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/40"
                title="Still on bonding curve"
              >
                📈
              </span>
            )}
            {isFairLaunch && (
              <span 
                className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/40"
                title="Fair launch - no presale"
              >
                ✨
              </span>
            )}
          </div>
          
          {/* Security badges */}
          {tokenStatus && (
            <div className="flex items-center gap-1 mt-0.5">
              {tokenStatus.mintAuthDisabled && (
                <span className="text-[9px] text-green-400" title="Mint authority disabled">🔒</span>
              )}
              {tokenStatus.freezeDisabled && (
                <span className="text-[9px] text-green-400" title="Freeze authority disabled">❄️</span>
              )}
              {tokenStatus.lpBurned && (
                <span className="text-[9px] text-green-400" title="LP tokens burned">🔥</span>
              )}
              {tokenStatus.riskLevel === 'HIGH' && (
                <span className="text-[9px] text-orange-400" title="High risk token">⚠️</span>
              )}
              {tokenStatus.riskLevel === 'CRITICAL' && (
                <span className="text-[9px] text-red-400" title="Critical risk">🚨</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>⏱ {formatAge(coin.age)}</span>
          </div>
          
          {/* Bonding Curve Progress Indicator */}
          {isOnBondingCurve && (
            <div className="mt-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                  📈 Bonding Curve
                </span>
                <span className="text-[10px] font-bold text-cyan-300">
                  {coin.bondingProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500"
                  style={{
                    width: `${Math.min(coin.bondingProgress, 100)}%`,
                    boxShadow: '0 0 8px rgba(0, 245, 255, 0.6)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* MC + Price */}
        <div className="text-right">
          <div className="text-cyan-400 font-bold text-sm">
            ${coin.price.toFixed(8)}
          </div>
          <div className="text-xs text-gray-400">
            MC: ${formatMarketCap(coin.marketCap)}
          </div>
          {tokenStatus && tokenStatus.riskLevel !== 'LOW' && (
            <div className={`text-[10px] font-bold mt-0.5 ${formatRiskLevel(tokenStatus.riskLevel).color}`}>
              {formatRiskLevel(tokenStatus.riskLevel).emoji} {formatRiskLevel(tokenStatus.riskLevel).text}
            </div>
          )}
        </div>

        {/* Vertical mini chart colored bar */}
        <div className="flex-shrink-0">
          <div className="w-1 h-12 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="w-full bg-gradient-to-t from-cyan-500 to-pink-500 transition-all duration-500"
              style={{
                height: `${Math.min(coin.bondingProgress, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

CoinCard.displayName = 'CoinCard';

// Helper functions
function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

function formatMarketCap(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

export default CoinCard;
