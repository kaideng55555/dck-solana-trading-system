/**
 * FeedNormalizer - Live Feed to Unified Token Converter
 * 
 * Converts raw TokenLiveEntry updates from LiveFeedEngine into fully enriched,
 * unified NormalizedToken (Token) objects ready for UI consumption.
 * 
 * Features:
 * - Field cleaning and standardization
 * - Bonding curve prediction and stage classification
 * - Liquidity and authority risk analysis
 * - Price momentum and acceleration tracking
 * - Sniper signal generation (fresh, curve edge, volume spike)
 * - Trend detection (trending up/down)
 * - Price history management (last 20 data points)
 * 
 * NO UI, NO REACT, NO ZUSTAND - Pure data transformation.
 */

import type { TokenLiveEntry } from '../live/LiveFeedEngine';
import type { Token, TokenSocials, TokenAuthorities, TokenMarketData, TokenBondingData, TokenMetadata } from '../data/tokenTypes';
import { analyzeBondingCurve } from '../data/bondingAnalyzer';
import { analyzeLiquidity } from '../data/liquidityAnalyzer';
import { analyzeAuthorities } from '../data/authorityAnalyzer';

// ============================================================
// TYPES
// ============================================================

/**
 * Bonding curve stage classification
 */
type BondingStage = 'new' | 'mid' | 'late' | 'graduated';

/**
 * Sniper signal flags
 */
interface SniperSignals {
  snipeFresh: boolean;        // Token < 90 seconds old
  snipeCurveEdge: boolean;    // Bonding >= 96% & velocity > 1.0
  snipeVolumeSpike: boolean;  // Volume > 2x previous
}

/**
 * Trend signal flags
 */
interface TrendSignals {
  trendingUp: boolean;    // Last 3 prices increasing
  trendingDown: boolean;  // Last 3 prices decreasing
}

/**
 * Price history entry
 */
interface PricePoint {
  price: number;
  timestamp: number;
  volume: number;
}

/**
 * Internal state per mint
 */
interface MintState {
  lastPrice: number;
  priceHistory: PricePoint[];
  lastNormalized: Token | null;
  lastVolume: number;
}

// ============================================================
// FEED NORMALIZER CLASS
// ============================================================

export class FeedNormalizer {
  // Internal state storage
  private state: Map<string, MintState> = new Map();
  private readonly maxHistoryLength = 20;

  constructor() {
    // Initialize empty state
  }

  // ============================================================
  // MAIN NORMALIZATION
  // ============================================================

