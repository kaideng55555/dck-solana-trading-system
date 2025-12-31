/**
 * EXAMPLE: Explorer.tsx Migration to Global Data Layer
 * 
 * This file shows how to migrate Explorer.tsx from local mock data
 * to the global token data engine.
 * 
 * Key Changes:
 * 1. Remove local state (allCoins, setAllCoins)
 * 2. Remove mock data generation
 * 3. Import global data hooks
 * 4. Use Token type instead of CoinInfo
 * 5. Map Token fields to component expectations
 */

import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ NEW: Import global data hooks
import { 
  useGlobalTokenData, 
  useFilteredTokenList,
  type Token 
} from '../data';

// OLD: Import local types (remove this later)
// import { useExplorerFilters, type CoinInfo } from '../hooks/useExplorerFilters';

// Components
import { CoinCardExplorer } from '../components/cards/CoinCardExplorer';
import { ExplorerFilters } from '../components/ExplorerFilters';
import { ExplorerQuickFilters } from '../components/ExplorerQuickFilters';

/**
 * Helper: Convert Token to CoinInfo format
 * Use this during migration to avoid changing all child components at once
 * Eventually, update child components to use Token directly
 */
function tokenToCoinInfo(token: Token): any {
  return {
    address: token.mint,
    mint: token.mint,
    name: token.metadata.name,
    symbol: token.metadata.symbol,
    logo: token.metadata.image || '💎',
    age: token.ageMinutes * 60, // Convert back to seconds
    marketCap: token.market.marketCap,
    price: token.market.price,
    bondingProgress: token.bonding.bondingProgress,
    alive: token.isAlive,
    hasSocials: !!(token.socials.twitter || token.socials.telegram),
    hasTwitter: !!token.socials.twitter,
    hasTelegram: !!token.socials.telegram,
    lpBurned: token.lpBurned,
    mintDisabled: token.mintAuthorityDisabled,
    freezeDisabled: token.freezeAuthorityDisabled,
    volume24h: token.market.volume24h,
    isMigrated: token.bonding.isMigrated,
    isOnCurve: !token.bonding.isMigrated,
    isFairLaunch: true, // Compute if needed
    launchAgeMinutes: token.ageMinutes,
    launchTimestamp: token.createdAt,
  };
}

/**
 * Main Explorer Component - MIGRATED VERSION
 */
