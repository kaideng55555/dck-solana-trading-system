/**
 * Liquidity Analyzer - Rug Detection & LP Health Monitoring
 * 
 * Detects:
 * - LP removals and burns
 * - Suspicious liquidity drops
 * - Authority risks (mint/freeze)
 * - Early rug warnings
 * - Honeypot patterns
 * - Whale exit spikes
 * 
 * Integration: Auto-called during token normalization
 */

import type { RawTokenData } from './tokenTypes';

// =============================================
// TYPES
// =============================================

export interface LiquidityInfo {
  // LP Status
  lpRemoved: boolean;
  lpBurned: boolean;
  lpLocked: boolean;
  
  // Liquidity Metrics
  liquidityDropPercent: number;
  liquidityHealth: number; // 0-100
  
  // Rug Detection
  rugLikely: boolean;
  earlyRugWarning: boolean;
  lpMigrationDetected: boolean;
  
  // Authority Risks
  suspiciousAuthority: boolean;
  mintAuthorityDisabled: boolean;
  freezeAuthorityDisabled: boolean;
  
  // Advanced Detection
  honeypotRisk: boolean;
  whaleExitSpike: boolean;
  recentOutflow: number;
  
  // Summary Flags
  flags: string[];
}

// =============================================
// CONSTANTS
// =============================================

// Burn address patterns (Solana)
const BURN_ADDRESSES = [
  '1111111111111111111111111111111111111111111',
  '11111111111111111111111111111111',
  'So11111111111111111111111111111111111111112', // Wrapped SOL
];

// Lock address patterns (placeholder - would need actual lock program addresses)
const LOCK_ADDRESSES = [
  'LockedTokenVault111111111111111111111111111',
  'TeamFinanceLock11111111111111111111111111',
];

// Thresholds
const LIQUIDITY_DROP_CRITICAL = 95; // % drop = confirmed rug
const LIQUIDITY_DROP_WARNING = 40;  // % drop = early warning
const LIQUIDITY_CRITICAL = 100;     // $ - critical liquidity level
const LIQUIDITY_LOW = 500;          // $ - low liquidity threshold
const LIQUIDITY_HEALTHY = 1000;     // $ - healthy liquidity threshold
const LIQUIDITY_EXCELLENT = 5000;   // $ - excellent liquidity

const WHALE_SELL_THRESHOLD = 0.05;  // 5% of total supply in one tx
const OUTFLOW_HIGH = 100000;        // $ - high outflow in 24h

// =============================================
// MAIN ANALYZER FUNCTION
// =============================================

/**
 * Analyze token liquidity for rug risks and LP health
 * 
 * @param rawToken - Raw token data from API
 * @returns LiquidityInfo - Complete liquidity analysis
 */