  /**
   * Convert TokenLiveEntry to fully normalized Token object.
   */
  normalize(update: TokenLiveEntry): Token {
    const mint = update.mint;
    
    // Get or create mint state
    let mintState = this.state.get(mint);
    if (!mintState) {
      mintState = {
        lastPrice: 0,
        priceHistory: [],
        lastNormalized: null,
        lastVolume: 0,
      };
      this.state.set(mint, mintState);
    }

    // Calculate temporal data
    const now = Date.now();
    const createdAt = update.createdAt || now - (update.ageSeconds * 1000);
    const ageMinutes = Math.floor(update.ageSeconds / 60);

    // Add to price history
    mintState.priceHistory.push({
      price: update.price,
      timestamp: now,
      volume: update.volume24h,
    });

    // Trim history to max length
    if (mintState.priceHistory.length > this.maxHistoryLength) {
      mintState.priceHistory = mintState.priceHistory.slice(-this.maxHistoryLength);
    }

    // Calculate velocity (price momentum)
    const velocity = this.calculateVelocity(mintState.priceHistory);

    // Calculate acceleration
    const acceleration = this.calculateAcceleration(mintState.priceHistory);

    // Determine bonding stage
    const bondingStage = this.getBondingStage(update.bondingProgress);

    // Calculate bonding prediction
    const bondingPrediction = this.predictBondingTime(
      update.bondingProgress,
      velocity,
      update.volume24h
    );

    // Generate sniper signals
    const sniperSignals = this.generateSniperSignals(
      update.ageSeconds,
      update.bondingProgress,
      velocity,
      update.volume24h,
      mintState.lastVolume
    );

    // Generate trend signals
    const trendSignals = this.generateTrendSignals(mintState.priceHistory);

    // Build metadata
    const metadata: TokenMetadata = {
      name: update.symbol || 'Unknown',
      symbol: update.symbol || '???',
      description: undefined,
      image: undefined,
      decimals: 9, // Default for SPL tokens
    };

    // Build market data
    const market: TokenMarketData = {
      price: update.price,
      marketCap: update.marketCap,
      liquidity: update.liq,
      volume24h: update.volume24h,
      priceChange24h: this.calculatePriceChange24h(mintState.priceHistory),
      holders: undefined,
    };

    // Build bonding data with enhanced analysis
    const bondingData: TokenBondingData = {
      bondingProgress: update.bondingProgress,
      currentReserves: undefined,
      targetReserves: undefined,
      isMigrated: update.bondingProgress >= 100,
      
      // Enhanced bonding analysis
      curveStage: bondingStage as 'new' | 'ramping' | 'peak' | 'graduated',
      isCloseToMigration: update.bondingProgress >= 85,
      liquidityScore: this.calculateLiquidityScore(update.liq, update.volume24h),
      curveHealth: this.calculateCurveHealth(update.bondingProgress, velocity, update.liq),
      curveTrend: this.determineCurveTrend(mintState.priceHistory),
      estimatedGraduationTime: bondingPrediction,
      velocityScore: this.normalizeVelocityScore(velocity),
      stabilityScore: this.calculateStabilityScore(mintState.priceHistory),
      buyPressureRatio: 100, // Would need buy/sell data from DEX
      
      // Bonding curve flags
      flags: {
        lowLiquidity: update.liq < 1000,
        abnormalBuyPressure: false, // Would need transaction data
        abnormalSellPressure: false, // Would need transaction data
        curveFlattening: velocity < 0.1 && update.bondingProgress < 95,
        migrationLikely: update.bondingProgress >= 96,
        rugRisk: update.risks.authority === 'DANGER' || update.risks.liquidity === 'HIGH',
        healthyCurve: update.liq > 5000 && velocity > 0 && update.risks.authority === 'SAFE',
      },
    };

    // Build authorities
    const authorities: TokenAuthorities = {
      mintAuthority: null,
      freezeAuthority: null,
      updateAuthority: null,
    };

    // Build socials (empty for live feed)
    const socials: TokenSocials = {};

    // Calculate computed security flags
    const lpBurned = update.risks.liquidity === 'LOW';
    const mintAuthorityDisabled = update.risks.authority === 'SAFE';
    const freezeAuthorityDisabled = update.risks.authority === 'SAFE';

    // Liquidity analysis results
    const liquidityHealth = this.calculateLiquidityScore(update.liq, update.volume24h);
    const lpRemoved = update.risks.liquidity === 'HIGH' && update.liq < 100;
    const lpLocked = update.risks.liquidity === 'LOW' && update.liq > 1000;
    const rugLikely = update.risks.authority === 'DANGER' && update.risks.liquidity === 'HIGH';
    const earlyRugWarning = update.risks.authority === 'DANGER' || (update.risks.liquidity === 'MEDIUM' && velocity < -5);
    const suspiciousAuthority = update.risks.authority === 'DANGER';
    const honeypotRisk = update.risks.liquidity === 'HIGH' && update.volume24h < 100;
    const whaleExitSpike = velocity < -10 && update.volume24h > 10000;
    const recentOutflow = velocity < 0 ? Math.abs(velocity) * update.volume24h : 0;
    const liquidityDropPercent = this.calculateLiquidityDrop(mintState.priceHistory);
    const lpMigrationDetected = update.bondingProgress >= 95 && update.bondingProgress < 100;

    const liquidityFlags: string[] = [];
    if (lpRemoved) liquidityFlags.push('LP_REMOVED');
    if (rugLikely) liquidityFlags.push('RUG_LIKELY');
    if (earlyRugWarning) liquidityFlags.push('EARLY_RUG_WARNING');
    if (suspiciousAuthority) liquidityFlags.push('SUSPICIOUS_AUTHORITY');
    if (honeypotRisk) liquidityFlags.push('HONEYPOT_RISK');
    if (whaleExitSpike) liquidityFlags.push('WHALE_EXIT_SPIKE');
    if (lpMigrationDetected) liquidityFlags.push('LP_MIGRATION');

    // Authority analysis results
    const fakeRenounceDetected = false; // Would need transaction history
    const authorityRiskScore = this.mapRiskToScore(update.risks.authority);
    const isFullyRenounced = update.risks.authority === 'SAFE';
    const isMigratedEligible = isFullyRenounced && lpLocked;

    const authorityFlags: string[] = [];
    if (suspiciousAuthority) authorityFlags.push('AUTHORITY_ACTIVE');
    if (fakeRenounceDetected) authorityFlags.push('FAKE_RENOUNCE');
    if (!isFullyRenounced) authorityFlags.push('NOT_RENOUNCED');

    // Calculate overall risk score
    const riskScore = this.calculateRiskScore(
      lpBurned,
      mintAuthorityDisabled,
      freezeAuthorityDisabled,
      ageMinutes,
      update.liq,
      authorityRiskScore,
      liquidityHealth
    );

    // Determine if token is alive
    const isAlive = this.isTokenAlive(update.liq, update.volume24h, update.marketCap);

    // Build complete Token object
    const normalized: Token = {
      mint,
      metadata,
      market,
      bonding: bondingData,
      authorities,
      lpBurned,
      mintAuthorityDisabled,
      freezeAuthorityDisabled,
      liquidityHealth,
      lpRemoved,
      lpLocked,
      rugLikely,
      earlyRugWarning,
      suspiciousAuthority,
      honeypotRisk,
      whaleExitSpike,
      recentOutflow,
      liquidityDropPercent,
      lpMigrationDetected,
      liquidityFlags,
      fakeRenounceDetected,
      authorityRiskScore,
      isFullyRenounced,
      isMigratedEligible,
      authorityFlags,
      socials,
      createdAt,
      lastUpdated: now,
      ageMinutes,
      isAlive,
      riskScore,
    };

    // Update state
    mintState.lastPrice = update.price;
    mintState.lastNormalized = normalized;
    mintState.lastVolume = update.volume24h;

    return normalized;
  }

