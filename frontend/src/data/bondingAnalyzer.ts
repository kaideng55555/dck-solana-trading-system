/**
 * Bonding Curve Analyzer
 * Advanced metrics for token bonding curve analysis and graduation prediction
 */

import type { RawTokenData } from './tokenTypes';

/**
 * Bonding curve lifecycle stage
 */
export type CurveStage = 'new' | 'ramping' | 'peak' | 'graduated';

/**
 * Bonding curve trend direction
 */
export type CurveTrend = 'up' | 'down' | 'flat';

/**
 * Bonding curve health flags
 */
export interface BondingFlags {
  lowLiquidity: boolean;           // Liquidity below healthy threshold
  abnormalBuyPressure: boolean;    // Unusual buy volume
  abnormalSellPressure: boolean;   // Unusual sell volume
  curveFlattening: boolean;        // Growth rate declining
  migrationLikely: boolean;        // Will likely graduate soon
  rugRisk: boolean;                // Indicators of potential rug
  healthyCurve: boolean;           // All metrics look good
}

/**
 * Complete bonding curve analysis result
 */
export interface BondingInfo {
  bondingProgress: number;              // 0-100 (percentage to graduation)
  curveStage: CurveStage;               // Current lifecycle stage
  isCloseToMigration: boolean;          // Within 15% of graduation
  liquidityScore: number;               // 0-100 (liquidity health)
  curveHealth: number;                  // 0-100 (overall curve health)
  curveTrend: CurveTrend;               // Current trend direction
  estimatedGraduationTime: number;      // Minutes until graduation (0 if already graduated)
  flags: BondingFlags;                  // Risk/health indicators
  
  // Additional metrics
  velocityScore: number;                // Growth velocity (0-100)
  stabilityScore: number;               // Price stability (0-100)
  buyPressureRatio: number;             // Buy vs sell ratio (0-200, 100 = balanced)
}

/**
 * Bonding curve stage thresholds
 */
const STAGE_THRESHOLDS = {
  NEW: 0,          // 0-30%
  RAMPING: 30,     // 30-70%
  PEAK: 70,        // 70-95%
  GRADUATED: 95,   // 95-100%
};

/**
 * Liquidity health thresholds
 */
const LIQUIDITY_THRESHOLDS = {
  CRITICAL: 100,     // Below this = critical
  LOW: 500,          // Below this = low
  HEALTHY: 1000,     // Above this = healthy
  EXCELLENT: 5000,   // Above this = excellent
};

/**
 * Volume ratio thresholds for pressure detection
 */
const VOLUME_RATIOS = {
  ABNORMAL_BUY: 2.5,   // Buy volume > 2.5x average
  ABNORMAL_SELL: 2.5,  // Sell volume > 2.5x average
  BALANCED: 0.7,       // Ratio between 0.7-1.3 = balanced
};

/**
 * Calculate bonding progress from multiple signals
 */
function calculateBondingProgress(raw: RawTokenData): number {
  // Priority 1: Explicit bonding progress field
  if (raw.bondingProgress !== undefined) {
    return Math.min(100, Math.max(0, raw.bondingProgress));
  }
  
  if (raw.bonding_curve_percentage !== undefined) {
    return Math.min(100, Math.max(0, raw.bonding_curve_percentage));
  }
  
  // Priority 2: Check if already graduated/migrated
  if (raw.migrated || raw.graduated) {
    return 100;
  }
  
  // Priority 3: Estimate from market metrics
  const liquidity = raw.liquidity || raw.liquidityUsd || 0;
  const marketCap = raw.marketCap || raw.market_cap || 0;
  const volume24h = raw.volume24h || raw.volume_24h || 0;
  
  // Heuristic: Higher liquidity + market cap suggests more progress
  // Typical graduation ranges: $50k-$100k liquidity, $500k+ market cap
  let estimatedProgress = 0;
  
  // Liquidity contribution (0-40 points)
  if (liquidity > 0) {
    estimatedProgress += Math.min(40, (liquidity / 100000) * 40);
  }
  
  // Market cap contribution (0-40 points)
  if (marketCap > 0) {
    estimatedProgress += Math.min(40, (marketCap / 500000) * 40);
  }
  
  // Volume contribution (0-20 points)
  if (volume24h > 0) {
    estimatedProgress += Math.min(20, (volume24h / 50000) * 20);
  }
  
  return Math.min(100, Math.max(0, estimatedProgress));
}