const ExplorerMigrated: React.FC = () => {
  // ✅ NEW: Initialize global data (only needed once in app, can be in App.tsx)
  const { isLoading: globalLoading, error: globalError } = useGlobalTokenData({
    enabled: true,
    interval: 10000, // Poll every 10 seconds
  });

  // ✅ NEW: Get all tokens from global store
  const allTokens = useFilteredTokenList({
    onlyAlive: true, // Only show alive tokens by default
  });

  // Convert to old format during migration
  const allCoins = useMemo(
    () => allTokens.map(tokenToCoinInfo),
    [allTokens]
  );

  // Local UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [removingCoins, setRemovingCoins] = useState<Set<string>>(new Set());

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter state (keep existing filter logic for now)
  const [filters, setFilters] = useState({
    hasSocials: false,
    lpBurned: false,
    mintAuthDisabled: false,
    freezeDisabled: false,
    migrated: false,
    onCurveOnly: false,
    fairLaunchOnly: false,
    marketCapRange: [0, 1000000] as [number, number],
    volumeRange: [0, 100000] as [number, number],
    ageRange: [0, 86400] as [number, number],
    bondingProgressRange: [0, 100] as [number, number],
    sortBy: 'marketCap' as 'marketCap' | 'volume' | 'ageAsc' | 'ageDesc' | 'bonding' | 'launchAge',
  });

  // Apply local filters to global tokens
  const filteredResults = useMemo(() => {
    let filtered = [...allCoins];

    // Search filter
    if (searchInput) {
      const searchLower = searchInput.toLowerCase();
      filtered = filtered.filter(coin =>
        coin.name.toLowerCase().includes(searchLower) ||
        coin.symbol.toLowerCase().includes(searchLower) ||
        coin.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters (same logic as before)
    if (filters.hasSocials) {
      filtered = filtered.filter(coin => coin.hasSocials);
    }
    if (filters.lpBurned) {
      filtered = filtered.filter(coin => coin.lpBurned);
    }
    if (filters.mintAuthDisabled) {
      filtered = filtered.filter(coin => coin.mintDisabled);
    }
    if (filters.freezeDisabled) {
      filtered = filtered.filter(coin => coin.freezeDisabled);
    }
    if (filters.migrated) {
      filtered = filtered.filter(coin => coin.isMigrated);
    }
    if (filters.onCurveOnly) {
      filtered = filtered.filter(coin => coin.isOnCurve);
    }

    // Market cap range
    filtered = filtered.filter(
      coin =>
        coin.marketCap >= filters.marketCapRange[0] &&
        coin.marketCap <= filters.marketCapRange[1]
    );

    // Volume range
    filtered = filtered.filter(
      coin =>
        (coin.volume24h || 0) >= filters.volumeRange[0] &&
        (coin.volume24h || 0) <= filters.volumeRange[1]
    );

    // Age range
    filtered = filtered.filter(
      coin =>
        coin.age >= filters.ageRange[0] &&
        coin.age <= filters.ageRange[1]
    );

    // Bonding progress range
    filtered = filtered.filter(
      coin =>
        coin.bondingProgress >= filters.bondingProgressRange[0] &&
        coin.bondingProgress <= filters.bondingProgressRange[1]
    );

    // Sort
    const sortBy = filters.sortBy;
    filtered.sort((a, b) => {
      if (sortBy === 'marketCap') return b.marketCap - a.marketCap;
      if (sortBy === 'volume') return (b.volume24h || 0) - (a.volume24h || 0);
      if (sortBy === 'ageAsc') return a.age - b.age;
      if (sortBy === 'ageDesc') return b.age - a.age;
      if (sortBy === 'bonding') return b.bondingProgress - a.bondingProgress;
      if (sortBy === 'launchAge') return a.launchAgeMinutes - b.launchAgeMinutes;
      return 0;
    });

    return filtered;
  }, [allCoins, searchInput, filters]);

  // Rest of the component logic remains the same...
  // (view mode, infinite scroll, categorization, etc.)

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [displayCount, setDisplayCount] = useState(20);

  const displayedCoins = useMemo(
    () => filteredResults.slice(0, displayCount),
    [filteredResults, displayCount]
  );

  const hasMore = displayCount < filteredResults.length;

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + 20, filteredResults.length));
  }, [filteredResults.length]);

  // Loading state combines global loading + local state
  const isLoading = globalLoading && allCoins.length === 0;
  const error = globalError;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0d11] via-[#0d1117] to-purple-900/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0d11]/95 backdrop-blur-sm border-b border-cyan-500/20 panel-shadow">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text-cyan-pink text-glow-cyan">
                🔍 Token Explorer
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Browse and analyze all survived tokens
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-3 md:px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40 hover:bg-cyan-500/30 transition-all text-sm font-medium btn-neon panel-shadow flex items-center gap-2"
              >
                <span>⚙️</span>
                <span className="hidden md:inline">Filters</span>
              </button>

              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold gradient-text-cyan-pink">
                  {filteredResults.length}
                </div>
                <div className="text-[10px] md:text-xs text-gray-400">
                  of {allCoins.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Desktop: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex gap-6">
          {/* Quick Filters Sidebar */}
          <ExplorerQuickFilters 
            filters={filters as any} 
            setFilters={setFilters as any} 
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-4xl mb-4 animate-neonPulse">💎</div>
                <p className="text-[#00F5FF] font-bold text-glow-cyan">
                  Loading tokens from global data layer...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-red-400 font-bold">Error: {error}</p>
              </div>
            ) : (
              <>
                {/* Token grid/table renders here */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedCoins.map(coin => (
                    <CoinCardExplorer
                      key={coin.address}
                      coin={coin}
                      onAnimationComplete={() => {}}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 font-medium hover:bg-cyan-500/30 transition-all btn-neon"
                    >
                      Load More ({filteredResults.length - displayCount} left)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorerMigrated;