export function analyzeLiquidity(rawToken: RawTokenData): LiquidityInfo {
  // Initialize flags array
  const flags: string[] = [];
  
  // Extract liquidity data (handle multiple field name formats)
  const currentLiquidity = extractLiquidity(rawToken);
  const previousLiquidity = extractPreviousLiquidity(rawToken);
  const lpTokenOwner = extractLPOwner(rawToken);
  const lockAddress = extractLockAddress(rawToken);
  
  // Extract authority data
  const mintAuthority = extractMintAuthority(rawToken);
  const freezeAuthority = extractFreezeAuthority(rawToken);
  
  // Extract market data
  const volume24h = extractVolume24h(rawToken);
  const priceChange24h = extractPriceChange24h(rawToken);
  const marketCap = extractMarketCap(rawToken);
  
  // =============================================
  // LP STATUS DETECTION
  // =============================================
  
  const lpRemoved = checkLPRemoved(currentLiquidity, previousLiquidity);
  const lpBurned = checkLPBurned(lpTokenOwner);
  const lpLocked = checkLPLocked(lockAddress);
  
  if (lpRemoved) flags.push('LP_REMOVED');
  if (lpBurned) flags.push('LP_BURNED');
  if (lpLocked) flags.push('LP_LOCKED');
  
  // =============================================
  // LIQUIDITY METRICS
  // =============================================
  
  const liquidityDropPercent = calculateLiquidityDrop(currentLiquidity, previousLiquidity);
  const liquidityHealth = calculateLiquidityHealth(
    currentLiquidity,
    volume24h,
    lpBurned,
    lpLocked,
    liquidityDropPercent
  );
  
  if (liquidityDropPercent > LIQUIDITY_DROP_WARNING) {
    flags.push(`LIQUIDITY_DROP_${Math.round(liquidityDropPercent)}%`);
  }
  
  // =============================================
  // RUG DETECTION
  // =============================================
  
  const rugLikely = checkRugLikely(
    lpRemoved,
    liquidityDropPercent,
    currentLiquidity,
    liquidityHealth
  );
  
  const earlyRugWarning = checkEarlyRugWarning(
    liquidityDropPercent,
    lpRemoved,
    rugLikely
  );
  
  const lpMigrationDetected = checkLPMigration(
    liquidityDropPercent,
    volume24h,
    priceChange24h
  );
  
  if (rugLikely) flags.push('RUG_LIKELY');
  if (earlyRugWarning) flags.push('EARLY_RUG_WARNING');
  if (lpMigrationDetected) flags.push('LP_MIGRATION_DETECTED');
  
  // =============================================
  // AUTHORITY RISKS
  // =============================================
  
  const mintAuthorityDisabled = !mintAuthority || mintAuthority === null;
  const freezeAuthorityDisabled = !freezeAuthority || freezeAuthority === null;
  const suspiciousAuthority = checkSuspiciousAuthority(
    mintAuthority,
    freezeAuthority,
    currentLiquidity,
    marketCap
  );
  
  if (!mintAuthorityDisabled) flags.push('MINT_AUTHORITY_ACTIVE');
  if (!freezeAuthorityDisabled) flags.push('FREEZE_AUTHORITY_ACTIVE');
  if (suspiciousAuthority) flags.push('SUSPICIOUS_AUTHORITY');
  
  // =============================================
  // ADVANCED DETECTION
  // =============================================
  
  const honeypotRisk = checkHoneypotRisk(rawToken); // Placeholder for now
  const whaleExitSpike = checkWhaleExitSpike(rawToken); // Placeholder for now
  const recentOutflow = calculateRecentOutflow(volume24h, priceChange24h);
  
  if (honeypotRisk) flags.push('HONEYPOT_RISK');
  if (whaleExitSpike) flags.push('WHALE_EXIT_SPIKE');
  if (recentOutflow > OUTFLOW_HIGH) {
    flags.push(`HIGH_OUTFLOW_$${Math.round(recentOutflow / 1000)}K`);
  }
  
  // =============================================
  // BUILD RESULT
  // =============================================
  
  return {
    // LP Status
    lpRemoved,
    lpBurned,
    lpLocked,
    
    // Liquidity Metrics
    liquidityDropPercent,
    liquidityHealth,
    
    // Rug Detection
    rugLikely,
    earlyRugWarning,
    lpMigrationDetected,
    
    // Authority Risks
    suspiciousAuthority,
    mintAuthorityDisabled,
    freezeAuthorityDisabled,
    
    // Advanced Detection
    honeypotRisk,
    whaleExitSpike,
    recentOutflow,
    
    // Summary Flags
    flags,
  };
}

// =============================================
// DATA EXTRACTION HELPERS
// =============================================

function extractLiquidity(token: RawTokenData): number {
  return token.liquidity 
    || token.liquidityUsd 
    || token.liquidity_usd 
    || token.poolLiquidity 
    || token.pool_liquidity 
    || 0;
}

function extractPreviousLiquidity(token: RawTokenData): number {
  return token.previousLiquidity 
    || token.previous_liquidity 
    || token.liquidityPrevious 
    || token.liquidity_previous 
    || extractLiquidity(token); // Fallback to current if no history
}

function extractLPOwner(token: RawTokenData): string | null {
  return token.lpTokenOwner 
    || token.lp_token_owner 
    || token.lpOwner 
    || token.lp_owner 
    || null;
}

function extractLockAddress(token: RawTokenData): string | null {
  return token.lockAddress 
    || token.lock_address 
    || token.lpLockAddress 
    || token.lp_lock_address 
    || null;
}

function extractMintAuthority(token: RawTokenData): string | null {
  return token.mintAuthority 
    || token.mint_authority 
    || token.authorities?.mint 
    || null;
}

function extractFreezeAuthority(token: RawTokenData): string | null {
  return token.freezeAuthority 
    || token.freeze_authority 
    || token.authorities?.freeze 
    || null;
}

