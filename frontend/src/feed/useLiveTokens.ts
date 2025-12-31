/**
 * useLiveTokens - React Hooks for Live Token Feed
 * 
 * Provides a clean set of React hooks that read from GlobalFeedStore
 * and deliver real-time token selectors for the entire app.
 * 
 * Features:
 * - Optimized with shallow selectors
 * - Memoized computed lists
 * - No unnecessary re-renders
 * - Type-safe Token access
 * 
 * Usage:
 * ```typescript
 * // Get all tokens
 * const tokens = useLiveTokens();
 * 
 * // Get specific token
 * const token = useToken('MINT_ADDRESS');
 * 
 * // Get fresh tokens (< 2 min old)
 * const fresh = useFreshTokens();
 * 
 * // Get curve edge tokens (near graduation)
 * const edgeTokens = useCurveEdgeTokens();
 * ```
 */

import { useMemo } from 'react';
import { useGlobalFeedStore } from './GlobalFeedStore';
import type { Token } from '../data/tokenTypes';

// ============================================================
// CORE HOOKS
// ============================================================

/**
 * Get all live tokens as an array.
 * Uses shallow selector for stable reference.
 */
export function useLiveTokens(): Token[] {
  return useGlobalFeedStore((state) => state.getAll());
}

/**
 * Get a specific token by mint address.
 * Uses memoized selector for optimal performance.
 */
export function useToken(mint: string): Token | undefined {
  return useGlobalFeedStore((state) => state.tokens[mint]);
}

/**
 * Get engine connection status.
 */
export function useEngineStatus() {
  return useGlobalFeedStore((state) => state.engineStatus);
}

// ============================================================
// FILTERED HOOKS
// ============================================================

/**
 * Get fresh tokens (less than 2 minutes old).
 * Sorted by creation time (oldest first).
 */
export function useFreshTokens(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    const now = Date.now();
    const twoMinutesAgo = now - (2 * 60 * 1000);

    return allTokens
      .filter((token) => {
        const ageSeconds = token.ageMinutes * 60;
        return ageSeconds < 120;
      })
      .sort((a, b) => a.createdAt - b.createdAt); // ASC: oldest first
  }, [allTokens]);
}

/**
 * Get curve edge tokens (near graduation with positive momentum).
 * - Bonding progress >= 96%
 * - Velocity score > 1.0 (proxy for price velocity)
 * Sorted by bonding progress (highest first).
 */
export function useCurveEdgeTokens(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens
      .filter((token) => {
        const bondingProgress = token.bonding.bondingProgress || 0;
        const velocityScore = token.bonding.velocityScore || 0;
        
        // velocityScore is 0-100, where 50 = neutral
        // Convert to actual velocity threshold (1.0)
        // velocityScore > 50 means positive velocity
        const hasPositiveVelocity = velocityScore > 55; // ~1.0 velocity

        return bondingProgress >= 96 && hasPositiveVelocity;
      })
      .sort((a, b) => {
        const progressA = a.bonding.bondingProgress || 0;
        const progressB = b.bonding.bondingProgress || 0;
        return progressB - progressA; // DESC: highest first
      });
  }, [allTokens]);
}

/**
 * Get graduated tokens (bonding complete).
 * Sorted by market cap (highest first).
 */
export function useGraduatedTokens(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens
      .filter((token) => {
        const bondingProgress = token.bonding.bondingProgress || 0;
        return bondingProgress >= 100;
      })
      .sort((a, b) => {
        const mcA = a.market.marketCap || 0;
        const mcB = b.market.marketCap || 0;
        return mcB - mcA; // DESC: highest first
      });
  }, [allTokens]);
}

/**
 * Get trending tokens based on velocity + volume.
 * Formula: trendingScore = (velocityScore * 2) + (volume24h / 10000)
 * Returns top 20 tokens sorted by trending score (highest first).
 */
export function useTrendingTokens(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    // Calculate trending score for each token
    const tokensWithScore = allTokens.map((token) => {
      const velocityScore = token.bonding.velocityScore || 0;
      const volume24h = token.market.volume24h || 0;
      
      // Formula: velocity contribution + volume contribution
      const trendingScore = (velocityScore * 2) + (volume24h / 10000);

      return {
        token,
        trendingScore,
      };
    });

    // Sort by trending score DESC and take top 20
    return tokensWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 20)
      .map((item) => item.token);
  }, [allTokens]);
}

/**
 * Get risky tokens (dangerous authorities or low liquidity).
 * - Authority risk = DANGER
 * - OR liquidity score <= 30
 * Sorted by creation time (newest first).
 */