/**
 * Determine curve stage from bonding progress
 */
function determineCurveStage(progress: number, isMigrated: boolean): CurveStage {
  if (isMigrated || progress >= STAGE_THRESHOLDS.GRADUATED) {
    return 'graduated';
  }
  if (progress >= STAGE_THRESHOLDS.PEAK) {
    return 'peak';
  }
  if (progress >= STAGE_THRESHOLDS.RAMPING) {
    return 'ramping';
  }
  return 'new';
}

/**
 * Calculate liquidity health score
 */
function calculateLiquidityScore(liquidity: number, volume24h: number): number {
  let score = 0;
  
  // Base score from liquidity amount (0-60 points)
  if (liquidity >= LIQUIDITY_THRESHOLDS.EXCELLENT) {
    score += 60;
  } else if (liquidity >= LIQUIDITY_THRESHOLDS.HEALTHY) {
    score += 45;
  } else if (liquidity >= LIQUIDITY_THRESHOLDS.LOW) {
    score += 25;
  } else if (liquidity >= LIQUIDITY_THRESHOLDS.CRITICAL) {
    score += 10;
  }
  
  // Volume-to-liquidity ratio (0-40 points)
  // Healthy ratio: volume should be 5-20% of liquidity
  if (liquidity > 0) {
    const volumeRatio = volume24h / liquidity;
    if (volumeRatio >= 0.05 && volumeRatio <= 0.3) {
      score += 40; // Ideal range
    } else if (volumeRatio >= 0.01 && volumeRatio <= 0.5) {
      score += 25; // Acceptable range
    } else if (volumeRatio < 0.5) {
      score += 10; // Too low or too high volume
    }
  }
  
  return Math.min(100, score);
}

/**
 * Calculate curve health score (overall health)
 */
function calculateCurveHealth(
  liquidityScore: number,
  bondingProgress: number,
  lpBurned: boolean,
  mintDisabled: boolean,
  freezeDisabled: boolean,
  ageMinutes: number
): number {
  let health = 0;
  
  // Liquidity health (0-30 points)
  health += (liquidityScore / 100) * 30;
  
  // Progress health (0-20 points)
  // Sweet spot: 20-80% progress
  if (bondingProgress >= 20 && bondingProgress <= 80) {
    health += 20;
  } else if (bondingProgress >= 10 && bondingProgress <= 90) {
    health += 15;
  } else {
    health += 10;
  }
  
  // Security health (0-30 points)
  if (lpBurned) health += 10;
  if (mintDisabled) health += 10;
  if (freezeDisabled) health += 10;
  
  // Age health (0-20 points)
  // Prefer tokens that have survived at least 30 minutes
  if (ageMinutes >= 180) {
    health += 20; // 3+ hours = mature
  } else if (ageMinutes >= 60) {
    health += 15; // 1+ hour = established
  } else if (ageMinutes >= 30) {
    health += 10; // 30+ minutes = survived initial volatility
  } else {
    health += 5; // Very new = higher risk
  }
  
  return Math.min(100, health);
}

/**
 * Determine curve trend from volume and progress
 */
function determineCurveTrend(
  volume24h: number,
  priceChange24h: number | undefined,
  bondingProgress: number
): CurveTrend {
  // If graduated, trend is flat (no more curve)
  if (bondingProgress >= 100) {
    return 'flat';
  }
  
  // Use price change as primary indicator
  if (priceChange24h !== undefined) {
    if (priceChange24h > 10) return 'up';      // +10% or more
    if (priceChange24h < -10) return 'down';   // -10% or more
    return 'flat';
  }
  
  // Fallback: use volume as proxy
  // High volume in early stages suggests upward trend
  if (bondingProgress < 50 && volume24h > 10000) {
    return 'up';
  }
  
  // Low volume in peak stage suggests flattening
  if (bondingProgress > 70 && volume24h < 5000) {
    return 'flat';
  }
  
  return 'flat';
}

/**
 * Calculate buy/sell pressure ratio
 */