function extractVolume24h(token: RawTokenData): number {
  return token.volume24h 
    || token.volume_24h 
    || token.volumeUsd24h 
    || token.volume_usd_24h 
    || 0;
}

function extractPriceChange24h(token: RawTokenData): number {
  return token.priceChange24h 
    || token.price_change_24h 
    || token.priceChange 
    || token.price_change 
    || 0;
}

function extractMarketCap(token: RawTokenData): number {
  return token.marketCap 
    || token.market_cap 
    || token.marketCapUsd 
    || token.market_cap_usd 
    || 0;
}

// =============================================
// LP STATUS CHECKS
// =============================================

function checkLPRemoved(currentLiquidity: number, previousLiquidity: number): boolean {
  // LP is considered removed if:
  // 1. Current liquidity is zero
  // 2. Liquidity dropped by more than 90% from previous
  
  if (currentLiquidity === 0) return true;
  if (previousLiquidity === 0) return false;
  
  const dropPercent = ((previousLiquidity - currentLiquidity) / previousLiquidity) * 100;
  return dropPercent >= 90;
}

function checkLPBurned(lpTokenOwner: string | null): boolean {
  if (!lpTokenOwner) return false;
  
  return BURN_ADDRESSES.some(burnAddr => 
    lpTokenOwner.toLowerCase().includes(burnAddr.toLowerCase())
  );
}

function checkLPLocked(lockAddress: string | null): boolean {
  if (!lockAddress) return false;
  
  // Check if lock address matches known lock programs
  return LOCK_ADDRESSES.some(lockAddr => 
    lockAddress.toLowerCase().includes(lockAddr.toLowerCase())
  );
}

// =============================================
// LIQUIDITY METRICS
// =============================================

function calculateLiquidityDrop(current: number, previous: number): number {
  if (previous === 0) return 0;
  if (current === 0) return 100;
  
  const dropPercent = ((previous - current) / previous) * 100;
  return Math.max(0, dropPercent);
}

/**
 * Calculate liquidity health score (0-100)
 * 
 * Factors:
 * - Absolute liquidity amount (40 points)
 * - Volume/liquidity ratio (20 points)
 * - LP burned/locked status (30 points)
 * - Liquidity stability (10 points)
 */
function calculateLiquidityHealth(
  liquidity: number,
  volume24h: number,
  lpBurned: boolean,
  lpLocked: boolean,
  liquidityDrop: number
): number {
  let health = 0;
  
  // 1. Absolute liquidity amount (0-40 points)
  if (liquidity >= LIQUIDITY_EXCELLENT) {
    health += 40;
  } else if (liquidity >= LIQUIDITY_HEALTHY) {
    health += 30;
  } else if (liquidity >= LIQUIDITY_LOW) {
    health += 20;
  } else if (liquidity >= LIQUIDITY_CRITICAL) {
    health += 10;
  } else {
    health += 0; // Critical
  }
  
  // 2. Volume/liquidity ratio (0-20 points)
  // Healthy ratio: 0.5-2.0 (volume should be similar to liquidity)
  if (liquidity > 0) {
    const ratio = volume24h / liquidity;
    if (ratio >= 0.5 && ratio <= 2.0) {
      health += 20; // Healthy trading activity
    } else if (ratio >= 0.2 && ratio <= 5.0) {
      health += 15; // Moderate activity
    } else if (ratio > 0) {
      health += 10; // Some activity
    }
  }
  
  // 3. LP burned/locked status (0-30 points)
  if (lpBurned) {
    health += 30; // Best case - LP permanently locked
  } else if (lpLocked) {
    health += 20; // Good - LP temporarily locked
  } else {
    health += 5; // Risky - LP can be removed
  }
  
  // 4. Liquidity stability (0-10 points)
  if (liquidityDrop === 0) {
    health += 10; // Stable
  } else if (liquidityDrop < 10) {
    health += 8; // Minor fluctuation
  } else if (liquidityDrop < 20) {
    health += 5; // Moderate decline
  } else {
    health += 0; // Significant decline
  }
  
  return Math.min(100, health);
}

// =============================================
// RUG DETECTION
// =============================================

function checkRugLikely(
  lpRemoved: boolean,
  liquidityDrop: number,
  currentLiquidity: number,
  liquidityHealth: number
): boolean {
  // Rug is likely if any of these conditions are met:
  
  // 1. LP was removed
  if (lpRemoved) return true;
  
  // 2. Liquidity dropped by 95% or more
  if (liquidityDrop >= LIQUIDITY_DROP_CRITICAL) return true;
  
  // 3. Liquidity is near zero
  if (currentLiquidity < LIQUIDITY_CRITICAL) return true;
  
  // 4. Liquidity health is critically low (<20)
  if (liquidityHealth < 20) return true;
  
  return false;
}

