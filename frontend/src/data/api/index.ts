/**
 * Unified API Wrapper - Single Abstraction Layer for Token Data
 * 
 * Features:
 * - In-memory caching with TTL
 * - Retry logic with exponential backoff
 * - Rate limiting via token bucket
 * - Normalized error handling
 * - Mock API integration (easy to swap for real backend)
 * 
 * Architecture:
 * UI → API Wrapper → Mock/Real Backend → Normalizer → Store
 */

import type { RawTokenData } from '../tokenTypes';
import * as mockApi from '../mockApi';

// =============================================
// TYPES
// =============================================

/**
 * Successful API response
 */
export interface ApiSuccess<T> {
  ok: true;
  data: T;
  cached?: boolean;
  timestamp: number;
}

/**
 * Failed API response
 */
export interface ApiError {
  ok: false;
  code: string;
  message: string;
  timestamp: number;
}

/**
 * Generic API response (success or error)
 * Named ApiResult to avoid conflict with legacy ApiResponse in tokenTypes
 */
export type ApiResult<T> = ApiSuccess<T> | ApiError;

/**
 * Alias for ApiResult for better naming in function signatures
 */
export type ApiResponse<T> = ApiResult<T>;

/**
 * Price data point for charts
 */
export interface PriceDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

/**
 * Holder information
 */
export interface TokenHolder {
  address: string;
  balance: number;
  percentage: number;
}

/**
 * Holders response
 */
export interface HoldersData {
  totalHolders: number;
  topHolders: TokenHolder[];
}

/**
 * Liquidity event
 */
export interface LiquidityEvent {
  timestamp: number;
  type: 'add' | 'remove' | 'burn' | 'lock';
  amount: number;
  txHash: string;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// =============================================
// CONSTANTS
// =============================================

// Cache TTLs (in milliseconds)
const CACHE_TTL_TOKEN_LIST = 10000;      // 10 seconds
const CACHE_TTL_TOKEN_DETAIL = 30000;    // 30 seconds
const CACHE_TTL_PRICE_DATA = 5000;       // 5 seconds (real-time)
const CACHE_TTL_HOLDERS = 60000;         // 1 minute
const CACHE_TTL_EVENTS = 60000;          // 1 minute

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;        // 1 second
const RETRY_BACKOFF_MULTIPLIER = 2;

// Rate limiting configuration
const RATE_LIMIT_CAPACITY = 10;          // Max tokens
const RATE_LIMIT_REFILL_RATE = 5;        // Tokens per second
const RATE_LIMIT_REFILL_INTERVAL = 200;  // Refill every 200ms

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// =============================================
// IN-MEMORY CACHE
// =============================================

class Cache {
  private store = new Map<string, CacheEntry<any>>();
  
  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set cached value with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.store.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Global cache instance
const cache = new Cache();

// =============================================
// RATE LIMITER (Token Bucket Algorithm)
// =============================================

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,
    private refillRate: number,
    private refillInterval: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const timeSinceRefill = now - this.lastRefill;
    const refillCount = Math.floor(timeSinceRefill / this.refillInterval);
    
    if (refillCount > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + refillCount);
      this.lastRefill = now;
    }
  }
  
  /**
   * Try to consume a token
   * @returns true if token consumed, false if rate limited
   */
  tryConsume(): boolean {
    this.refill();
    
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    
    return false;
  }
  
  /**
   * Wait until a token is available
   */
  async waitForToken(): Promise<void> {
    while (!this.tryConsume()) {
      await new Promise(resolve => setTimeout(resolve, this.refillInterval));
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter(
  RATE_LIMIT_CAPACITY,
  RATE_LIMIT_REFILL_RATE,
  RATE_LIMIT_REFILL_INTERVAL
);

// =============================================
// ERROR HANDLING
// =============================================

/**
 * Normalize any error into ApiError format
 */
function normalizeError(error: unknown, context?: string): ApiError {
  const timestamp = Date.now();
  
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      ok: false,
      code: ERROR_CODES.NETWORK_ERROR,
      message: `Network error${context ? ` in ${context}` : ''}: ${error.message}`,
      timestamp,
    };
  }
  
  // Timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return {
      ok: false,
      code: ERROR_CODES.TIMEOUT,
      message: `Request timeout${context ? ` in ${context}` : ''}`,
      timestamp,
    };
  }
  
  // Standard Error objects
  if (error instanceof Error) {
    return {
      ok: false,
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      timestamp,
    };
  }
  
  // Unknown error types
  return {
    ok: false,
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: `Unknown error${context ? ` in ${context}` : ''}: ${String(error)}`,
    timestamp,
  };
}