function calculateBuyPressureRatio(
  volume24h: number,
  priceChange24h: number | undefined
): number {
  // Ratio: 100 = balanced, <100 = sell pressure, >100 = buy pressure
  
  if (priceChange24h === undefined || volume24h === 0) {
    return 100; // Unknown, assume balanced
  }
  
  // Heuristic: price change suggests buy/sell imbalance
  // +50% price = ~150 buy ratio
  // -50% price = ~50 buy ratio
  const ratio = 100 + (priceChange24h * 0.5);
  
  return Math.min(200, Math.max(0, ratio));
}

/**
 * Estimate time to graduation (in minutes)
 */
function estimateGraduationTime(
  bondingProgress: number,
  volume24h: number,
  curveTrend: CurveTrend,
  isMigrated: boolean
): number {
  if (isMigrated || bondingProgress >= 100) {
    return 0; // Already graduated
  }
  
  const remainingProgress = 100 - bondingProgress;
  
  // Velocity estimation based on volume and trend
  let velocityPerHour = 0;
  
  if (curveTrend === 'up') {
    // High volume = faster graduation
    if (volume24h > 50000) {
      velocityPerHour = 20; // 20% per hour
    } else if (volume24h > 10000) {
      velocityPerHour = 10; // 10% per hour
    } else {
      velocityPerHour = 5; // 5% per hour
    }
  } else if (curveTrend === 'flat') {
    velocityPerHour = 2; // Slow growth
  } else {
    velocityPerHour = 1; // Very slow or declining
  }
  
  if (velocityPerHour === 0) {
    return 999999; // Effectively never
  }
  
  const hoursToGraduation = remainingProgress / velocityPerHour;
  const minutesToGraduation = hoursToGraduation * 60;
  
  return Math.max(0, Math.round(minutesToGraduation));
}

/**
 * Calculate velocity score (growth rate)
 */
function calculateVelocityScore(
  bondingProgress: number,
  ageMinutes: number,
  volume24h: number
): number {
  if (ageMinutes === 0) return 0;
  
  // Progress per minute
  const progressPerMinute = bondingProgress / ageMinutes;
  
  // Normalize to 0-100 scale
  // Fast: 1% per minute = 100 score
  // Moderate: 0.1% per minute = 10 score
  let velocityScore = progressPerMinute * 100;
  
  // Boost for high volume
  if (volume24h > 50000) {
    velocityScore *= 1.5;
  } else if (volume24h > 10000) {
    velocityScore *= 1.2;
  }
  
  return Math.min(100, velocityScore);
}

/**
 * Calculate price stability score
 */
function calculateStabilityScore(
  priceChange24h: number | undefined,
  volume24h: number,
  liquidity: number
): number {
  // High stability = low volatility relative to volume
  
  if (priceChange24h === undefined) {
    return 50; // Unknown, assume moderate
  }
  
  const absChange = Math.abs(priceChange24h);
  
  // Base stability from price change
  let stability = 100 - Math.min(100, absChange);
  
  // Adjust for volume/liquidity ratio
  if (liquidity > 0) {
    const volumeRatio = volume24h / liquidity;
    
    // High volume with low price change = very stable
    if (volumeRatio > 0.1 && absChange < 10) {
      stability = Math.min(100, stability * 1.2);
    }
    
    // Low volume with high price change = unstable
    if (volumeRatio < 0.05 && absChange > 20) {
      stability = Math.max(0, stability * 0.8);
    }
  }
  
  return Math.min(100, Math.max(0, stability));
}

/**
 * Generate bonding curve flags
 */
function generateBondingFlags(
  liquidity: number,
  liquidityScore: number,
  buyPressureRatio: number,
  curveTrend: CurveTrend,
  bondingProgress: number,
  lpBurned: boolean,
  curveHealth: number
): BondingFlags {
  return {
    lowLiquidity: liquidity < LIQUIDITY_THRESHOLDS.LOW,
    
    abnormalBuyPressure: buyPressureRatio > (100 + (100 * VOLUME_RATIOS.ABNORMAL_BUY)),
    
    abnormalSellPressure: buyPressureRatio < (100 - (100 * VOLUME_RATIOS.ABNORMAL_SELL)),
    
    curveFlattening: curveTrend === 'flat' && bondingProgress > 30 && bondingProgress < 90,
    
    migrationLikely: bondingProgress > 85 || (lpBurned && bondingProgress > 70),
    
    rugRisk: !lpBurned && liquidityScore < 30 && curveHealth < 40,
    
    healthyCurve: curveHealth >= 70 && liquidityScore >= 60 && lpBurned,
  };
}