  // ============================================================
  // VELOCITY & ACCELERATION
  // ============================================================

  /**
   * Calculate price velocity (momentum) from price history.
   */
  private calculateVelocity(history: PricePoint[]): number {
    if (history.length < 2) return 0;

    const recent = history.slice(-5); // Last 5 points
    if (recent.length < 2) return 0;

    const first = recent[0];
    const last = recent[recent.length - 1];

    if (first.price === 0) return 0;

    const priceChange = last.price - first.price;
    const percentChange = (priceChange / first.price) * 100;
    const timeDelta = (last.timestamp - first.timestamp) / 1000; // seconds

    if (timeDelta === 0) return 0;

    // Velocity = percent change per second
    return percentChange / timeDelta;
  }

  /**
   * Calculate price acceleration (rate of velocity change).
   */
  private calculateAcceleration(history: PricePoint[]): number {
    if (history.length < 3) return 0;

    const recent = history.slice(-6); // Last 6 points
    if (recent.length < 3) return 0;

    // Calculate velocity for first half vs second half
    const mid = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, mid);
    const secondHalf = recent.slice(mid);

    const v1 = this.calculateVelocity(firstHalf);
    const v2 = this.calculateVelocity(secondHalf);

    // Acceleration = change in velocity
    return v2 - v1;
  }

  // ============================================================
  // BONDING ANALYSIS
  // ============================================================

  /**
   * Classify bonding stage based on progress percentage.
   */
  private getBondingStage(progress: number): BondingStage {
    if (progress >= 100) return 'graduated';
    if (progress >= 70) return 'late';
    if (progress >= 20) return 'mid';
    return 'new';
  }

  /**
   * Predict time to graduation (in minutes).
   */
  private predictBondingTime(
    progress: number,
    velocity: number,
    volume: number
  ): number {
    if (progress >= 100) return 0;

    const remaining = 100 - progress;

    // If velocity is 0 or negative, return large value
    if (velocity <= 0) return 999;

    // Simple linear prediction: remaining / velocity
    // But weight by volume (higher volume = faster progression)
    const volumeFactor = Math.min(volume / 10000, 2); // 0-2x multiplier
    const adjustedVelocity = velocity * (1 + volumeFactor);

    if (adjustedVelocity <= 0) return 999;

    const minutesToGraduation = (remaining / adjustedVelocity) / 60; // Convert to minutes

    return Math.max(0, Math.min(minutesToGraduation, 999));
  }

  /**
   * Calculate liquidity health score (0-100).
   */
  private calculateLiquidityScore(liquidity: number, volume: number): number {
    let score = 0;

    // Base score from liquidity (0-60 points)
    if (liquidity >= 10000) score += 60;
    else if (liquidity >= 5000) score += 50;
    else if (liquidity >= 1000) score += 40;
    else if (liquidity >= 500) score += 25;
    else if (liquidity >= 100) score += 10;

    // Volume contribution (0-40 points)
    if (volume >= 50000) score += 40;
    else if (volume >= 10000) score += 30;
    else if (volume >= 5000) score += 20;
    else if (volume >= 1000) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Calculate overall curve health (0-100).
   */
  private calculateCurveHealth(progress: number, velocity: number, liquidity: number): number {
    let health = 50; // Start at neutral

    // Progress contribution (-10 to +20)
    if (progress < 5) health -= 10; // Too new
    else if (progress > 95) health += 20; // Near graduation
    else if (progress > 50) health += 10; // Good progress

    // Velocity contribution (-20 to +20)
    if (velocity > 5) health += 20; // Strong momentum
    else if (velocity > 1) health += 10; // Good momentum
    else if (velocity < -5) health -= 20; // Declining fast
    else if (velocity < 0) health -= 10; // Declining

    // Liquidity contribution (-10 to +10)
    if (liquidity > 5000) health += 10;
    else if (liquidity < 500) health -= 10;

    return Math.max(0, Math.min(health, 100));
  }

  /**
   * Determine curve trend direction.
   */
  private determineCurveTrend(history: PricePoint[]): 'up' | 'down' | 'flat' {
    if (history.length < 3) return 'flat';

    const recent = history.slice(-5);
    if (recent.length < 3) return 'flat';

    const first = recent[0].price;
    const last = recent[recent.length - 1].price;

    const change = ((last - first) / first) * 100;

    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'flat';
  }

  /**
   * Normalize velocity to 0-100 score.
   */
  private normalizeVelocityScore(velocity: number): number {
    // Map velocity to 0-100 scale
    // -10 to +10 range
    const clamped = Math.max(-10, Math.min(velocity, 10));
    const normalized = ((clamped + 10) / 20) * 100;
    return Math.round(normalized);
  }

  /**
   * Calculate price stability score (0-100).
   */
  private calculateStabilityScore(history: PricePoint[]): number {
    if (history.length < 3) return 50;

    const prices = history.map(p => p.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    if (mean === 0) return 0;

    // Calculate standard deviation
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (lower = more stable)
    const cv = stdDev / mean;

    // Convert to 0-100 score (lower CV = higher stability)
    const stability = Math.max(0, 100 - (cv * 100));

    return Math.round(stability);
  }

  // ============================================================
  // SNIPER SIGNALS
  // ============================================================

  /**
   * Generate sniper signal flags.
   */
  private generateSniperSignals(
    ageSeconds: number,
    bondingProgress: number,
    velocity: number,
    currentVolume: number,
    previousVolume: number
  ): SniperSignals {
    return {
      snipeFresh: ageSeconds < 90,
      snipeCurveEdge: bondingProgress >= 96 && velocity > 1.0,
      snipeVolumeSpike: previousVolume > 0 && currentVolume > previousVolume * 2,
    };
  }

  // ============================================================
  // TREND SIGNALS
  // ============================================================

  /**
   * Generate trend signal flags.
   */
  private generateTrendSignals(history: PricePoint[]): TrendSignals {
    if (history.length < 3) {
      return {
        trendingUp: false,
        trendingDown: false,
      };
    }

    const last3 = history.slice(-3);
    const prices = last3.map(p => p.price);

    const isIncreasing = prices[0] < prices[1] && prices[1] < prices[2];
    const isDecreasing = prices[0] > prices[1] && prices[1] > prices[2];

    return {
      trendingUp: isIncreasing,
      trendingDown: isDecreasing,
    };
  }

  // ============================================================
  // PRICE ANALYSIS
  // ============================================================

  /**
   * Calculate 24h price change percentage.
   */
  private calculatePriceChange24h(history: PricePoint[]): number {
    if (history.length < 2) return 0;

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Find oldest price within 24h window
    const oldPoints = history.filter(p => p.timestamp >= oneDayAgo);
    if (oldPoints.length === 0) return 0;

    const oldest = oldPoints[0];
    const newest = history[history.length - 1];

    if (oldest.price === 0) return 0;

    return ((newest.price - oldest.price) / oldest.price) * 100;
  }

  /**
   * Calculate liquidity drop percentage.
   */
  private calculateLiquidityDrop(history: PricePoint[]): number {
    if (history.length < 2) return 0;

    const recent = history.slice(-10);
    if (recent.length < 2) return 0;

    const first = recent[0];
    const last = recent[recent.length - 1];

    // Approximate liquidity from volume (simplified)
    const liquidityChange = last.volume - first.volume;
    if (first.volume === 0) return 0;

    const dropPercent = (liquidityChange / first.volume) * 100;

    // Only return if it's a drop (negative)
    return dropPercent < 0 ? Math.abs(dropPercent) : 0;
  }

  // ============================================================
  // RISK SCORING
  // ============================================================

  /**
   * Map risk string to numeric score (0-100).
   */
  private mapRiskToScore(risk: string): number {
    switch (risk) {
      case 'SAFE':
        return 0;
      case 'LOW':
        return 25;
      case 'MEDIUM':
      case 'WARNING':
        return 50;
      case 'HIGH':
      case 'DANGER':
        return 100;
      default:
        return 50;
    }
  }

  /**
   * Calculate comprehensive risk score (0-100).
   */
  private calculateRiskScore(
    lpBurned: boolean,
    mintDisabled: boolean,
    freezeDisabled: boolean,
    ageMinutes: number,
    liquidity: number,
    authorityRisk: number,
    liquidityHealth: number
  ): number {
    let risk = 0;

    // Authority risks (40 points total)
    if (!mintDisabled) risk += 20;
    if (!freezeDisabled) risk += 20;

    // LP risk (30 points)
    if (!lpBurned) risk += 30;

    // Age risk (15 points)
    if (ageMinutes < 5) risk += 15;
    else if (ageMinutes < 30) risk += 10;
    else if (ageMinutes < 60) risk += 5;

    // Liquidity risk (15 points)
    if (liquidity < 100) risk += 15;
    else if (liquidity < 500) risk += 10;
    else if (liquidity < 1000) risk += 5;

    // Add authority risk contribution (weighted)
    risk += authorityRisk * 0.2;

    // Reduce risk for healthy liquidity
    risk -= (liquidityHealth * 0.15);

    return Math.max(0, Math.min(Math.round(risk), 100));
  }

  /**
   * Determine if token is alive/active.
   */
  private isTokenAlive(liquidity: number, volume: number, marketCap: number): boolean {
    if (marketCap <= 0) return false;
    if (liquidity <= 0) return false;
    if (liquidity < 100 && volume < 100) return false;
    return true;
  }

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  /**
   * Get snapshot of last normalized token for a mint.
   */
  getSnapshot(mint: string): Token | undefined {
    const state = this.state.get(mint);
    return state?.lastNormalized || undefined;
  }

  /**
   * Get all normalized tokens.
   */
  getAll(): Token[] {
    const tokens: Token[] = [];
    for (const state of this.state.values()) {
      if (state.lastNormalized) {
        tokens.push(state.lastNormalized);
      }
    }
    return tokens;
  }

  /**
   * Reset all internal state.
   */
  reset(): void {
    this.state.clear();
  }

  /**
   * Get internal state for debugging.
   */
  getState(): Map<string, MintState> {
    return this.state;
  }

  /**
   * Get number of tracked mints.
   */
  getTrackedCount(): number {
    return this.state.size;
  }
}

// ============================================================
// EXPORT
// ============================================================

export default FeedNormalizer;