function checkEarlyRugWarning(
  liquidityDrop: number,
  lpRemoved: boolean,
  rugLikely: boolean
): boolean {
  // Don't warn if already confirmed rug
  if (lpRemoved || rugLikely) return false;
  
  // Warn if liquidity dropped 40-90% (potential rug in progress)
  return liquidityDrop >= LIQUIDITY_DROP_WARNING && liquidityDrop < LIQUIDITY_DROP_CRITICAL;
}

function checkLPMigration(
  liquidityDrop: number,
  volume24h: number,
  priceChange24h: number
): boolean {
  // LP migration pattern:
  // - Significant liquidity drop (50-80%)
  // - BUT high volume and stable/positive price
  
  if (liquidityDrop < 50 || liquidityDrop > 80) return false;
  if (volume24h < 10000) return false; // Low volume = not migration
  if (priceChange24h < -10) return false; // Price dump = not migration
  
  return true;
}

// =============================================
// AUTHORITY RISK CHECKS
// =============================================

function checkSuspiciousAuthority(
  mintAuthority: string | null,
  freezeAuthority: string | null,
  liquidity: number,
  marketCap: number
): boolean {
  // Authority is suspicious if:
  // 1. Mint or freeze authority is still active
  // 2. AND token has significant liquidity/market cap (potential rug)
  
  const hasAuthority = mintAuthority || freezeAuthority;
  const hasValue = liquidity > LIQUIDITY_HEALTHY || marketCap > 50000;
  
  return !!(hasAuthority && hasValue);
}

// =============================================
// ADVANCED DETECTION (PLACEHOLDERS)
// =============================================

/**
 * Check for honeypot risk (placeholder)
 * 
 * Would require:
 * - Contract analysis for sell restrictions
 * - Transaction simulation
 * - Buy/sell tax analysis
 */
function checkHoneypotRisk(_token: RawTokenData): boolean {
  // TODO: Implement honeypot detection
  // For now, return false (not implemented)
  return false;
}

/**
 * Check for whale exit spike (placeholder)
 * 
 * Would require:
 * - Transaction history analysis
 * - Large holder wallet tracking
 * - Sudden sell pattern detection
 */
function checkWhaleExitSpike(_token: RawTokenData): boolean {
  // TODO: Implement whale exit detection
  // For now, return false (not implemented)
  return false;
}

/**
 * Calculate recent outflow from volume and price change
 * 
 * Estimates sell pressure from 24h volume and price decline
 */
function calculateRecentOutflow(volume24h: number, priceChange24h: number): number {
  // If price is declining, estimate outflow as portion of volume
  if (priceChange24h >= 0) return 0;
  
  // Rough estimate: more negative price change = higher sell ratio
  // -10% price = ~60% sells, -20% price = ~70% sells, etc.
  const sellRatio = 0.5 + (Math.abs(priceChange24h) / 100);
  const estimatedOutflow = volume24h * Math.min(sellRatio, 0.9);
  
  return estimatedOutflow;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Get human-readable description of liquidity health
 */
export function getLiquidityHealthDescription(health: number): string {
  if (health >= 90) return 'Excellent - Deep liquidity, LP secured';
  if (health >= 70) return 'Good - Healthy liquidity, low risk';
  if (health >= 50) return 'Fair - Adequate liquidity, moderate risk';
  if (health >= 30) return 'Poor - Low liquidity, high risk';
  return 'Critical - Insufficient liquidity, extreme risk';
}

/**
 * Get color class for liquidity health
 */
export function getLiquidityHealthColor(health: number): string {
  if (health >= 70) return 'text-green-400';
  if (health >= 50) return 'text-yellow-400';
  if (health >= 30) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get emoji for liquidity status
 */
export function getLiquidityStatusEmoji(info: LiquidityInfo): string {
  if (info.rugLikely) return '💀';
  if (info.earlyRugWarning) return '⚠️';
  if (info.lpBurned) return '🔥';
  if (info.lpLocked) return '🔒';
  if (info.liquidityHealth >= 70) return '✅';
  return '⚡';
}
