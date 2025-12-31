/**
 * Watchdog Engine (S6)
 * 
 * Central intelligence engine for Watchdog Mode
 * Evaluates token snapshots, detects events, and triggers actions
 */

import type {
  WatchdogRule,
  WatchdogSnapshot,
  WatchdogEvent,
  WatchCondition,
  WatchdogThresholds,
} from './watchdogTypes';

// =============================================
// DEFAULT THRESHOLDS
// =============================================

const DEFAULT_THRESHOLDS: WatchdogThresholds = {
  lpSurgeThreshold: 50,
  lpDrainThreshold: 30,
  mcSpikeThreshold: 100,
  mcCrashThreshold: 50,
  volumeSpikeMultiplier: 5,
  velocitySpikeThreshold: 50,
  velocityDropThreshold: -30,
  whaleBuyThreshold: 10,
  whaleSellThreshold: 10,
  bondingNearGradThreshold: 90,
};

// =============================================
// WATCHDOG ENGINE CLASS
// =============================================

export class WatchdogEngine {
  private rules: Map<string, WatchdogRule> = new Map();
  private snapshots: Map<string, WatchdogSnapshot[]> = new Map();
  private events: WatchdogEvent[] = [];
  private thresholds: WatchdogThresholds = DEFAULT_THRESHOLDS;

  /**
   * Add a new rule
   */
  addRule(rule: WatchdogRule): void {
    this.rules.set(rule.id, rule);
    console.log(`🐕 Watchdog: Rule added - ${rule.name}`);
  }

  /**
   * Remove a rule
   */
  removeRule(id: string): void {
    this.rules.delete(id);
    console.log(`🐕 Watchdog: Rule removed - ${id}`);
  }

  /**
   * Update an existing rule
   */
  updateRule(rule: WatchdogRule): void {
    this.rules.set(rule.id, rule);
    console.log(`🐕 Watchdog: Rule updated - ${rule.name}`);
  }

  /**
   * Get all rules
   */
  getRules(): WatchdogRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  getRule(id: string): WatchdogRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Update token snapshot
   */
  updateSnapshot(snapshot: WatchdogSnapshot): void {
    const mint = snapshot.mint;
    
    if (!this.snapshots.has(mint)) {
      this.snapshots.set(mint, []);
    }
    
    const snaps = this.snapshots.get(mint)!;
    snaps.push(snapshot);
    
    // Keep only last 10 snapshots per token
    if (snaps.length > 10) {
      snaps.shift();
    }
  }

  /**
   * Get snapshots for a token
   */
  getSnapshots(mint: string): WatchdogSnapshot[] {
    return this.snapshots.get(mint) ?? [];
  }

  /**
   * Get latest snapshot for a token
   */
  getLatestSnapshot(mint: string): WatchdogSnapshot | undefined {
    const snaps = this.snapshots.get(mint);
    return snaps && snaps.length > 0 ? snaps[snaps.length - 1] : undefined;
  }

