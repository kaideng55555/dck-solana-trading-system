/**
 * Swap Engine Type Definitions
 * 
 * Core types for Jupiter + Jito swap infrastructure
 */

import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

// =============================================
// SWAP REQUEST & RESPONSE
// =============================================

/**
 * Swap request parameters
 */
export interface SwapRequest {
  /** Input token mint address */
  inputMint: string;
  
  /** Output token mint address */
  outputMint: string;
  
  /** Amount to swap (in base units, e.g., lamports) */
  amountIn: number | string;
  
  /** Slippage tolerance in basis points (e.g., 50 = 0.5%) */
  slippage: number;
  
  /** Priority fee in microlamports (e.g., 100000 = 0.0001 SOL) */
  priorityFee?: number;
  
  /** Whether to use Jito MEV protection */
  useJito: boolean;
  
  /** Optional: Jito tip amount in SOL (defaults based on priority) */
  jitoTipAmount?: number;
}

/**
 * Swap execution result
 */
export interface SwapResult {
  /** Transaction signature */
  signature: string;
  
  /** Route information used for the swap */
  routeUsed: RouteInfo;
  
  /** Actual output amount received */
  outputAmount: string;
  
  /** Price impact percentage */
  priceImpact: number;
  
  /** Total fees paid */
  fees: SwapFees;
  
  /** Jito tip amount if used */
  jitoTipUsed?: number;
  
  /** Timestamp of swap execution */
  timestamp: number;
}

/**
 * Swap fees breakdown
 */
export interface SwapFees {
  /** Jupiter platform fee */
  platformFee: number;
  
  /** Network transaction fee */
  transactionFee: number;
  
  /** Priority fee paid */
  priorityFee: number;
  
  /** Jito tip (if applicable) */
  jitoTip?: number;
  
  /** Total fees in SOL */
  totalFees: number;
}

// =============================================
// JUPITER ROUTE TYPES
// =============================================

/**
 * Jupiter route information
 */
export interface RouteInfo {
  /** Route identifier */
  id: string;
  
  /** Input token mint */
  inputMint: string;
  
  /** Output token mint */
  outputMint: string;
  
  /** Input amount */
  inAmount: string;
  
  /** Estimated output amount */
  outAmount: string;
  
  /** Price impact in percentage */
  priceImpact: number;
  
  /** Route steps (DEX hops) */
  marketInfos: MarketInfo[];
  
  /** Other amounts (for complex routes) */
  otherAmountThreshold?: string;
}

/**
 * Market/DEX information for each hop
 */
export interface MarketInfo {
  /** DEX name (e.g., "Raydium", "Orca") */
  label: string;
  
  /** Market/pool address */
  id: string;
  
  /** Input token mint for this hop */
  inputMint: string;
  
  /** Output token mint for this hop */
  outputMint: string;
  
  /** Fee percentage */
  lpFee?: number;
  
  /** Platform fee */
  platformFee?: number;
}

/**
 * Route request parameters
 */
export interface RouteRequest {
  /** Input token mint address */
  inputMint: string;
  
  /** Output token mint address */
  outputMint: string;
  
  /** Amount to swap (in smallest units) */
  amount: number | string;
  
  /** Slippage tolerance in basis points */
  slippage: number;
  
  /** Only use direct routes (no multi-hop) */
  onlyDirectRoutes?: boolean;
  
  /** Maximum number of routes to return */
  maxRoutes?: number;
}

/**
 * Route response from Jupiter
 */
export interface RouteResponse {
  /** Array of available routes */
  routes: RouteInfo[];
  
  /** Best route (first in array) */
  bestRoute: RouteInfo;
  
  /** Timestamp of route calculation */
  timestamp: number;
}

// =============================================
// JITO TYPES
// =============================================

/**
 * Jito tip configuration
 */
export interface JitoTipConfig {
  /** Tip amount in SOL */
  tipAmount: number;
  
  /** Jito tip account to send to */
  tipAccount: PublicKey;
  
  /** Priority level (affects tip amount) */
  priority?: 'low' | 'medium' | 'high' | 'turbo';
}

/**
 * Jito bundle result
 */
export interface JitoBundleResult {
  /** Bundle ID */
  bundleId: string;
  
  /** Transaction signatures in bundle */
  signatures: string[];
  
  /** Tip account used */
  tipAccount: string;
  
  /** Tip amount sent */
  tipAmount: number;
}

// =============================================
// WALLET TYPES
// =============================================

/**
 * Wallet adapter interface (simplified)
 */
export interface WalletAdapter {
  /** Public key of connected wallet */
  publicKey: PublicKey | null;
  
  /** Sign transaction */
  signTransaction?: <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise<T>;
  
  /** Sign all transactions */
  signAllTransactions?: <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => Promise<T[]>;
  
  /** Send transaction */
  sendTransaction?: (
    transaction: Transaction | VersionedTransaction,
    connection: any
  ) => Promise<string>;
  
  /** Is wallet connected */
  connected: boolean;
}

// =============================================
// ERROR TYPES
// =============================================

/**
 * Swap error codes
 */
export enum SwapErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  JITO_ERROR = 'JITO_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Swap error
 */
export interface SwapError {
  /** Error code */
  code: SwapErrorCode;
  
  /** Error message */
  message: string;
  
  /** Additional error details */
  details?: any;
  
  /** Timestamp */
  timestamp: number;
}

// =============================================
// CONSTANTS
// =============================================

/**
 * Common Solana token mints
 */
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  WSOL: 'So11111111111111111111111111111111111111112',
} as const;

/**
 * Default slippage values (in basis points)
 */
export const DEFAULT_SLIPPAGE = {
  LOW: 10,      // 0.1%
  MEDIUM: 50,   // 0.5%
  HIGH: 100,    // 1%
  TURBO: 500,   // 5% (for new tokens)
} as const;

/**
 * Default priority fees (in microlamports)
 */
export const DEFAULT_PRIORITY_FEE = {
  NONE: 0,
  LOW: 50000,      // ~0.00005 SOL
  MEDIUM: 100000,  // ~0.0001 SOL
  HIGH: 500000,    // ~0.0005 SOL
  TURBO: 1000000,  // ~0.001 SOL
} as const;

/**
 * Default Jito tip amounts (in SOL)
 */
export const DEFAULT_JITO_TIP = {
  LOW: 0.0001,
  MEDIUM: 0.001,
  HIGH: 0.01,
  TURBO: 0.05,
} as const;
