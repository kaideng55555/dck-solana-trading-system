/**
 * Bonding Curve Predictor
 * 
 * Advanced ML-inspired predictor for estimating bonding curve graduation timing
 * Uses historical velocity, market cap growth, and liquidity patterns
 * to predict when tokens will reach 100% curve completion
 */

// =============================================
// TYPES
// =============================================

export interface BondingCurveSnapshot {
  /** Timestamp of snapshot */
  timestamp: number;
  
  /** Bonding progress (0-100) */
  progress: number;
  
  /** Market cap at snapshot */
  marketCap: number;
  
  /** Liquidity at snapshot */
  liquidity: number;
  
  /** Price at snapshot */
  price: number;
  
  /** Volume in last hour */
  volume1h: number;
}

export interface PredictionResult {
  /** Estimated graduation time (unix timestamp) */
  estimatedGraduationTime: number;
  
  /** Confidence score (0-100) */
  confidence: number;
  
  /** Current velocity (% per minute) */
  velocity: number;
  
  /** Acceleration (change in velocity) */
  acceleration: number;
  
  /** Time to graduation (seconds) */
  timeToGraduation: number;
  
  /** Predicted final market cap at graduation */
  predictedFinalMC: number;
  
  /** Risk factors */
  riskFactors: string[];
  
  /** Recommended action */
  recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR' | 'AVOID';
}

export interface VelocityMetrics {
  /** Current velocity (% per minute) */
  current: number;
  
  /** Average velocity over last 5 minutes */
  avg5m: number;
  
  /** Average velocity over last 15 minutes */
  avg15m: number;
  
  /** Peak velocity seen */
  peak: number;
  
  /** Is velocity increasing? */
  isAccelerating: boolean;
}

// =============================================
// BONDING CURVE PREDICTOR CLASS
// =============================================

export class BondingCurvePredictor {
  private snapshots: Map<string, BondingCurveSnapshot[]> = new Map();
  private readonly MAX_SNAPSHOTS = 100; // Keep last 100 snapshots per token

  // =============================================
  // SNAPSHOT MANAGEMENT
  // =============================================

  /**
   * Add snapshot for token
   */
  addSnapshot(tokenMint: string, snapshot: BondingCurveSnapshot): void {
    let snapshots = this.snapshots.get(tokenMint) || [];
    
    // Add new snapshot
    snapshots.push(snapshot);
    
    // Keep only last MAX_SNAPSHOTS
    if (snapshots.length > this.MAX_SNAPSHOTS) {
      snapshots = snapshots.slice(-this.MAX_SNAPSHOTS);
    }
    
    this.snapshots.set(tokenMint, snapshots);
  }

  /**
   * Get snapshots for token
   */
  getSnapshots(tokenMint: string): BondingCurveSnapshot[] {
    return this.snapshots.get(tokenMint) || [];
  }

  /**
   * Clear snapshots for token
   */
  clearSnapshots(tokenMint: string): void {
    this.snapshots.delete(tokenMint);
  }

  // =============================================
  // PREDICTION
  // =============================================

  /**
   * Predict graduation timing for token
   */
  predict(tokenMint: string, currentProgress: number): PredictionResult {
    const snapshots = this.getSnapshots(tokenMint);
    
    // Need at least 3 snapshots for accurate prediction
    if (snapshots.length < 3) {
      return this.getDefaultPrediction(currentProgress);
    }

    // Calculate velocity metrics
    const velocity = this.calculateVelocityMetrics(snapshots);
    
    // Calculate acceleration
    const acceleration = this.calculateAcceleration(snapshots);
    
    // Estimate time to graduation
    const timeToGraduation = this.estimateTimeToGraduation(
      currentProgress,
      velocity,
      acceleration
    );
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(snapshots, velocity);
    
    // Predict final market cap
    const predictedFinalMC = this.predictFinalMarketCap(snapshots);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(snapshots, velocity);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(
      currentProgress,
      velocity,
      confidence,
      riskFactors
    );

    return {
      estimatedGraduationTime: Date.now() + timeToGraduation * 1000,
      confidence,
      velocity: velocity.current,
      acceleration,
      timeToGraduation,
      predictedFinalMC,
      riskFactors,
      recommendation,
    };
  }

