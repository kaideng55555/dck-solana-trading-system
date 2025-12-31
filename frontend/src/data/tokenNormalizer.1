/**
 * Token Data Normalizer
 * Converts raw API data into unified Token objects
 */

import type { Token, RawTokenData, TokenSocials } from './tokenTypes';
import { analyzeBondingCurve } from './bondingAnalyzer';
import { analyzeLiquidity } from './liquidityAnalyzer';
import { analyzeAuthorities } from './authorityAnalyzer';

/**
 * Calculate risk score based on security factors
 * 0 = safest, 100 = highest risk
 */
function calculateRiskScore(
  lpBurned: boolean,
  mintDisabled: boolean,
  freezeDisabled: boolean,
  ageMinutes: number,
  liquidity: number
): number {
  let risk = 0;
  
  // Authority risks (40 points total)
  if (!mintDisabled) risk += 20; // Can mint more tokens
  if (!freezeDisabled) risk += 20; // Can freeze accounts
  
  // LP risk (30 points)
  if (!lpBurned) risk += 30;
  
  // Age risk (20 points) - newer = riskier
  if (ageMinutes < 5) risk += 20;
  else if (ageMinutes < 30) risk += 15;
  else if (ageMinutes < 60) risk += 10;
  else if (ageMinutes < 180) risk += 5;
  
  // Liquidity risk (10 points)
  if (liquidity < 500) risk += 10;
  else if (liquidity < 1000) risk += 5;
  
  return Math.min(risk, 100);
}

/**
 * Determine if token is "alive" based on activity/liquidity
 */
function isTokenAlive(
  liquidity: number,
  volume24h: number,
  marketCap: number
): boolean {
  // Token is dead if:
  // - No liquidity
  // - Market cap is 0 or negative
  // - Both volume and liquidity are extremely low
  if (marketCap <= 0) return false;
  if (liquidity <= 0) return false;
  if (liquidity < 100 && volume24h < 100) return false;
  
  return true;
}

/**
 * Normalize social links from various formats
 */
function normalizeSocials(raw: RawTokenData): TokenSocials {
  const socials: TokenSocials = {};
  
  // Direct fields
  if (raw.twitter) socials.twitter = raw.twitter;
  if (raw.telegram) socials.telegram = raw.telegram;
  if (raw.website) socials.website = raw.website;
  
  // Nested socials object
  if (raw.socials) {
    if (raw.socials.twitter) socials.twitter = raw.socials.twitter;
    if (raw.socials.telegram) socials.telegram = raw.socials.telegram;
    if (raw.socials.website) socials.website = raw.socials.website;
    if (raw.socials.discord) socials.discord = raw.socials.discord;
  }
  
  return socials;
}

/**
 * Extract creation timestamp from various formats
 */
function extractCreatedAt(raw: RawTokenData): number {
  const now = Date.now();
  
  // Try various timestamp fields
  if (raw.createdAt) {
    return raw.createdAt > 1e12 ? raw.createdAt : raw.createdAt * 1000;
  }
  if (raw.created_at) {
    return raw.created_at > 1e12 ? raw.created_at : raw.created_at * 1000;
  }
  if (raw.createdTimestamp) {
    return raw.createdTimestamp > 1e12 ? raw.createdTimestamp : raw.createdTimestamp * 1000;
  }
  if (raw.launchTimestamp) {
    return raw.launchTimestamp > 1e12 ? raw.launchTimestamp : raw.launchTimestamp * 1000;
  }
  
  // Fallback: use age if available
  if (raw.age) {
    return now - (raw.age * 1000); // age is in seconds
  }
  
  // Default: current time (indicates unknown age)
  return now;
}

/**
 * Normalize a single raw token into unified Token object
 */