  /**
   * Get all events
   */
  getEvents(): WatchdogEvent[] {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Update thresholds
   */
  setThresholds(thresholds: Partial<WatchdogThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Main evaluation loop
   * Checks all rules against all snapshots and generates events
   */
  evaluate(): void {
    const now = Date.now();

    for (const rule of this.rules.values()) {
      // Skip disabled rules
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.cooldown && rule.lastTriggered) {
        const timeSinceLastTrigger = now - rule.lastTriggered;
        if (timeSinceLastTrigger < rule.cooldown * 1000) {
          continue; // Still in cooldown
        }
      }

      // Determine target snapshots
      let targets: WatchdogSnapshot[] = [];

      if (rule.tokenMint) {
        // Rule targets specific token
        const snap = this.getLatestSnapshot(rule.tokenMint);
        if (snap) targets.push(snap);
      } else {
        // Rule watches all tokens
        for (const mint of this.snapshots.keys()) {
          const snap = this.getLatestSnapshot(mint);
          if (snap) targets.push(snap);
        }
      }

      // Check condition for each target
      for (const snap of targets) {
        const triggered = this.checkCondition(rule, snap);

        if (triggered) {
          // Safety checks if enabled
          if (rule.useSafety && !this.passesSafety(snap)) {
            continue; // Failed safety checks
          }

          // Create event
          const event: WatchdogEvent = {
            id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            tokenMint: snap.mint,
            tokenSymbol: snap.symbol,
            condition: rule.condition,
            message: `Watchdog triggered: ${rule.name} - ${rule.condition}`,
            timestamp: now,
            action: rule.action,
            status: 'PENDING',
          };

          this.events.push(event);

          // Update rule trigger info
          rule.lastTriggered = now;
          rule.triggerCount = (rule.triggerCount ?? 0) + 1;

          console.log(`🐕 WATCHDOG TRIGGER: ${rule.name}`);
          console.log(`   Token: ${snap.symbol ?? snap.mint}`);
          console.log(`   Condition: ${rule.condition}`);
          console.log(`   Action: ${rule.action}`);
        }
      }
    }
  }

  /**
   * Check if a condition is met for a snapshot
   */
  private checkCondition(rule: WatchdogRule, snap: WatchdogSnapshot): boolean {
    const snaps = this.getSnapshots(snap.mint);
    const prev = snaps.length > 1 ? snaps[snaps.length - 2] : null;

    switch (rule.condition) {
      case 'NEW_POOL':
        // New pool detected (LP added recently)
        return snap.lpAmount > 0 && (Date.now() - snap.lastUpdated) < 5000;

      case 'LP_ADDED':
        // LP was added
        return snap.lpVelocity > 0;

      case 'LP_SURGE':
        // Large LP increase
        return snap.lpVelocity > this.thresholds.lpSurgeThreshold;

      case 'LP_DRAIN':
        // LP being removed
        return snap.lpVelocity < -this.thresholds.lpDrainThreshold;

      case 'LP_RUG':
        // LP pulled to zero
        return prev && prev.lpAmount > 0 && snap.lpAmount === 0;

      case 'MIGRATION':
        // Pool migration detected (new LP after rug)
        return (
          prev &&
          prev.lpAmount === 0 &&
          snap.lpAmount > 0 &&
          !snap.authorityRisk
        );

      case 'BONDING_NEAR_GRAD':
        // Bonding curve near graduation
        return (
          snap.bondingProgress >= this.thresholds.bondingNearGradThreshold &&
          snap.bondingVelocity > 0
        );

      case 'BONDING_STALL':
        // Bonding curve stalled
        return (
          snap.bondingProgress > 20 &&
          snap.bondingProgress < 90 &&
          Math.abs(snap.bondingVelocity) < 0.1
        );

      case 'MC_SPIKE':
        // Market cap spike
        if (!prev) return false;
        const mcIncrease = ((snap.marketCap - prev.marketCap) / prev.marketCap) * 100;
        return mcIncrease >= this.thresholds.mcSpikeThreshold;

      case 'MC_CRASH':
        // Market cap crash
        if (!prev) return false;
        const mcDecrease = ((prev.marketCap - snap.marketCap) / prev.marketCap) * 100;
        return mcDecrease >= this.thresholds.mcCrashThreshold;

      case 'VOLUME_SPIKE':
        // Volume spike detected
        if (!snap.volume24h) return false;
        // TODO: Compare with average - for now use simple threshold
        return snap.volume24h > 100000;

      case 'VELOCITY_SPIKE':
        // High velocity detected
        return snap.bondingVelocity >= this.thresholds.velocitySpikeThreshold;

      case 'VELOCITY_DROP':
        // Velocity dropped suddenly
        return snap.bondingVelocity <= this.thresholds.velocityDropThreshold;

      case 'WHALE_BUY':
        // Large buy detected
        if (!prev) return false;
        const buyAmount = snap.lpAmount - prev.lpAmount;
        return buyAmount >= this.thresholds.whaleBuyThreshold;

      case 'WHALE_SELL':
        // Large sell detected
        if (!prev) return false;
        const sellAmount = prev.lpAmount - snap.lpAmount;
        return sellAmount >= this.thresholds.whaleSellThreshold;

      case 'AUTHORITY_RISK':
        // Authority risk detected
        return snap.authorityRisk === true;

      case 'SAFETY_FAIL':
        // Safety checks failed
        return snap.authorityRisk || !snap.lpLocked || !snap.isRenounced;

      default:
        return false;
    }
  }

  /**
   * Check if snapshot passes safety requirements
   */
  private passesSafety(snap: WatchdogSnapshot): boolean {
    // LP must be locked
    if (!snap.lpLocked) return false;

    // Must be renounced
    if (!snap.isRenounced) return false;

    // No authority risk
    if (snap.authorityRisk) return false;

    return true;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalRules: number;
    activeRules: number;
    totalEvents: number;
    monitoredTokens: number;
  } {
    const activeRules = Array.from(this.rules.values()).filter((r) => r.enabled)
      .length;

    return {
      totalRules: this.rules.size,
      activeRules,
      totalEvents: this.events.length,
      monitoredTokens: this.snapshots.size,
    };
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

let engineInstance: WatchdogEngine | null = null;

/**
 * Get singleton engine instance
 */
export function getWatchdogEngine(): WatchdogEngine {
  if (!engineInstance) {
    engineInstance = new WatchdogEngine();
  }
  return engineInstance;
}

// =============================================
// EXPORTS
// =============================================

export default WatchdogEngine;