// =============================================
// RETRY LOGIC
// =============================================

/**
 * Retry a function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  context: string,
  maxRetries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate backoff delay
      const delay = INITIAL_RETRY_DELAY * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt);
      
      console.warn(
        `[API] Retry ${attempt + 1}/${maxRetries} for ${context} after ${delay}ms`,
        lastError.message
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  throw lastError || new Error(`Failed after ${maxRetries} retries`);
}

// =============================================
// API FUNCTIONS
// =============================================

/**
 * Fetch list of tokens
 * 
 * @param count - Number of tokens to fetch (default: 100)
 * @returns ApiResponse with array of RawTokenData
 */
export async function fetchTokenList(
  count: number = 100
): Promise<ApiResult<RawTokenData[]>> {
  const cacheKey = `token-list-${count}`;
  
  try {
    // Check cache first
    const cached = cache.get<RawTokenData[]>(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }
    
    // Wait for rate limit token
    await rateLimiter.waitForToken();
    
    // Fetch with retry - mockApi returns its own response format
    const mockResponse = await withRetry(
      () => mockApi.fetchTokens(count),
      'fetchTokenList'
    );
    
    // Convert mockApi response format to our ApiResponse format
    if (!mockResponse.success || !mockResponse.data) {
      return {
        ok: false,
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: mockResponse.error || 'Failed to fetch tokens',
        timestamp: Date.now(),
      };
    }
    
    // Cache result
    cache.set(cacheKey, mockResponse.data, CACHE_TTL_TOKEN_LIST);
    
    return {
      ok: true,
      data: mockResponse.data,
      cached: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    return normalizeError(error, 'fetchTokenList');
  }
}

/**
 * Fetch single token by mint address
 * 
 * @param mint - Token mint address
 * @returns ApiResponse with RawTokenData
 */
export async function fetchTokenByMint(
  mint: string
): Promise<ApiResult<RawTokenData>> {
  const cacheKey = `token-${mint}`;
  
  try {
    // Validate mint address
    if (!mint || mint.trim() === '') {
      return {
        ok: false,
        code: ERROR_CODES.INVALID_RESPONSE,
        message: 'Invalid mint address',
        timestamp: Date.now(),
      };
    }
    
    // Check cache first
    const cached = cache.get<RawTokenData>(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }
    
    // Wait for rate limit token
    await rateLimiter.waitForToken();
    
    // Fetch with retry - mockApi returns its own response format
    const mockResponse = await withRetry(
      () => mockApi.fetchTokenByMint(mint),
      `fetchTokenByMint(${mint})`
    );
    
    // Convert mockApi response format to our ApiResponse format
    if (!mockResponse.success || !mockResponse.data) {
      return {
        ok: false,
        code: mockResponse.data ? ERROR_CODES.UNKNOWN_ERROR : ERROR_CODES.NOT_FOUND,
        message: mockResponse.error || `Token not found: ${mint}`,
        timestamp: Date.now(),
      };
    }
    
    // Cache result
    cache.set(cacheKey, mockResponse.data, CACHE_TTL_TOKEN_DETAIL);
    
    return {
      ok: true,
      data: mockResponse.data,
      cached: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    return normalizeError(error, 'fetchTokenByMint');
  }
}

/**
 * Fetch price/time series data for charts
 * 
 * @param mint - Token mint address
 * @param timeframe - Time range ('1H', '24H', '7D', '30D')
 * @returns ApiResponse with array of PriceDataPoint
 */
export async function fetchPriceData(
  mint: string,
  timeframe: '1H' | '24H' | '7D' | '30D' = '24H'
): Promise<ApiResult<PriceDataPoint[]>> {
  const cacheKey = `price-${mint}-${timeframe}`;
  
  try {
    // Validate mint address
    if (!mint || mint.trim() === '') {
      return {
        ok: false,
        code: ERROR_CODES.INVALID_RESPONSE,
        message: 'Invalid mint address',
        timestamp: Date.now(),
      };
    }
    
    // Check cache first
    const cached = cache.get<PriceDataPoint[]>(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }
    
    // Wait for rate limit token
    await rateLimiter.waitForToken();
    
    // Generate mock price data
    const priceData = await withRetry(
      async () => generateMockPriceData(mint, timeframe),
      `fetchPriceData(${mint}, ${timeframe})`
    );
    
    // Cache result
    cache.set(cacheKey, priceData, CACHE_TTL_PRICE_DATA);
    
    return {
      ok: true,
      data: priceData,
      cached: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    return normalizeError(error, 'fetchPriceData');
  }
}

/**
 * Fetch holder data
 * 
 * @param mint - Token mint address
 * @returns ApiResponse with HoldersData
 */
export async function fetchHolders(
  mint: string
): Promise<ApiResult<HoldersData>> {
  const cacheKey = `holders-${mint}`;
  
  try {
    // Validate mint address
    if (!mint || mint.trim() === '') {
      return {
        ok: false,
        code: ERROR_CODES.INVALID_RESPONSE,
        message: 'Invalid mint address',
        timestamp: Date.now(),
      };
    }
    
    // Check cache first
    const cached = cache.get<HoldersData>(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }
    
    // Wait for rate limit token
    await rateLimiter.waitForToken();
    
    // Generate mock holder data
    const holders = await withRetry(
      async () => generateMockHolders(mint),
      `fetchHolders(${mint})`
    );
    
    // Cache result
    cache.set(cacheKey, holders, CACHE_TTL_HOLDERS);
    
    return {
      ok: true,
      data: holders,
      cached: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    return normalizeError(error, 'fetchHolders');
  }
}

/**
 * Fetch liquidity events (adds, removes, burns, locks)
 * 
 * @param mint - Token mint address
 * @param limit - Max number of events to return (default: 50)
 * @returns ApiResponse with array of LiquidityEvent
 */
export async function fetchLiquidityEvents(
  mint: string,
  limit: number = 50
): Promise<ApiResult<LiquidityEvent[]>> {
  const cacheKey = `events-${mint}-${limit}`;
  
  try {
    // Validate mint address
    if (!mint || mint.trim() === '') {
      return {
        ok: false,
        code: ERROR_CODES.INVALID_RESPONSE,
        message: 'Invalid mint address',
        timestamp: Date.now(),
      };
    }
    
    // Check cache first
    const cached = cache.get<LiquidityEvent[]>(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }
    
    // Wait for rate limit token
    await rateLimiter.waitForToken();
    
    // Generate mock events
    const events = await withRetry(
      async () => generateMockLiquidityEvents(mint, limit),
      `fetchLiquidityEvents(${mint})`
    );
    
    // Cache result
    cache.set(cacheKey, events, CACHE_TTL_EVENTS);
    
    return {
      ok: true,
      data: events,
      cached: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    return normalizeError(error, 'fetchLiquidityEvents');
  }
}

/**
 * Fetch price updates for multiple tokens (for polling)
 * 
 * @param mints - Array of token mint addresses
 * @returns ApiResponse with array of partial RawTokenData (price updates only)
 */
export async function fetchPriceUpdates(
  mints: string[]
): Promise<ApiResult<Array<Partial<RawTokenData>>>> {
  const cacheKey = `price-updates-${mints.join(',')}`;
  
  try {
    // Validate input
    if (!mints || mints.length === 0) {
      return {
        ok: false,
        code: ERROR_CODES.INVALID_RESPONSE,
        message: 'No mint addresses provided',
        timestamp: Date.now(),
      };
    }
    
    // Check cache first (short TTL for price updates)
    const cached = cache.get<Array<Partial<RawTokenData>>>(cacheKey);
    if (cached) {
      return {
        ok: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }
    
    // Wait for rate limit token
    await rateLimiter.waitForToken();
    
    // Fetch updates with retry - mockApi returns its own response format
    const mockResponse = await withRetry(
      () => mockApi.fetchPriceUpdates(mints),
      'fetchPriceUpdates'
    );
    
    // Convert mockApi response format to our ApiResponse format
    if (!mockResponse.success || !mockResponse.data) {
      return {
        ok: false,
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: mockResponse.error || 'Failed to fetch price updates',
        timestamp: Date.now(),
      };
    }
    
    // Cache result with short TTL (5s for real-time updates)
    cache.set(cacheKey, mockResponse.data, CACHE_TTL_PRICE_DATA);
    
    return {
      ok: true,
      data: mockResponse.data,
      cached: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    return normalizeError(error, 'fetchPriceUpdates');
  }
}

// =============================================
// MOCK DATA GENERATORS (Temporary)
// =============================================

/**
 * Generate mock price data for charts
 * TODO: Replace with real API call
 */
async function generateMockPriceData(
  _mint: string,
  timeframe: string
): Promise<PriceDataPoint[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const now = Date.now();
  const intervals = {
    '1H': { count: 60, interval: 60000 },      // 1 minute intervals
    '24H': { count: 288, interval: 300000 },   // 5 minute intervals
    '7D': { count: 168, interval: 3600000 },   // 1 hour intervals
    '30D': { count: 120, interval: 21600000 }, // 6 hour intervals
  };
  
  const config = intervals[timeframe as keyof typeof intervals] || intervals['24H'];
  const basePrice = 0.00001 + Math.random() * 0.0001;
  
  const dataPoints: PriceDataPoint[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const timestamp = now - (config.count - i) * config.interval;
    const variance = (Math.random() - 0.5) * 0.1; // ±10% variance
    const price = basePrice * (1 + variance);
    const volume = Math.random() * 50000;
    
    dataPoints.push({
      timestamp,
      price,
      volume,
    });
  }
  
  return dataPoints;
}

/**
 * Generate mock holder data
 * TODO: Replace with real API call
 */
async function generateMockHolders(_mint: string): Promise<HoldersData> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const totalHolders = Math.floor(Math.random() * 5000) + 100;
  const topHolders: TokenHolder[] = [];
  
  let remainingPercentage = 100;
  
  for (let i = 0; i < 10; i++) {
    const percentage = Math.random() * (remainingPercentage / 2);
    remainingPercentage -= percentage;
    
    topHolders.push({
      address: `${generateRandomAddress()}`,
      balance: Math.floor(Math.random() * 1000000),
      percentage: parseFloat(percentage.toFixed(2)),
    });
  }
  
  return {
    totalHolders,
    topHolders,
  };
}

/**
 * Generate mock liquidity events
 * TODO: Replace with real API call
 */
async function generateMockLiquidityEvents(
  _mint: string,
  limit: number
): Promise<LiquidityEvent[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const events: LiquidityEvent[] = [];
  const types: Array<'add' | 'remove' | 'burn' | 'lock'> = ['add', 'remove', 'burn', 'lock'];
  const now = Date.now();
  
  for (let i = 0; i < limit; i++) {
    const timestamp = now - i * 600000; // 10 minute intervals
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.random() * 10000;
    
    events.push({
      timestamp,
      type,
      amount,
      txHash: generateRandomTxHash(),
    });
  }
  
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Generate random Solana address
 */
function generateRandomAddress(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

/**
 * Generate random transaction hash
 */
function generateRandomTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// =============================================
// CACHE MANAGEMENT
// =============================================

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clearAll();
}

/**
 * Clear specific cache entry
 */
export function clearCacheKey(key: string): void {
  cache.clear(key);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}

// =============================================
// EXPORTS
// =============================================

export {
  // Types already exported at top
  cache,
  rateLimiter,
};