/**
 * Main bonding curve analysis function
 * Analyzes a raw token and returns comprehensive bonding metrics
 */
export function analyzeBondingCurve(rawToken: RawTokenData): BondingInfo {
  // Extract base metrics
  const liquidity = rawToken.liquidity || rawToken.liquidityUsd || 0;
  const volume24h = rawToken.volume24h || rawToken.volume_24h || 0;
  const priceChange24h = rawToken.priceChange24h;
  const lpBurned = rawToken.lpBurned || rawToken.lp_burned || false;
  const mintDisabled = rawToken.mintAuthority === null || rawToken.mintAuthority === '';
  const freezeDisabled = rawToken.freezeAuthority === null || rawToken.freezeAuthority === '';
  const isMigrated = rawToken.migrated || rawToken.graduated || false;
  
  // Calculate age
  const now = Date.now();
  let createdAt = now;
  if (rawToken.createdAt) {
    createdAt = rawToken.createdAt > 1e12 ? rawToken.createdAt : rawToken.createdAt * 1000;
  } else if (rawToken.created_at) {
    createdAt = rawToken.created_at > 1e12 ? rawToken.created_at : rawToken.created_at * 1000;
  } else if (rawToken.age) {
    createdAt = now - (rawToken.age * 1000);
  }
  const ageMinutes = Math.floor((now - createdAt) / 60000);
  
  // Core calculations
  const bondingProgress = calculateBondingProgress(rawToken);
  const curveStage = determineCurveStage(bondingProgress, isMigrated);
  const isCloseToMigration = bondingProgress > 85 || (lpBurned && bondingProgress > 75);
  const liquidityScore = calculateLiquidityScore(liquidity, volume24h);
  const curveTrend = determineCurveTrend(volume24h, priceChange24h, bondingProgress);
  const curveHealth = calculateCurveHealth(
    liquidityScore,
    bondingProgress,
    lpBurned,
    mintDisabled,
    freezeDisabled,
    ageMinutes
  );
  const estimatedGraduationTime = estimateGraduationTime(
    bondingProgress,
    volume24h,
    curveTrend,
    isMigrated
  );
  const buyPressureRatio = calculateBuyPressureRatio(volume24h, priceChange24h);
  const velocityScore = calculateVelocityScore(bondingProgress, ageMinutes, volume24h);
  const stabilityScore = calculateStabilityScore(priceChange24h, volume24h, liquidity);
  const flags = generateBondingFlags(
    liquidity,
    liquidityScore,
    buyPressureRatio,
    curveTrend,
    bondingProgress,
    lpBurned,
    curveHealth
  );
  
  return {
    bondingProgress,
    curveStage,
    isCloseToMigration,
    liquidityScore,
    curveHealth,
    curveTrend,
    estimatedGraduationTime,
    flags,
    velocityScore,
    stabilityScore,
    buyPressureRatio,
  };
}

/**
 * Utility: Get human-readable curve stage description
 */
export function getCurveStageDescription(stage: CurveStage): string {
  switch (stage) {
    case 'new':
      return 'New Launch (0-30%)';
    case 'ramping':
      return 'Ramping Up (30-70%)';
    case 'peak':
      return 'Near Graduation (70-95%)';
    case 'graduated':
      return 'Graduated (100%)';
  }
}

/**
 * Utility: Get curve stage emoji
 */
export function getCurveStageEmoji(stage: CurveStage): string {
  switch (stage) {
    case 'new':
      return '🌱';
    case 'ramping':
      return '📈';
    case 'peak':
      return '🔥';
    case 'graduated':
      return '🎓';
  }
}

/**
 * Utility: Get trend emoji
 */
export function getCurveTrendEmoji(trend: CurveTrend): string {
  switch (trend) {
    case 'up':
      return '↗️';
    case 'down':
      return '↘️';
    case 'flat':
      return '→';
  }
}