export function useRiskyTokens(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens
      .filter((token) => {
        const authorityRiskScore = token.authorityRiskScore || 0;
        const liquidityHealth = token.liquidityHealth || 0;

        // Authority risk score: 0=SAFE, 50=WARNING, 100=DANGER
        const isDangerousAuthority = authorityRiskScore >= 75; // High risk threshold
        const isLowLiquidity = liquidityHealth <= 30;

        return isDangerousAuthority || isLowLiquidity;
      })
      .sort((a, b) => b.createdAt - a.createdAt); // DESC: newest first
  }, [allTokens]);
}

// ============================================================
// ADVANCED HOOKS
// ============================================================

/**
 * Get tokens filtered by custom predicate.
 * Use this for custom filtering logic not covered by other hooks.
 * 
 * @example
 * const highVolumeTokens = useFilteredTokens(
 *   (token) => token.market.volume24h > 50000
 * );
 */
export function useFilteredTokens(
  predicate: (token: Token) => boolean
): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens.filter(predicate);
  }, [allTokens, predicate]);
}

/**
 * Get tokens sorted by custom comparator.
 * 
 * @example
 * const byPrice = useSortedTokens(
 *   (a, b) => b.market.price - a.market.price
 * );
 */
export function useSortedTokens(
  compareFn: (a: Token, b: Token) => number
): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return [...allTokens].sort(compareFn);
  }, [allTokens, compareFn]);
}

/**
 * Get active tokens (alive with sufficient liquidity and volume).
 * Filters for tokens that are actively trading.
 */
export function useActiveTokens(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens.filter((token) => {
      return (
        token.isAlive &&
        token.market.liquidity > 500 &&
        token.market.volume24h > 100
      );
    });
  }, [allTokens]);
}

/**
 * Get tokens by bonding stage.
 * 
 * @param stage - 'new' | 'ramping' | 'peak' | 'graduated'
 */
export function useTokensByStage(
  stage: 'new' | 'ramping' | 'peak' | 'graduated'
): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens.filter((token) => token.bonding.curveStage === stage);
  }, [allTokens, stage]);
}

/**
 * Get safe tokens (fully renounced + LP secured).
 */
export function useSafeTokens(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens.filter((token) => {
      return (
        token.isFullyRenounced &&
        token.lpLocked &&
        !token.rugLikely &&
        token.riskScore < 30
      );
    });
  }, [allTokens]);
}

/**
 * Get tokens with sniper signals (fresh, curve edge, volume spike).
 * Computed from token properties:
 * - Fresh: age < 2 minutes
 * - Curve edge: bonding >= 96% with positive velocity
 * - Volume spike: would need historical data (approximated by high volume)
 */
export function useSniperOpportunities(): Token[] {
  const allTokens = useLiveTokens();

  return useMemo(() => {
    return allTokens.filter((token) => {
      const ageSeconds = token.ageMinutes * 60;
      const bondingProgress = token.bonding.bondingProgress || 0;
      const velocityScore = token.bonding.velocityScore || 0;
      const volume24h = token.market.volume24h || 0;

      // Sniper signals
      const isFresh = ageSeconds < 120; // < 2 minutes
      const isCurveEdge = bondingProgress >= 96 && velocityScore > 55;
      const hasHighVolume = volume24h > 5000; // Proxy for volume spike

      // Any signal active
      return isFresh || isCurveEdge || hasHighVolume;
    });
  }, [allTokens]);
}

/**
 * Get tokens count (total tracked).
 */
export function useTokensCount(): number {
  return useGlobalFeedStore((state) => Object.keys(state.tokens).length);
}

/**
 * Get last updated timestamp.
 */
export function useLastUpdated(): number {
  return useGlobalFeedStore((state) => state.lastUpdated);
}

// ============================================================
// STORE CONTROL HOOKS
// ============================================================

/**
 * Get store control methods (start, stop, subscribe, unsubscribe).
 * Use this to programmatically control the feed engine.
 */
export function useFeedControls() {
  const start = useGlobalFeedStore((state) => state.start);
  const stop = useGlobalFeedStore((state) => state.stop);
  const subscribeTo = useGlobalFeedStore((state) => state.subscribeTo);
  const unsubscribeFrom = useGlobalFeedStore((state) => state.unsubscribeFrom);

  return {
    start,
    stop,
    subscribeTo,
    unsubscribeFrom,
  };
}

// ============================================================
// EXPORT ALL
// ============================================================

export default useLiveTokens;
