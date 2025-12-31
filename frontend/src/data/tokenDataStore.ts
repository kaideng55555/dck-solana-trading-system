/**
 * Global Token Data Store (Zustand)
 * Central state management for all token data in the application
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Token, TokenDataState, TokenFilters } from './tokenTypes';

/**
 * Filter tokens based on criteria
 */
function filterTokens(tokens: Token[], filters?: TokenFilters): Token[] {
  if (!filters) return tokens;
  
  return tokens.filter(token => {
    // Market cap filters
    if (filters.minMarketCap && token.market.marketCap < filters.minMarketCap) {
      return false;
    }
    if (filters.maxMarketCap && token.market.marketCap > filters.maxMarketCap) {
      return false;
    }
    
    // Liquidity filter
    if (filters.minLiquidity && token.market.liquidity < filters.minLiquidity) {
      return false;
    }
    
    // Volume filter
    if (filters.minVolume24h && token.market.volume24h < filters.minVolume24h) {
      return false;
    }
    
    // Migration filter
    if (filters.onlyMigrated && !token.bonding.isMigrated) {
      return false;
    }
    
    // Alive filter
    if (filters.onlyAlive && !token.isAlive) {
      return false;
    }
    
    // Safety filter (LP burned + authorities disabled)
    if (filters.onlySafe) {
      if (!token.lpBurned || !token.mintAuthorityDisabled || !token.freezeAuthorityDisabled) {
        return false;
      }
    }
    
    // Age filters
    if (filters.minAge && token.ageMinutes < filters.minAge) {
      return false;
    }
    if (filters.maxAge && token.ageMinutes > filters.maxAge) {
      return false;
    }
    
    // Social filters
    if (filters.hasTwitter && !token.socials.twitter) {
      return false;
    }
    if (filters.hasTelegram && !token.socials.telegram) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = token.metadata.name.toLowerCase().includes(searchLower);
      const symbolMatch = token.metadata.symbol.toLowerCase().includes(searchLower);
      const mintMatch = token.mint.toLowerCase().includes(searchLower);
      
      if (!nameMatch && !symbolMatch && !mintMatch) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Create the token data store
 */
export const useTokenDataStore = create<TokenDataState>()(
  devtools(
    (set, get) => ({
      // Initial state
      tokens: new Map(),
      tokenList: [],
      isLoading: false,
      isPolling: false,
      error: null,
      lastFetch: null,
      totalTokens: 0,
      
      // Actions
      setTokens: (tokens: Token[]) => {
        const tokenMap = new Map<string, Token>();
        tokens.forEach(token => {
          tokenMap.set(token.mint, token);
        });
        
        set({
          tokens: tokenMap,
          tokenList: tokens,
          totalTokens: tokens.length,
          lastFetch: Date.now(),
          error: null,
        });
      },
      
      updateToken: (mint: string, updates: Partial<Token>) => {
        const { tokens, tokenList } = get();
        const existing = tokens.get(mint);
        
        if (!existing) {
          console.warn(`Cannot update token ${mint}: not found in store`);
          return;
        }
        
        const updated: Token = {
          ...existing,
          ...updates,
          lastUpdated: Date.now(),
        };
        
        // Update map
        const newTokens = new Map(tokens);
        newTokens.set(mint, updated);
        
        // Update list
        const newTokenList = tokenList.map(t => 
          t.mint === mint ? updated : t
        );
        
        set({
          tokens: newTokens,
          tokenList: newTokenList,
        });
      },
      
      removeToken: (mint: string) => {
        const { tokens, tokenList } = get();
        
        if (!tokens.has(mint)) {
          return;
        }
        
        const newTokens = new Map(tokens);
        newTokens.delete(mint);
        
        const newTokenList = tokenList.filter(t => t.mint !== mint);
        
        set({
          tokens: newTokens,
          tokenList: newTokenList,
          totalTokens: newTokenList.length,
        });
      },
      
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
      
      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },
      
      clearTokens: () => {
        set({
          tokens: new Map(),
          tokenList: [],
          totalTokens: 0,
          error: null,
          lastFetch: null,
        });
      },
      
      // Getters
      getTokenByMint: (mint: string) => {
        return get().tokens.get(mint);
      },
      
      getTokenList: (filters?: TokenFilters) => {
        const { tokenList } = get();
        return filterTokens(tokenList, filters);
      },
    }),
    { name: 'TokenDataStore' }
  )
);

/**
 * Selector hooks for optimized re-renders
 */

// Get specific token by mint
export const useToken = (mint: string) => {
  return useTokenDataStore(state => state.tokens.get(mint));
};

// Get filtered token list
export const useFilteredTokens = (filters?: TokenFilters) => {
  return useTokenDataStore(state => filterTokens(state.tokenList, filters));
};

// Get loading state
export const useTokensLoading = () => {
  return useTokenDataStore(state => state.isLoading);
};

// Get error state
export const useTokensError = () => {
  return useTokenDataStore(state => state.error);
};

// Get total count
export const useTokensCount = () => {
  return useTokenDataStore(state => state.totalTokens);
};

// Get last fetch timestamp
export const useLastFetch = () => {
  return useTokenDataStore(state => state.lastFetch);
};
