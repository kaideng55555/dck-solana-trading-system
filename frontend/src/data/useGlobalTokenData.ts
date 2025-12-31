/**
 * Global Token Data Hook
 * Main interface for accessing and managing global token data
 * Handles fetching, polling, and real-time updates
 */

import { useEffect, useCallback, useRef } from 'react';
import { useTokenDataStore } from './tokenDataStore';
import { normalizeTokens } from './tokenNormalizer';
import { fetchTokenList, fetchPriceUpdates } from './api';
import type { PollingConfig, TokenFilters, RawTokenData } from './tokenTypes';

/**
 * Default polling configuration
 */
const DEFAULT_POLLING_CONFIG: PollingConfig = {
  enabled: true,
  interval: 10000, // 10 seconds
};

/**
 * Main hook for global token data management
 * 
 * @param config - Polling configuration
 * @returns Token data and control functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     tokens, 
 *     isLoading, 
 *     error, 
 *     refetch 
 *   } = useGlobalTokenData();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       {tokens.map(token => (
 *         <TokenCard key={token.mint} token={token} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGlobalTokenData(config: Partial<PollingConfig> = {}) {
  const mergedConfig = { ...DEFAULT_POLLING_CONFIG, ...config };
  
  const {
    tokenList,
    isLoading,
    error,
    lastFetch,
    totalTokens,
    setTokens,
    setLoading,
    setError,
    getTokenByMint,
    getTokenList,
  } = useTokenDataStore();
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  
  /**
   * Fetch initial token data
   */
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use unified API wrapper
      const response = await fetchTokenList(100);
      
      if (!response.ok) {
        throw new Error(response.message || 'Failed to fetch tokens');
      }
      
      const normalized = normalizeTokens(response.data);
      setTokens(normalized);
      
      console.log(`✅ Loaded ${normalized.length} tokens from API${response.cached ? ' (cached)' : ''}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to fetch token data:', err);
      
      if (mergedConfig.onError) {
        mergedConfig.onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  }, [setTokens, setLoading, setError, mergedConfig]);
  
  /**
   * Update existing tokens with latest price data
   */
  const updatePrices = useCallback(async () => {
    const currentTokens = useTokenDataStore.getState().tokenList;
    
    if (currentTokens.length === 0) {
      return; // No tokens to update
    }
    
    try {
      const mints = currentTokens.map(t => t.mint);
      const response = await fetchPriceUpdates(mints);
      
      // Check if response is an error
      if (!response.ok) {
        console.warn('Price update failed:', response.message);
        return;
      }
      
      // Apply updates to store
      response.data.forEach((update: Partial<RawTokenData>) => {
        if (update.mint) {
          const { updateToken } = useTokenDataStore.getState();
          updateToken(update.mint, {
            market: {
              ...currentTokens.find(t => t.mint === update.mint)?.market!,
              price: update.price || 0,
              volume24h: update.volume24h || 0,
              priceChange24h: update.priceChange24h,
            },
            lastUpdated: Date.now(),
          });
        }
      });
      
      console.log(`🔄 Updated prices for ${response.data.length} tokens${response.cached ? ' (cached)' : ''}`);
    } catch (err) {
      console.error('Failed to update prices:', err);
    }
  }, []);
  
  /**
   * Start polling for updates
   */
  const startPolling = useCallback(() => {
    if (isPollingRef.current || !mergedConfig.enabled) {
      return;
    }
    
    isPollingRef.current = true;
    
    pollingIntervalRef.current = setInterval(() => {
      updatePrices();
    }, mergedConfig.interval);
    
    console.log(`🔁 Started polling (interval: ${mergedConfig.interval}ms)`);
  }, [mergedConfig.enabled, mergedConfig.interval, updatePrices]);
  
  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      isPollingRef.current = false;
      console.log('⏸️ Stopped polling');
    }
  }, []);
  
  /**
   * Manual refetch
   */
  const refetch = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);
  
  /**
   * Initial load and polling setup
   */
  useEffect(() => {
    // Load initial data
    fetchInitialData();
    
    // Start polling if enabled
    if (mergedConfig.enabled) {
      startPolling();
    }
    
    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [fetchInitialData, startPolling, stopPolling, mergedConfig.enabled]);
  
  /**
   * Return public API
   */
  return {
    // Data
    tokens: tokenList,
    totalTokens,
    
    // State
    isLoading,
    error,
    lastFetch,
    
    // Actions
    refetch,
    startPolling,
    stopPolling,
    
    // Getters
    getTokenByMint,
    getTokenList,
  };
}

/**
 * Hook to get a single token by mint address
 * 
 * @example
 * ```tsx
 * function TokenDetails({ mint }: { mint: string }) {
 *   const token = useTokenByMint(mint);
 *   
 *   if (!token) return <div>Token not found</div>;
 *   
 *   return <div>{token.metadata.name}</div>;
 * }
 * ```
 */
export function useTokenByMint(mint: string) {
  return useTokenDataStore(state => state.tokens.get(mint));
}

/**
 * Hook to get filtered token list
 * 
 * @example
 * ```tsx
 * function SafeTokenList() {
 *   const safeTokens = useFilteredTokenList({
 *     onlySafe: true,
 *     minLiquidity: 1000,
 *     onlyAlive: true,
 *   });
 *   
 *   return (
 *     <div>
 *       {safeTokens.map(token => (
 *         <TokenCard key={token.mint} token={token} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFilteredTokenList(filters?: TokenFilters) {
  return useTokenDataStore(state => state.getTokenList(filters));
}

/**
 * Hook for token search
 * 
 * @example
 * ```tsx
 * function TokenSearch() {
 *   const [query, setQuery] = useState('');
 *   const results = useTokenSearch(query);
 *   
 *   return (
 *     <div>
 *       <input value={query} onChange={e => setQuery(e.target.value)} />
 *       {results.map(token => (
 *         <div key={token.mint}>{token.metadata.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenSearch(searchQuery: string) {
  return useTokenDataStore(state => 
    state.getTokenList({ search: searchQuery })
  );
}

/**
 * Hook to get tokens sorted by various criteria
 */
export function useSortedTokens(
  sortBy: 'marketCap' | 'volume' | 'age' | 'price' | 'risk' = 'marketCap',
  direction: 'asc' | 'desc' = 'desc'
) {
  return useTokenDataStore(state => {
    const tokens = [...state.tokenList];
    
    tokens.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'marketCap':
          aValue = a.market.marketCap;
          bValue = b.market.marketCap;
          break;
        case 'volume':
          aValue = a.market.volume24h;
          bValue = b.market.volume24h;
          break;
        case 'age':
          aValue = a.ageMinutes;
          bValue = b.ageMinutes;
          break;
        case 'price':
          aValue = a.market.price;
          bValue = b.market.price;
          break;
        case 'risk':
          aValue = a.riskScore;
          bValue = b.riskScore;
          break;
        default:
          return 0;
      }
      
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return tokens;
  });
}

/**
 * Hook to get tokens by graduation status
 */
export function useTokensByGraduation() {
  return useTokenDataStore(state => {
    const tokens = state.tokenList;
    
    return {
      newPairs: tokens.filter(t => t.bonding.bondingProgress < 40),
      aboutToGraduate: tokens.filter(t => 
        t.bonding.bondingProgress >= 40 && t.bonding.bondingProgress < 90
      ),
      graduated: tokens.filter(t => 
        t.bonding.bondingProgress >= 90 || t.bonding.isMigrated
      ),
    };
  });
}

/**
 * Hook to get safe tokens (LP burned + authorities disabled)
 */
export function useSafeTokens() {
  return useTokenDataStore(state => 
    state.tokenList.filter(t => 
      t.lpBurned && 
      t.mintAuthorityDisabled && 
      t.freezeAuthorityDisabled
    )
  );
}

/**
 * Hook to get high-risk tokens
 */
export function useHighRiskTokens(threshold: number = 50) {
  return useTokenDataStore(state => 
    state.tokenList.filter(t => t.riskScore >= threshold)
  );
}
