import React, { useState, useEffect, memo } from 'react';
import CoinCard from './CoinCard';

interface CoinInfo {
  address: string;
  name: string;
  logo: string;
  age: number;
  marketCap: number;
  price: number;
  bondingProgress: number;
  alive: boolean;
}

interface FeedListProps {
  title: string;
  coins: CoinInfo[];
  desktop?: boolean;
}

/**
 * FeedList Component
 * Optimized with memo() to prevent re-renders when coins don't change
 * Only re-renders when title or coins array reference changes
 * Desktop mode: renders as a column with independent scrolling
 */
export const FeedList: React.FC<FeedListProps> = memo(({ title, coins, desktop = false }) => {
  const [visibleCoins, setVisibleCoins] = useState<CoinInfo[]>(coins);
  const [dyingCoins, setDyingCoins] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Detect newly dead coins
    const newDyingCoins = new Set<string>();
    coins.forEach(coin => {
      if (!coin.alive && !dyingCoins.has(coin.address)) {
        newDyingCoins.add(coin.address);
      }
    });

    if (newDyingCoins.size > 0) {
      setDyingCoins(prev => new Set([...prev, ...newDyingCoins]));
      
      // Remove coins from DOM after animation completes (600ms)
      setTimeout(() => {
        setVisibleCoins(current => current.filter(coin => coin.alive !== false));
        setDyingCoins(prev => {
          const updated = new Set(prev);
          newDyingCoins.forEach(addr => updated.delete(addr));
          return updated;
        });
      }, 650); // Slightly longer than animation duration
    }

    // Update visible coins with latest data (excluding already-removed dead ones)
    setVisibleCoins(coins.filter(coin => coin.alive !== false || dyingCoins.has(coin.address)));
  }, [coins, dyingCoins]);

  return (
    <div className={desktop 
      ? "flex flex-col h-full overflow-hidden border-r border-[#18333b]/50 last:border-r-0" 
      : "p-4 pb-20 animate-[fadeIn_0.3s_ease-out]"
    }>
      {/* Section title */}
      <h2
        className={desktop 
          ? "sticky top-0 z-10 px-4 py-3 text-lg font-bold backdrop-blur-sm border-b-2 border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent gradient-text-cyan-pink text-glow-cyan"
          : "text-2xl font-bold mb-4 gradient-text-cyan-pink"
        }
      >
        <span className={desktop ? "flex items-center gap-2" : ""}>
          {title}
          {desktop && <span className="ml-auto text-sm opacity-60">({coins.filter(c => c.alive !== false).length})</span>}
        </span>
      </h2>

      {/* Coin list */}
      <div className={desktop 
        ? "flex-1 overflow-y-auto px-4 py-3 space-y-3" 
        : "space-y-3"
      }>
        {visibleCoins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>No coins available yet</p>
            <p className="text-sm mt-1">Check back in a few seconds...</p>
          </div>
        ) : (
          visibleCoins.map((coin) => (
            <CoinCard key={coin.address} coin={coin} />
          ))
        )}
      </div>

      {/* Coin count badge - Mobile only */}
      {!desktop && visibleCoins.length > 0 && (
        <div className="mt-4 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30">
            {coins.filter(c => c.alive !== false).length} {coins.filter(c => c.alive !== false).length === 1 ? 'coin' : 'coins'} live
          </span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if title, coins array reference, or desktop mode changes
  return prevProps.title === nextProps.title && 
         prevProps.coins === nextProps.coins &&
         prevProps.desktop === nextProps.desktop;
});

FeedList.displayName = 'FeedList';

export default FeedList;