export function normalizeToken(raw: RawTokenData): Token {
  const now = Date.now();
  
  // Extract mint address (primary key)
  const mint = raw.mint || raw.address || '';
  
  if (!mint) {
    throw new Error('Token normalization failed: missing mint address');
  }
  
  // Normalize price
  const price = raw.price || raw.priceUsd || 0;
  
  // Normalize market cap
  const marketCap = raw.marketCap || raw.market_cap || 0;
  
  // Normalize liquidity
  const liquidity = raw.liquidity || raw.liquidityUsd || 0;
  
  // Normalize volume
  const volume24h = raw.volume24h || raw.volume_24h || 0;
  
  // Normalize bonding progress
  const bondingProgress = raw.bondingProgress ?? raw.bonding_curve_percentage ?? 0;
  
  // Check migration status
  const isMigrated = raw.migrated || raw.graduated || bondingProgress >= 100 || false;
  
  // Extract authorities
  const mintAuthority = raw.mintAuthority ?? null;
  const freezeAuthority = raw.freezeAuthority ?? null;
  const updateAuthority = raw.updateAuthority ?? null;
  
  // Compute security flags
  const mintAuthorityDisabled = mintAuthority === null || mintAuthority === '';
  const freezeAuthorityDisabled = freezeAuthority === null || freezeAuthority === '';
  const lpBurned = raw.lpBurned || raw.lp_burned || false;
  
  // Extract creation time
  const createdAt = extractCreatedAt(raw);
  
  // Calculate age in minutes
  const ageMinutes = Math.floor((now - createdAt) / 60000);
  
  // Determine if alive
  const isAlive = raw.alive ?? isTokenAlive(liquidity, volume24h, marketCap);
  
  // Calculate risk score
  const riskScore = calculateRiskScore(
    lpBurned,
    mintAuthorityDisabled,
    freezeAuthorityDisabled,
    ageMinutes,
    liquidity
  );
  
  // Extract socials
  const socials = normalizeSocials(raw);
  
  // ✨ Analyze bonding curve with advanced metrics
  const bondingAnalysis = analyzeBondingCurve(raw);
  
  // ✨ Analyze liquidity for rug detection and LP health
  const liquidityAnalysis = analyzeLiquidity(raw);
  
  // ✨ Analyze authorities for fake renounces and risks
  const authorityAnalysis = analyzeAuthorities(raw);
  
  // Build unified Token object
  const token: Token = {
    mint,
    
    metadata: {
      name: raw.name || 'Unknown',
      symbol: raw.symbol || 'UNK',
      description: raw.description,
      image: raw.image || raw.logo,
      decimals: raw.decimals ?? 9,
    },
    
    market: {
      price,
      marketCap,
      liquidity,
      volume24h,
      priceChange24h: raw.priceChange24h,
      holders: raw.holders || raw.holdersCount,
    },
    
    bonding: {
      bondingProgress: bondingAnalysis.bondingProgress,
      currentReserves: raw.currentReserves,
      targetReserves: raw.targetReserves,
      isMigrated,
      
      // Enhanced bonding metrics
      curveStage: bondingAnalysis.curveStage,
      isCloseToMigration: bondingAnalysis.isCloseToMigration,
      liquidityScore: bondingAnalysis.liquidityScore,
      curveHealth: bondingAnalysis.curveHealth,
      curveTrend: bondingAnalysis.curveTrend,
      estimatedGraduationTime: bondingAnalysis.estimatedGraduationTime,
      velocityScore: bondingAnalysis.velocityScore,
      stabilityScore: bondingAnalysis.stabilityScore,
      buyPressureRatio: bondingAnalysis.buyPressureRatio,
      flags: bondingAnalysis.flags,
    },
    
    authorities: {
      mintAuthority,
      freezeAuthority,
      updateAuthority,
    },
    
    lpBurned,
    mintAuthorityDisabled,
    freezeAuthorityDisabled,
    
    // Liquidity analysis results
    liquidityHealth: liquidityAnalysis.liquidityHealth,
    lpRemoved: liquidityAnalysis.lpRemoved,
    lpLocked: liquidityAnalysis.lpLocked,
    rugLikely: liquidityAnalysis.rugLikely,
    earlyRugWarning: liquidityAnalysis.earlyRugWarning,
    suspiciousAuthority: liquidityAnalysis.suspiciousAuthority,
    honeypotRisk: liquidityAnalysis.honeypotRisk,
    whaleExitSpike: liquidityAnalysis.whaleExitSpike,
    recentOutflow: liquidityAnalysis.recentOutflow,
    liquidityDropPercent: liquidityAnalysis.liquidityDropPercent,
    lpMigrationDetected: liquidityAnalysis.lpMigrationDetected,
    liquidityFlags: liquidityAnalysis.flags,
    
    // Authority analysis results
    fakeRenounceDetected: authorityAnalysis.fakeRenounceDetected,
    authorityRiskScore: authorityAnalysis.authorityRiskScore,
    isFullyRenounced: authorityAnalysis.isFullyRenounced,
    isMigratedEligible: authorityAnalysis.isMigratedEligible,
    authorityFlags: authorityAnalysis.authorityFlags,
    
    socials,
    
    createdAt,
    lastUpdated: now,
    ageMinutes,
    isAlive,
    riskScore,
  };
  
  return token;
}

/**
 * Normalize an array of raw tokens
 */
export function normalizeTokens(rawTokens: RawTokenData[]): Token[] {
  const normalized: Token[] = [];
  
  for (const raw of rawTokens) {
    try {
      const token = normalizeToken(raw);
      normalized.push(token);
    } catch (error) {
      console.warn('Failed to normalize token:', raw, error);
      // Skip invalid tokens
    }
  }
  
  return normalized;
}

/**
 * Update existing token with partial data
 * Preserves existing fields and only updates provided ones
 */
export function updateNormalizedToken(
  existing: Token,
  updates: Partial<RawTokenData>
): Token {
  const now = Date.now();
  
  // Create a merged raw object
  const merged: RawTokenData = {
    mint: existing.mint,
    name: existing.metadata.name,
    symbol: existing.metadata.symbol,
    decimals: existing.metadata.decimals,
    price: existing.market.price,
    marketCap: existing.market.marketCap,
    liquidity: existing.market.liquidity,
    volume24h: existing.market.volume24h,
    bondingProgress: existing.bonding.bondingProgress,
    migrated: existing.bonding.isMigrated,
    mintAuthority: existing.authorities.mintAuthority,
    freezeAuthority: existing.authorities.freezeAuthority,
    lpBurned: existing.lpBurned,
    createdAt: existing.createdAt,
    ...updates,
  };
  
  // Re-normalize with updated data
  const updated = normalizeToken(merged);
  
  // Preserve original creation time if not explicitly updated
  if (!updates.createdAt && !updates.created_at) {
    updated.createdAt = existing.createdAt;
    updated.ageMinutes = Math.floor((now - existing.createdAt) / 60000);
  }
  
  return updated;
}
