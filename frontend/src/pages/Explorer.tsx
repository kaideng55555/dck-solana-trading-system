/**
 * Explorer Page - Advanced token search and filtering
 * Static view with comprehensive filters and sorting
 * Browse all coins that survived past the first lifecycle
 * No auto-refresh - user-driven exploration with infinite scroll
 */

import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { useExplorerFilters, type CoinInfo } from '../hooks/useExplorerFilters';
import { CoinCardExplorer } from '../components/cards/CoinCardExplorer';
import { ExplorerFilters } from '../components/ExplorerFilters';
import { ExplorerQuickFilters } from '../components/ExplorerQuickFilters';

/**
 * Memoized CoinCardExplorer to prevent unnecessary re-renders
 */
const MemoizedCoinCard = memo(CoinCardExplorer, (prevProps, nextProps) => {
  return (
    prevProps.coin.address === nextProps.coin.address &&
    prevProps.coin.marketCap === nextProps.coin.marketCap &&
    prevProps.coin.price === nextProps.coin.price &&
    prevProps.coin.bondingProgress === nextProps.coin.bondingProgress
  );
});

/**
 * Main Explorer Component with Infinite Scroll
 */
const Explorer: React.FC = () => {
  // Fetch full coin list from API
  const [allCoins, setAllCoins] = useState<CoinInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Track dead coins that are animating out
  const [removingCoins, setRemovingCoins] = useState<Set<string>>(new Set());

  // Fetch coins on mount
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/explore`);
        
        if (!response.ok) {
          console.warn('API not available, using mock data');
          setAllCoins(generateMockCoins(100));
          return;
        }

        const data = await response.json();
        setAllCoins(data);
      } catch (error) {
        console.error('Failed to fetch explorer coins:', error);
        // Fallback to mock data
        setAllCoins(generateMockCoins(100));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Handle dead coin removal after fade-out animation
  const handleAnimationComplete = useCallback((address: string) => {
    setRemovingCoins(prev => {
      const next = new Set(prev);
      next.add(address);
      return next;
    });
    
    // Remove from actual data after a short delay
    setTimeout(() => {
      setAllCoins(prev => prev.filter(coin => coin.address !== address));
      setRemovingCoins(prev => {
        const next = new Set(prev);
        next.delete(address);
        return next;
      });
    }, 100);
  }, []);

  // Debounced search state
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the filter hook with fetched coins
  const {
    filteredResults,
    filters,
    setFilters,
    sort,
    setSort,
    search,
    setSearch,
  } = useExplorerFilters(allCoins);

  // Debounce search input (300ms)
  const handleSearchChange = useCallback((value: string | ((prev: string) => string)) => {
    const newValue = typeof value === 'function' ? value(searchInput) : value;
    setSearchInput(newValue);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(newValue);
    }, 300);
  }, [setSearch, searchInput]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // View mode state (desktop only)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Detect mobile for performance optimizations
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Infinite scroll state (desktop only)
  const [displayCount, setDisplayCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize displayed coins for performance
  const displayedCoins = useMemo(
    () => filteredResults.slice(0, displayCount),
    [filteredResults, displayCount]
  );
  const hasMore = displayCount < filteredResults.length;

  // Categorize coins by bonding progress (desktop only)
  const categorizedCoins = useMemo(() => {
    const newPairs: CoinInfo[] = [];
    const aboutToGraduate: CoinInfo[] = [];
    const graduated: CoinInfo[] = [];

    displayedCoins.forEach((coin) => {
      if (coin.isMigrated || coin.bondingProgress >= 90) {
        graduated.push(coin);
      } else if (coin.bondingProgress >= 40 && coin.bondingProgress < 90) {
        aboutToGraduate.push(coin);
      } else {
        newPairs.push(coin);
      }
    });

    return { newPairs, aboutToGraduate, graduated };
  }, [displayedCoins]);

  // Memoize stats calculations (desktop only)
  const stats = useMemo(() => {
    if (filteredResults.length === 0) {
      return { 
        avgMC: 0, 
        topMC: 0, 
        avgAge: 0, 
        lpBurnedCount: 0,
        migratedCount: 0,
        onCurveCount: 0,
        fairLaunchCount: 0,
      };
    }
    return {
      avgMC: filteredResults.reduce((sum, c) => sum + c.marketCap, 0) / filteredResults.length,
      topMC: Math.max(...filteredResults.map(c => c.marketCap)),
      avgAge: filteredResults.reduce((sum, c) => sum + c.age, 0) / filteredResults.length,
      lpBurnedCount: filteredResults.filter(c => c.lpBurned).length,
      migratedCount: filteredResults.filter(c => c.isMigrated).length,
      onCurveCount: filteredResults.filter(c => c.isOnCurve).length,
      fairLaunchCount: filteredResults.filter(c => c.isFairLaunch).length,
    };
  }, [filteredResults]);

  // Intersection Observer for infinite scroll (desktop)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile || !loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => Math.min(prev + 20, filteredResults.length));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, filteredResults.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [filteredResults.length]);

  // Scroll to top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + 20, filteredResults.length));
  }, [filteredResults.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-[#0a0d11] via-[#0d1117] to-purple-900/10">
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
              {/* Filter Toggle Button (Mobile & Desktop) */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-3 md:px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40 hover:bg-cyan-500/30 transition-all text-sm font-medium btn-neon panel-shadow flex items-center gap-2"
              >
                <span>⚙️</span>
                <span className="hidden md:inline">Filters</span>
                {filteredResults.length < allCoins.length && (
                  <span className="px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                    {Object.values(filters).filter(v => typeof v === 'boolean' && v).length}
                  </span>
                )}
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

      {/* Explorer Filters Component */}
      <ExplorerFilters
        filters={filters}
        setFilters={setFilters}
        search={searchInput}
        setSearch={handleSearchChange}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        resultCount={filteredResults.length}
      />

      {/* Main Content - Desktop: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex gap-6">
          {/* Quick Filters Sidebar - Desktop Only */}
          <ExplorerQuickFilters filters={filters} setFilters={setFilters} />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl mb-4 animate-neonPulse">💎</div>
            <p className="text-[#00F5FF] font-bold text-glow-cyan">
              Loading tokens...
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 panel-shadow bg-gray-900/20 rounded-xl border border-cyan-500/10">
            <div className="text-6xl mb-4 animate-float">🔍</div>
            <h3 className="text-xl font-bold mb-2 text-cyan-400">No tokens found</h3>
            <p className="text-sm mb-4 text-center px-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setFilters({
                  hasSocials: false,
                  lpBurned: false,
                  mintAuthDisabled: false,
                  freezeDisabled: false,
                  migrated: false,
                  onCurveOnly: false,
                  fairLaunchOnly: false,
                  marketCapRange: [0, 1000000],
                  volumeRange: [0, 100000],
                  ageRange: [0, 86400],
                  bondingProgressRange: [0, 100],
                  sortBy: 'marketCap',
                });
                setSearch('');
              }}
              className="px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40 hover:bg-cyan-500/30 transition-all btn-neon font-medium"
            >
              🔄 Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Stats Summary Bar - Desktop Only */}
            <div className="hidden md:flex items-center justify-between gap-4 mb-4 bg-gray-900/40 border border-cyan-500/20 rounded-full px-6 py-3 panel-shadow">
              {/* Total Coins */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-glowPulse" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Total</span>
                <span className="text-lg font-bold gradient-text-cyan-pink text-glow-cyan">
                  {filteredResults.length}
                </span>
              </div>

              {/* Average MC */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full border border-cyan-500/20">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Avg MC</span>
                <span className="text-base font-bold gradient-text-cyan-pink">
                  ${stats.avgMC.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Highest MC */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-pink-500/10 to-transparent rounded-full border border-pink-500/20">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Top MC</span>
                <span className="text-base font-bold gradient-text-pink-purple text-glow-pink">
                  ${stats.topMC.toLocaleString()}
                </span>
              </div>

              {/* Average Age */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full border border-purple-500/20">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Avg Age</span>
                <span className="text-base font-bold text-purple-400 text-glow-pink">
                  {(() => {
                    const hours = Math.floor(stats.avgAge / 3600);
                    if (hours >= 24) return `${Math.floor(hours / 24)}d`;
                    if (hours > 0) return `${hours}h`;
                    return `${Math.floor(stats.avgAge / 60)}m`;
                  })()}
                </span>
              </div>

              {/* Decorative separator */}
              <div className="w-px h-6 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

              {/* Quick info pills */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-full border border-cyan-500/30">
                <span className="text-xs text-cyan-400">⚡</span>
                <span className="text-xs font-medium text-gray-300">
                  {stats.lpBurnedCount} LP Burned
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-pink-500/30">
                <span className="text-xs text-pink-400">🚀</span>
                <span className="text-xs font-medium text-gray-300">
                  {stats.migratedCount} Migrated
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30">
                <span className="text-xs text-cyan-400">📈</span>
                <span className="text-xs font-medium text-gray-300">
                  {stats.onCurveCount} On Curve
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                <span className="text-xs text-yellow-400">✨</span>
                <span className="text-xs font-medium text-gray-300">
                  {stats.fairLaunchCount} Fair
                </span>
              </div>
            </div>

            {/* Neon Sorting Bar */}
            <div className="mb-4 bg-gradient-to-r from-gray-900/50 via-cyan-900/20 to-gray-900/50 border border-cyan-500/30 rounded-lg p-3 md:p-4 panel-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                {/* Sort Label */}
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-sm md:text-base text-glow-cyan">
                    🔽 Sort By:
                  </span>
                  <span className="text-xs text-gray-400 md:hidden">
                    {displayedCoins.length} of {filteredResults.length}
                  </span>
                </div>

                {/* Desktop: Button Group */}
                <div className="hidden md:flex flex-1 gap-2">
                  <button
                    onClick={() => setSort('marketCap')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      sort === 'marketCap'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-gray-800/50 text-gray-300 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10'
                    }`}
                  >
                    💰 Market Cap
                  </button>
                  <button
                    onClick={() => setSort('volume')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      sort === 'volume'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-gray-800/50 text-gray-300 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10'
                    }`}
                  >
                    📊 Volume
                  </button>
                  <button
                    onClick={() => setSort('ageAsc')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      sort === 'ageAsc'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-gray-800/50 text-gray-300 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10'
                    }`}
                  >
                    🕒 Oldest
                  </button>
                  <button
                    onClick={() => setSort('ageDesc')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      sort === 'ageDesc'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-gray-800/50 text-gray-300 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10'
                    }`}
                  >
                    🆕 Newest
                  </button>
                  <button
                    onClick={() => setSort('launchAge')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      sort === 'launchAge'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-gray-800/50 text-gray-300 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10'
                    }`}
                  >
                    🚀 Launch
                  </button>
                  <button
                    onClick={() => setSort('bonding')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      sort === 'bonding'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-gray-800/50 text-gray-300 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10'
                    }`}
                  >
                    📈 Bonding
                  </button>
                </div>

                {/* Mobile: Custom Dropdown */}
                <div className="md:hidden relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="w-full px-4 py-2.5 bg-gray-800/80 border-2 border-cyan-500/40 rounded-lg text-cyan-100 font-medium text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 appearance-none pr-10 cursor-pointer"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(0, 245, 255, 0.1), rgba(255, 65, 214, 0.1))`,
                    }}
                  >
                    <option value="marketCap">💰 Market Cap</option>
                    <option value="volume">📊 Volume</option>
                    <option value="ageAsc">🕒 Oldest First</option>
                    <option value="ageDesc">🆕 Newest First</option>
                    <option value="launchAge">🚀 Launch Age</option>
                    <option value="bonding">📈 Bonding Progress</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                    ▼
                  </div>
                </div>

                {/* Desktop: Result Count */}
                <div className="hidden md:block text-sm text-gray-400 whitespace-nowrap">
                  <span className="text-cyan-400 font-bold">{displayedCoins.length}</span> of{' '}
                  <span className="text-cyan-400 font-bold">{filteredResults.length}</span>
                </div>

                {/* Desktop: View Toggle */}
                <div className="hidden md:flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg border border-cyan-500/20">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-1.5 rounded font-medium text-xs transition-all duration-200 ${
                      viewMode === 'card'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-cyan-400'
                    }`}
                  >
                    🎴 Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 rounded font-medium text-xs transition-all duration-200 ${
                      viewMode === 'table'
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-cyan-400'
                    }`}
                  >
                    📊 Table
                  </button>
                </div>
              </div>
            </div>

            {/* Card View - Responsive Grid: Mobile 1col, Tablet 2col, Desktop 3col */}
            {viewMode === 'card' && (
              <>
                {/* Mobile: Single Combined List */}
                <div className="lg:hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayedCoins.map((coin: CoinInfo, index: number) => (
                      <div
                        key={coin.address}
                        className={isMobile ? '' : 'animate-slideInUp'}
                        style={isMobile ? undefined : { animationDelay: `${(index % 20) * 0.02}s` }}
                      >
                        <MemoizedCoinCard 
                          coin={coin} 
                          onAnimationComplete={handleAnimationComplete}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: 3 Categorized Sections */}
                <div className="hidden lg:block space-y-8">
                  {/* New Pairs Section */}
                  {categorizedCoins.newPairs.length > 0 && (
                    <div className="mt-8">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold gradient-text-cyan-pink text-glow-cyan inline-block">
                          🚀 New Pairs
                        </h2>
                        <div className="mt-2 h-px bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-transparent" 
                             style={{ boxShadow: '0 0 8px rgba(0, 245, 255, 0.4)' }} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {categorizedCoins.newPairs.map((coin: CoinInfo, index: number) => (
                          <div
                            key={coin.address}
                            className="animate-slideInUp"
                            style={{ animationDelay: `${index * 0.02}s` }}
                          >
                            <MemoizedCoinCard 
                              coin={coin} 
                              onAnimationComplete={handleAnimationComplete}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About to Graduate Section */}
                  {categorizedCoins.aboutToGraduate.length > 0 && (
                    <div className="mt-8">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold gradient-text-cyan-pink text-glow-cyan inline-block">
                          📈 About to Graduate
                        </h2>
                        <div className="mt-2 h-px bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-transparent" 
                             style={{ boxShadow: '0 0 8px rgba(0, 245, 255, 0.4)' }} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {categorizedCoins.aboutToGraduate.map((coin: CoinInfo, index: number) => (
                          <div
                            key={coin.address}
                            className="animate-slideInUp"
                            style={{ animationDelay: `${index * 0.02}s` }}
                          >
                            <MemoizedCoinCard 
                              coin={coin} 
                              onAnimationComplete={handleAnimationComplete}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Graduated Section */}
                  {categorizedCoins.graduated.length > 0 && (
                    <div className="mt-8">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold gradient-text-cyan-pink text-glow-cyan inline-block">
                          🎓 Graduated
                        </h2>
                        <div className="mt-2 h-px bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-transparent" 
                             style={{ boxShadow: '0 0 8px rgba(0, 245, 255, 0.4)' }} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {categorizedCoins.graduated.map((coin: CoinInfo, index: number) => (
                          <div
                            key={coin.address}
                            className="animate-slideInUp"
                            style={{ animationDelay: `${index * 0.02}s` }}
                          >
                            <MemoizedCoinCard 
                              coin={coin} 
                              onAnimationComplete={handleAnimationComplete}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Table View - Desktop Only */}
            {viewMode === 'table' && (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-900/50 border-b-2 border-cyan-500/30">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Token
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Market Cap
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Volume 24h
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Bonding
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          LP Burned
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Migrated
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Socials
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedCoins.map((coin: CoinInfo, index: number) => (
                        <tr
                          key={coin.address}
                          className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-all duration-200 group animate-slideInUp"
                          style={{ 
                            animationDelay: `${(index % 20) * 0.01}s`,
                            boxShadow: '0 0 0 0 rgba(0, 245, 255, 0)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 15px 2px rgba(0, 245, 255, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0, 245, 255, 0)';
                          }}
                        >
                          {/* Token Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{coin.logo}</div>
                              <div>
                                <div className="font-bold text-cyan-100 group-hover:text-cyan-400 transition-colors">
                                  {coin.name}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {coin.address.slice(0, 6)}...{coin.address.slice(-4)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Market Cap */}
                          <td className="px-4 py-3 text-right">
                            <div className="font-bold gradient-text-cyan-pink">
                              ${coin.marketCap.toLocaleString()}
                            </div>
                          </td>

                          {/* Volume 24h */}
                          <td className="px-4 py-3 text-right">
                            <div className="text-gray-300">
                              ${(coin.volume24h || 0).toLocaleString()}
                            </div>
                          </td>

                          {/* Age */}
                          <td className="px-4 py-3 text-center">
                            <div className="inline-block px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                              {(() => {
                                const hours = Math.floor(coin.age / 3600);
                                if (hours >= 24) return `${Math.floor(hours / 24)}d`;
                                if (hours > 0) return `${hours}h`;
                                return `${Math.floor(coin.age / 60)}m`;
                              })()}
                            </div>
                          </td>

                          {/* Bonding Progress */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full transition-all"
                                  style={{ width: `${coin.bondingProgress}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-cyan-400">
                                {coin.bondingProgress}%
                              </span>
                            </div>
                          </td>

                          {/* LP Burned */}
                          <td className="px-4 py-3 text-center">
                            {coin.lpBurned ? (
                              <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400 font-medium">
                                🔥 Yes
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Migrated */}
                          <td className="px-4 py-3 text-center">
                            {coin.tokenStatus?.migrated ? (
                              <span className="inline-block px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded text-xs text-cyan-400 font-medium">
                                🚀 Yes
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Socials */}
                          <td className="px-4 py-3 text-center">
                            {coin.hasSocials ? (
                              <span className="inline-block px-2 py-1 bg-blue-500/20 border border-blue-500/40 rounded text-xs text-blue-400 font-medium">
                                🌐 Yes
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile fallback: show cards */}
                <div className="md:hidden grid grid-cols-1 gap-3">
                  {displayedCoins.map((coin: CoinInfo, index: number) => (
                    <div key={coin.address}>
                      <MemoizedCoinCard coin={coin} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Desktop: Infinite Scroll Trigger & Load More Button */}
            {hasMore && (
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="hidden md:flex px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-purple-500/30 transition-all btn-neon panel-shadow items-center gap-2"
                >
                  <span>⬇️</span>
                  Load More Tokens
                  <span className="text-xs text-gray-400">
                    ({filteredResults.length - displayCount} remaining)
                  </span>
                </button>
              </div>
            )}

            {/* Mobile: Simple "Load More" at bottom */}
            {hasMore && (
              <div className="md:hidden mt-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="w-full px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 font-medium hover:bg-cyan-500/30 transition-all btn-neon"
                >
                  Load More ({filteredResults.length - displayCount} left)
                </button>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && displayedCoins.length > 0 && (
              <div className="mt-8 text-center text-gray-500 text-sm">
                <div className="inline-block px-4 py-2 bg-gray-900/30 border border-cyan-500/20 rounded-full">
                  ✨ End of results - {filteredResults.length} tokens displayed
                </div>
              </div>
            )}
          </>
        )}
          </div> {/* Close main content area */}
        </div> {/* Close flex container */}
      </div> {/* Close max-w-7xl container */}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-cyan-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 animate-glowPulse btn-neon"
          style={{
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.6)',
          }}
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Generate mock explorer coins for testing
 */
function generateMockCoins(count: number): CoinInfo[] {
  const names = [
    'CYBER', 'NEON', 'AKIRA', 'DEGEN', 'GHOST', 'SYNTH', 'PUNK', 'BLADE',
    'TOKYO', 'SAMURAI', 'SHINJI', 'SPIKE', 'VASH', 'GOKU', 'LUFFY', 'NARUTO',
    'COWBOY', 'BEBOP', 'CHAMPLOO', 'DANDY', 'MEGALO', 'PSYCHO', 'SERIAL',
    'LAIN', 'TRIGUN', 'OUTLAW', 'JOJO', 'STAND', 'HAMON', 'TITAN',
  ];
  const logos = ['🚀', '💎', '⚡', '🔥', '🌙', '⭐', '💫', '🎯', '👾', '🤖'];

  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const ageSeconds = Math.floor(Math.random() * 86400); // 0-24 hours
    const bondingProgress = Math.floor(Math.random() * 100);
    const launchTimestamp = now - ageSeconds * 1000;
    const lpBurned = Math.random() > 0.4;
    const mintDisabled = Math.random() > 0.3;
    const freezeDisabled = Math.random() > 0.3;
    const isFairLaunch = Math.random() > 0.25; // 75% fair launch
    const tokenName = names[i % names.length] + (i >= names.length ? Math.floor(i / names.length) : '');

    return {
      address: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      name: tokenName,
      symbol: tokenName, // Symbol same as name for mock data
      logo: logos[i % logos.length],
      age: ageSeconds,
      marketCap: Math.floor(Math.random() * 900000) + 1000,
      price: parseFloat((Math.random() * 10).toFixed(8)),
      bondingProgress,
      alive: true,
      hasSocials: Math.random() > 0.3,
      hasTwitter: Math.random() > 0.5,
      hasTelegram: Math.random() > 0.5,
      lpBurned,
      mintDisabled,
      freezeDisabled,
      volume24h: Math.floor(Math.random() * 90000) + 1000,
      // Computed fields (will be enriched by hook, but adding base values)
      isMigrated: bondingProgress >= 100 && lpBurned && mintDisabled && freezeDisabled,
      isOnCurve: bondingProgress < 100,
      isFairLaunch,
      launchAgeMinutes: Math.floor(ageSeconds / 60),
      launchTimestamp,
    };
  });
}

export default Explorer;
