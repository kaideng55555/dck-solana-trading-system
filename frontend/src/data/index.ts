/**
 * Global Token Data Layer - Main Export
 * Central import point for all token data functionality
 */

// Types
export type {
  Token,
  TokenSocials,
  TokenAuthorities,
  TokenMarketData,
  TokenBondingData,
  TokenMetadata,
  RawTokenData,
  TokenDataState,
  TokenFilters,
  PollingConfig,
  ApiResponse,
} from './tokenTypes';

// Store
export {
  useTokenDataStore,
  useToken,
  useFilteredTokens,
  useTokensLoading,
  useTokensError,
  useTokensCount,
  useLastFetch,
} from './tokenDataStore';

// Main hooks
export {
  useGlobalTokenData,
  useTokenByMint,
  useFilteredTokenList,
  useTokenSearch,
  useSortedTokens,
  useTokensByGraduation,
  useSafeTokens,
  useHighRiskTokens,
} from './useGlobalTokenData';

// Utilities
export {
  normalizeToken,
  normalizeTokens,
  updateNormalizedToken,
} from './tokenNormalizer';

// Bonding curve analysis
export {
  analyzeBondingCurve,
  getCurveStageDescription,
  getCurveStageEmoji,
  getCurveTrendEmoji,
  type BondingInfo,
  type CurveStage,
  type CurveTrend,
  type BondingFlags,
} from './bondingAnalyzer';

// Liquidity analysis & rug detection
export {
  analyzeLiquidity,
  getLiquidityHealthDescription,
  getLiquidityHealthColor,
  getLiquidityStatusEmoji,
  type LiquidityInfo,
} from './liquidityAnalyzer';

// Authority analysis & fake renounce detection
export {
  analyzeAuthorities,
  getAuthorityRiskDescription,
  getAuthorityRiskColor,
  getAuthorityStatusEmoji,
  getAuthorityStatusLabel,
  type AuthorityInfo,
} from './authorityAnalyzer';

// Unified API wrapper
export {
  fetchTokenList,
  fetchTokenByMint,
  fetchPriceData,
  fetchHolders,
  fetchLiquidityEvents,
  clearCache,
  clearCacheKey,
  getCacheStats,
  ERROR_CODES,
  type ApiResult,
  type ApiSuccess,
  type ApiError,
  type PriceDataPoint,
  type TokenHolder,
  type HoldersData,
  type LiquidityEvent,
} from './api';

// Legacy API (for gradual migration)
export {
  fetchTokens,
  fetchTokenByMint as fetchTokenByMintLegacy,
  fetchNewTokens,
  fetchPriceUpdates,
  checkApiHealth,
} from './mockApi';
