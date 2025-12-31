import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenBuyModal } from '../../stores/swapStore';
import { SnipeButton } from '../SnipeButton';

interface CoinCardExplorerProps {
  coin: {
    address: string;
    name: string;
    symbol: string;
    logo: string;
    age: number;
    marketCap: number;
    volume24h?: number; // Optional for compatibility
    price: number;
    bondingProgress: number;
    alive?: boolean; // Dead coin indicator
    lpBurned?: boolean;
    isMigrated?: boolean;
    isOnCurve?: boolean;
    isFairLaunch?: boolean;
    hasSocials?: boolean;
    hasTwitter?: boolean;
    hasTelegram?: boolean;
    mintAuthDisabled?: boolean;
    freezeDisabled?: boolean;
  };
  onClick?: (address: string) => void;
  onAnimationComplete?: (address: string) => void; // Callback when fade-out completes
}

export const CoinCardExplorer: React.FC<CoinCardExplorerProps> = memo(({ coin, onClick, onAnimationComplete }) => {
  const navigate = useNavigate();
  const openBuyModal = useOpenBuyModal();
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Check if coin is dead (alive === false or marketCap <= 0)
  const isDead = coin.alive === false || coin.marketCap <= 0;
  
  const isMigrated = coin.isMigrated === true;
  const isOnCurve = coin.isOnCurve === true || coin.bondingProgress < 100;
  const isFairLaunch = coin.isFairLaunch === true;
  const isNew = coin.age < 300; // Less than 5 minutes
  
  // Risk assessment for glow color
  const hasRisk = !coin.mintAuthDisabled || !coin.freezeDisabled || !coin.lpBurned;
  const isHealthy = coin.lpBurned && coin.mintAuthDisabled && coin.freezeDisabled;

  // Handle dead coin fade-out
  useEffect(() => {
    if (isDead && !isRemoving) {
      setIsRemoving(true);
      
      // Notify parent after animation completes (600ms animation + 100ms buffer)
      const timeout = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete(coin.address);
        }
      }, 700);
      
      return () => clearTimeout(timeout);
    }
  }, [isDead, isRemoving, coin.address, onAnimationComplete]);

  const handleClick = () => {
    // Prevent interaction with dead coins
    if (isDead || isRemoving) return;
    
    if (onClick) {
      onClick(coin.address);
    } else {
      // Navigate to coin details page
      navigate(`/explorer/${coin.address}`);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    if (isDead || isRemoving) return;
    openBuyModal(coin.address);
  };

  const handleTradeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    if (isDead || isRemoving) return;
    navigate(`/trader/${coin.address}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-3 rounded-xl border transition-all duration-200 ${
        isDead || isRemoving 
          ? 'animate-fadeOut pointer-events-none' 
          : 'cursor-pointer'
      } ${
        isMigrated
          ? 'border-pink-500/40 bg-gradient-to-r from-pink-900/10 to-gray-900 hover:border-pink-500/60 hover:shadow-lg hover:shadow-pink-500/20'
          : hasRisk
          ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-900/10 to-gray-900 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20'
          : isHealthy
          ? 'border-cyan-500/30 bg-gradient-to-r from-gray-900 to-gray-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20'
          : 'border-gray-700/40 bg-gradient-to-r from-gray-900 to-gray-800 hover:border-gray-600/60'
      } hover:scale-[1.02] active:scale-[0.98]`}
    >
      {/* Subtle glow for healthy tokens */}
      {isHealthy && !isMigrated && (
        <div
          className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ zIndex: -1 }}
        />
      )}

      {/* Pink glow for migrated tokens */}
      {isMigrated && (
        <div
          className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ zIndex: -1 }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          <img
            src={coin.logo}
            alt={coin.symbol}
            width={48}
            height={48}
            className={`w-12 h-12 rounded-full border-2 ${
              isMigrated
                ? 'border-pink-400/40'
                : hasRisk
                ? 'border-yellow-400/30'
                : 'border-cyan-400/30'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="24" fill="%2300F5FF"/><text x="24" y="30" text-anchor="middle" fill="%23000" font-size="20" font-weight="bold">${coin.symbol.charAt(0)}</text></svg>`;
            }}
          />
          {isNew && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-gray-900" />
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          {/* Header: Symbol + Badges */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <h3 className="text-cyan-100 font-bold text-sm truncate">
              ${coin.symbol}
            </h3>
            
            {/* Status Badges */}
            {isMigrated && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-400 rounded border border-pink-500/40">
                🚀
              </span>
            )}
            {isOnCurve && !isMigrated && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/40">
                📈
              </span>
            )}
            {isFairLaunch && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/40">
                ✨
              </span>
            )}
            {isNew && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded">
                NEW
              </span>
            )}
          </div>

          {/* Token Name */}
          <div className="text-xs text-gray-400 mb-1.5 truncate">
            {coin.name}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">MC:</span>
              <span className="text-cyan-400 font-semibold">
                ${formatMarketCap(coin.marketCap)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Vol:</span>
              <span className="text-gray-300 font-semibold">
                ${formatVolume(coin.volume24h || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Age:</span>
              <span className="text-gray-300">
                {formatAge(coin.age)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Price:</span>
              <span className="text-gray-300 font-mono text-[10px]">
                ${coin.price.toFixed(8)}
              </span>
            </div>
          </div>

          {/* Security + Social Icons */}
          <div className="flex items-center justify-between">
            {/* Security Badges */}
            <div className="flex items-center gap-1">
              {coin.lpBurned && (
                <span className="text-[10px] text-green-400" title="LP Burned">🔥</span>
              )}
              {coin.mintAuthDisabled && (
                <span className="text-[10px] text-green-400" title="Mint Disabled">🔒</span>
              )}
              {coin.freezeDisabled && (
                <span className="text-[10px] text-green-400" title="Freeze Disabled">❄️</span>
              )}
              {hasRisk && (
                <span className="text-[10px] text-yellow-400" title="Risk Detected">⚠️</span>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-1.5">
              {coin.hasTwitter && (
                <a
                  href={`https://twitter.com/${coin.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  title="Twitter"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {coin.hasTelegram && (
                <a
                  href={`https://t.me/${coin.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  title="Telegram"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.03-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.943.112.78.89z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Bonding Curve Progress Bar */}
          {isOnCurve && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-cyan-400 uppercase tracking-wide">
                  Bonding Curve
                </span>
                <span className="text-[10px] font-bold text-cyan-300">
                  {coin.bondingProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(coin.bondingProgress, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Lower Right Corner */}
      {!isDead && !isRemoving && (
        <>
          {/* Desktop Layout: Horizontal buttons aligned right */}
          <div className="hidden sm:flex" style={{ position: 'absolute', bottom: '12px', right: '12px', gap: '8px' }}>
            {/* Show Snipe button for fresh tokens (< 10 min old) */}
            {coin.age < 600 && (
              <SnipeButton 
                tokenMint={coin.address}
                createdAt={Date.now() - (coin.age * 1000)}
              />
            )}
            
            <button
              onClick={handleTradeClick}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(155,0,255,0.2), rgba(255,62,191,0.2))',
                borderColor: 'rgba(155,0,255,0.5)',
                color: '#9B00FF',
                boxShadow: '0 0 10px rgba(155,0,255,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(155,0,255,0.8)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(155,0,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(155,0,255,0.5)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(155,0,255,0.3)';
              }}
            >
              📊 Trade
            </button>
            
            <button
              onClick={handleBuyClick}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(138,43,226,0.15))',
                borderColor: 'rgba(0,245,255,0.4)',
                color: '#00F5FF',
                boxShadow: '0 0 10px rgba(0,245,255,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,245,255,0.8)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,245,255,0.4)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0,245,255,0.2)';
              }}
            >
              💰 Buy
            </button>
          </div>

          {/* Mobile Layout: Vertical buttons aligned right */}
          <div className="sm:hidden" style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <button
              onClick={handleTradeClick}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(155,0,255,0.2), rgba(255,62,191,0.2))',
                borderColor: 'rgba(155,0,255,0.5)',
                color: '#9B00FF',
                boxShadow: '0 0 10px rgba(155,0,255,0.3)',
              }}
            >
              📊 Trade
            </button>
            
            <button
              onClick={handleBuyClick}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(138,43,226,0.15))',
                borderColor: 'rgba(0,245,255,0.4)',
                color: '#00F5FF',
                boxShadow: '0 0 10px rgba(0,245,255,0.2)',
              }}
            >
              💰 Buy
            </button>
            
            {/* Show Snipe button below Buy button for fresh tokens (< 10 min old) */}
            {coin.age < 600 && (
              <SnipeButton 
                tokenMint={coin.address}
                createdAt={Date.now() - (coin.age * 1000)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
});

CoinCardExplorer.displayName = 'CoinCardExplorer';

// Helper functions
function formatMarketCap(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

function formatVolume(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toFixed(0);
}

function formatAge(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export default CoinCardExplorer;
