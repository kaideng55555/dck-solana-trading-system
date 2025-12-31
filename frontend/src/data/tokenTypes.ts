/**
 * Global Token Type Definitions
 * Unified token data structure across the entire application
 */

/**
 * Social media links for a token
 */
export interface TokenSocials {
  twitter?: string;
  telegram?: string;
  website?: string;
  discord?: string;
}

/**
 * Security/Authority information
 */
export interface TokenAuthorities {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  updateAuthority: string | null;
}

/**
 * Market/Trading data
 */
export interface TokenMarketData {
  price: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  priceChange24h?: number;
  holders?: number;
}

/**
 * Bonding curve / graduation status
 */
export interface TokenBondingData {
  bondingProgress: number; // 0-100
  currentReserves?: number;
  targetReserves?: number;
  isMigrated: boolean; // Graduated to Raydium/other DEX
  
  // Enhanced bonding analysis (from bondingAnalyzer)
  curveStage?: 'new' | 'ramping' | 'peak' | 'graduated';
  isCloseToMigration?: boolean;
  liquidityScore?: number; // 0-100
  curveHealth?: number; // 0-100
  curveTrend?: 'up' | 'down' | 'flat';
  estimatedGraduationTime?: number; // minutes
  velocityScore?: number; // 0-100
  stabilityScore?: number; // 0-100
  buyPressureRatio?: number; // 0-200, 100 = balanced
  
  // Bonding curve flags
  flags?: {
    lowLiquidity?: boolean;
    abnormalBuyPressure?: boolean;
    abnormalSellPressure?: boolean;
    curveFlattening?: boolean;
    migrationLikely?: boolean;
    rugRisk?: boolean;
    healthyCurve?: boolean;
  };
}

/**
 * Token metadata
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  decimals: number;
}

/**
 * Unified Token Object - Main data structure
 * This is the single source of truth for all token data in the app
 */
export interface Token {
  // Core identifiers
  mint: string; // Solana mint address (primary key)
  
  // Metadata
  metadata: TokenMetadata;
  
  // Market data
  market: TokenMarketData;
  
  // Bonding/graduation data
  bonding: TokenBondingData;
  
  // Security data
  authorities: TokenAuthorities;
  
  // Computed security flags
  lpBurned: boolean;
  mintAuthorityDisabled: boolean;
  freezeAuthorityDisabled: boolean;
  
  // Liquidity analysis (from liquidityAnalyzer)
  liquidityHealth: number; // 0-100, overall liquidity health score
  lpRemoved: boolean; // LP was pulled/removed
  lpLocked: boolean; // LP tokens are locked
  rugLikely: boolean; // High probability of rug pull
  earlyRugWarning: boolean; // Warning signs of potential rug
  suspiciousAuthority: boolean; // Authorities active on valuable token
  honeypotRisk: boolean; // Potential honeypot detected
  whaleExitSpike: boolean; // Large holder dumping
  recentOutflow: number; // Recent sell pressure ($)
  liquidityDropPercent: number; // Recent liquidity drop (%)
  lpMigrationDetected: boolean; // LP migration in progress
  liquidityFlags: string[]; // Summary of all liquidity warnings
  
  // Authority analysis (from authorityAnalyzer)
  fakeRenounceDetected: boolean; // Fake renounce pattern detected
  authorityRiskScore: number; // 0-100, authority risk level
  isFullyRenounced: boolean; // All authorities disabled + LP not pulled
  isMigratedEligible: boolean; // Fully renounced + LP secured
  authorityFlags: string[]; // Summary of all authority warnings
  
  // Social links
  socials: TokenSocials;
  
  // Temporal data
  createdAt: number; // Unix timestamp (milliseconds)
  lastUpdated: number; // Unix timestamp (milliseconds)
  
  // Computed fields
  ageMinutes: number; // Age since creation in minutes
  isAlive: boolean; // True if token has sufficient liquidity/activity
  riskScore: number; // 0-100, higher = more risky
}

/**
 * Raw API response shape (before normalization)
 * This represents what we get from external APIs
 */
export interface RawTokenData {
  address?: string;
  mint?: string;
  name: string;
  symbol: string;
  logo?: string;
  image?: string;
  decimals?: number;
  
  // Market data (various formats from different APIs)
  price?: number;
  priceUsd?: number;
  marketCap?: number;
  market_cap?: number;
  liquidity?: number;
  liquidityUsd?: number;
  volume24h?: number;
  volume_24h?: number;
  
  // Bonding data
  bondingProgress?: number;
  bonding_curve_percentage?: number;
  migrated?: boolean;
  graduated?: boolean;
  
  // Authorities
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  updateAuthority?: string | null;
  
  // Security flags
  lpBurned?: boolean;
  lp_burned?: boolean;
  
  // Socials
  twitter?: string;
  telegram?: string;
  website?: string;
  socials?: Partial<TokenSocials>;
  
  // Temporal
  createdAt?: number;
  created_at?: number;
  createdTimestamp?: number;
  launchTimestamp?: number;
  
  // Additional fields
  holders?: number;
  holdersCount?: number;
  age?: number; // in seconds
  alive?: boolean;
  
  [key: string]: any; // Allow additional fields
}

/**
 * Data store state interface
 */
export interface TokenDataState {
  // Token storage
  tokens: Map<string, Token>; // Map: mint address -> Token
  tokenList: Token[]; // Sorted array for display
  
  // Loading states
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  
  // Metadata
  lastFetch: number | null; // Timestamp of last successful fetch
  totalTokens: number;
  
  // Actions
  setTokens: (tokens: Token[]) => void;
  updateToken: (mint: string, updates: Partial<Token>) => void;
  removeToken: (mint: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearTokens: () => void;
  
  // Getters
  getTokenByMint: (mint: string) => Token | undefined;
  getTokenList: (filters?: TokenFilters) => Token[];
}

/**
 * Filter options for token queries
 */
export interface TokenFilters {
  minMarketCap?: number;
  maxMarketCap?: number;
  minLiquidity?: number;
  minVolume24h?: number;
  onlyMigrated?: boolean;
  onlyAlive?: boolean;
  onlySafe?: boolean; // lpBurned + authorities disabled
  minAge?: number; // in minutes
  maxAge?: number; // in minutes
  hasTwitter?: boolean;
  hasTelegram?: boolean;
  search?: string; // Search by name or symbol
}

/**
 * Polling configuration
 */
export interface PollingConfig {
  enabled: boolean;
  interval: number; // milliseconds
  onError?: (error: Error) => void;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}