  /**
   * Calculate velocity metrics from snapshots
   */
  private calculateVelocityMetrics(snapshots: BondingCurveSnapshot[]): VelocityMetrics {
    if (snapshots.length < 2) {
      return {
        current: 0,
        avg5m: 0,
        avg15m: 0,
        peak: 0,
        isAccelerating: false,
      };
    }

    const now = Date.now();
    const velocities: number[] = [];

    // Calculate velocity between each snapshot pair
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      
      const timeDelta = (curr.timestamp - prev.timestamp) / 1000 / 60; // minutes
      const progressDelta = curr.progress - prev.progress;
      
      if (timeDelta > 0) {
        velocities.push(progressDelta / timeDelta);
      }
    }

    // Current velocity (last 2 snapshots)
    const current = velocities.length > 0 ? velocities[velocities.length - 1] : 0;

    // Average velocity over last 5 minutes
    const last5m = snapshots.filter(s => now - s.timestamp <= 5 * 60 * 1000);
    const avg5m = last5m.length >= 2 
      ? this.calculateAverageVelocity(last5m)
      : current;

    // Average velocity over last 15 minutes
    const last15m = snapshots.filter(s => now - s.timestamp <= 15 * 60 * 1000);
    const avg15m = last15m.length >= 2
      ? this.calculateAverageVelocity(last15m)
      : avg5m;

    // Peak velocity
    const peak = Math.max(...velocities);

    // Is accelerating? (current > average)
    const isAccelerating = current > avg5m;

    return {
      current,
      avg5m,
      avg15m,
      peak,
      isAccelerating,
    };
  }

  /**
   * Calculate average velocity from snapshots
   */
  private calculateAverageVelocity(snapshots: BondingCurveSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    
    const timeDelta = (last.timestamp - first.timestamp) / 1000 / 60; // minutes
    const progressDelta = last.progress - first.progress;
    
    return timeDelta > 0 ? progressDelta / timeDelta : 0;
  }

  /**
   * Calculate acceleration (change in velocity)
   */
  private calculateAcceleration(snapshots: BondingCurveSnapshot[]): number {
    if (snapshots.length < 3) return 0;

    const velocities: number[] = [];

    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      
      const timeDelta = (curr.timestamp - prev.timestamp) / 1000 / 60;
      const progressDelta = curr.progress - prev.progress;
      
      if (timeDelta > 0) {
        velocities.push(progressDelta / timeDelta);
      }
    }

    if (velocities.length < 2) return 0;

    // Calculate change in velocity
    const recentVelocity = velocities.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderVelocity = velocities.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

    return recentVelocity - olderVelocity;
  }

  /**
   * Estimate time to graduation
   */
  private estimateTimeToGraduation(
    currentProgress: number,
    velocity: VelocityMetrics,
    acceleration: number
  ): number {
    const remaining = 100 - currentProgress;
    
    if (velocity.current <= 0) {
      return Infinity;
    }

    // Use quadratic prediction if accelerating
    if (acceleration > 0 && velocity.isAccelerating) {
      // t = (-v + sqrt(v^2 + 2*a*d)) / a
      const v = velocity.current;
      const a = acceleration;
      const d = remaining;
      
      const discriminant = v * v + 2 * a * d;
      if (discriminant >= 0) {
        const time = (-v + Math.sqrt(discriminant)) / a;
        return Math.max(time * 60, 0); // Convert to seconds
      }
    }

    // Simple linear prediction
    return (remaining / velocity.current) * 60; // Convert to seconds
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(
    snapshots: BondingCurveSnapshot[],
    velocity: VelocityMetrics
  ): number {
    let confidence = 50; // Start at 50%

    // More snapshots = higher confidence
    const snapshotScore = Math.min(snapshots.length / 10, 1) * 20;
    confidence += snapshotScore;

    // Consistent velocity = higher confidence
    const velocityConsistency = 1 - Math.abs(velocity.current - velocity.avg5m) / Math.max(velocity.current, velocity.avg5m, 1);
    confidence += velocityConsistency * 15;

    // Recent data = higher confidence
    const latestSnapshot = snapshots[snapshots.length - 1];
    const dataAge = (Date.now() - latestSnapshot.timestamp) / 1000 / 60; // minutes
    const freshnessScore = Math.max(0, 1 - dataAge / 10) * 15;
    confidence += freshnessScore;

    return Math.min(Math.max(confidence, 0), 100);
  }

  /**
   * Predict final market cap at graduation
   */
  private predictFinalMarketCap(snapshots: BondingCurveSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    // Calculate market cap growth rate
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    
    const mcGrowthRate = (last.marketCap - first.marketCap) / first.marketCap;
    const progressGrowth = last.progress - first.progress;
    
    if (progressGrowth <= 0) return last.marketCap;

    // Extrapolate to 100% progress
    const remainingProgress = 100 - last.progress;
    const projectedGrowth = (mcGrowthRate / progressGrowth) * remainingProgress;
    
    return last.marketCap * (1 + projectedGrowth);
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(
    snapshots: BondingCurveSnapshot[],
    velocity: VelocityMetrics
  ): string[] {
    const risks: string[] = [];

    // Slow velocity
    if (velocity.current < 0.5) {
      risks.push('SLOW_PROGRESSION');
    }

    // Decelerating
    if (!velocity.isAccelerating && velocity.current < velocity.avg15m) {
      risks.push('DECELERATING');
    }

    // Low liquidity
    const latestSnapshot = snapshots[snapshots.length - 1];
    if (latestSnapshot && latestSnapshot.liquidity < 5) {
      risks.push('LOW_LIQUIDITY');
    }

    // Stagnant progress
    const last10 = snapshots.slice(-10);
    if (last10.length >= 10) {
      const progressChange = last10[last10.length - 1].progress - last10[0].progress;
      if (progressChange < 0.5) {
        risks.push('STAGNANT');
      }
    }

    // Low volume
    if (latestSnapshot && latestSnapshot.volume1h < 1) {
      risks.push('LOW_VOLUME');
    }

    return risks;
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    currentProgress: number,
    velocity: VelocityMetrics,
    confidence: number,
    riskFactors: string[]
  ): PredictionResult['recommendation'] {
    // Too many risks
    if (riskFactors.length >= 3) {
      return 'AVOID';
    }

    // Near graduation with good velocity
    if (currentProgress >= 97 && velocity.current > 1 && confidence > 70) {
      return 'BUY_NOW';
    }

    // Good momentum, not quite there yet
    if (currentProgress >= 95 && velocity.isAccelerating && confidence > 60) {
      return 'MONITOR';
    }

    // Early or uncertain
    if (currentProgress < 95 || confidence < 50) {
      return 'WAIT';
    }

    return 'MONITOR';
  }

  /**
   * Get default prediction when not enough data
   */
  private getDefaultPrediction(currentProgress: number): PredictionResult {
    const remaining = 100 - currentProgress;
    const estimatedTime = remaining * 120; // Assume 2 minutes per %

    return {
      estimatedGraduationTime: Date.now() + estimatedTime * 1000,
      confidence: 20, // Low confidence
      velocity: 0.5, // Assume slow velocity
      acceleration: 0,
      timeToGraduation: estimatedTime,
      predictedFinalMC: 0,
      riskFactors: ['INSUFFICIENT_DATA'],
      recommendation: 'WAIT',
    };
  }

  // =============================================
  // UTILITIES
  // =============================================

  /**
   * Get statistics for all tracked tokens
   */
  getStats(): {
    totalTokens: number;
    avgSnapshots: number;
    oldestSnapshot: number;
  } {
    const tokens = Array.from(this.snapshots.keys());
    const totalSnapshots = Array.from(this.snapshots.values())
      .reduce((sum, snapshots) => sum + snapshots.length, 0);
    
    let oldestTimestamp = Date.now();
    for (const snapshots of this.snapshots.values()) {
      if (snapshots.length > 0) {
        const oldest = Math.min(...snapshots.map(s => s.timestamp));
        oldestTimestamp = Math.min(oldestTimestamp, oldest);
      }
    }

    return {
      totalTokens: tokens.length,
      avgSnapshots: tokens.length > 0 ? totalSnapshots / tokens.length : 0,
      oldestSnapshot: oldestTimestamp,
    };
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.snapshots.clear();
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

let predictorInstance: BondingCurvePredictor | null = null;

export function getBondingCurvePredictor(): BondingCurvePredictor {
  if (!predictorInstance) {
    predictorInstance = new BondingCurvePredictor();
  }
  return predictorInstance;
}

// =============================================
// EXPORTS
// =============================================

export default BondingCurvePredictor;
