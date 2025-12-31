/**
 * LP Event Sniper Engine (S4)
 * 
 * Tracks liquidity pool events and generates snipe opportunities
 * Monitors LP additions, removals, locks, burns, and rug pulls
 */

import type {
  LPEvent,
  LPSnapshot,
  LPOpportunity,
  LPStatus,
  LPScore,
} from '../../types/lpTypes';
import type { Token } from '../../data/tokenTypes';

// =============================================
// LP TRACKING STATE
// =============================================

const lpSnapshots = new Map<string, LPSnapshot[]>();
const lpEvents = new Map<string, LPEvent[]>();

// =============================================
// LP SNAPSHOT MANAGEMENT
// =============================================

/**
 * Add LP snapshot for token
 */
export function addLPSnapshot(token: Token): void {
  const mint = token.mint;
  const snapshot: LPSnapshot = {
    timestamp: Date.now(),
    amount: token.market.liquidity ?? 0,
    isLocked: token.lpLocked ?? false,
    isBurned: token.lpBurned ?? false,
  };

  if (!lpSnapshots.has(mint)) {
    lpSnapshots.set(mint, []);
  }

  const snapshots = lpSnapshots.get(mint)!;
  snapshots.push(snapshot);

  // Keep only last 10 snapshots
  if (snapshots.length > 10) {
    snapshots.shift();
  }
}

/**
 * Get LP snapshots for token
 */
export function getLPSnapshots(mint: string): LPSnapshot[] {
  return lpSnapshots.get(mint) ?? [];
}

/**
 * Clear LP snapshots for token
 */
export function clearLPSnapshots(mint: string): void {
  lpSnapshots.delete(mint);
  lpEvents.delete(mint);
}

// =============================================
// LP VELOCITY CALCULATION
// =============================================

/**
 * Calculate LP velocity from last 3 snapshots
 */
export function calculateLPVelocity(snapshots: LPSnapshot[]): number {
  if (snapshots.length < 2) return 0;

  // Use last 3 snapshots for moving average
  const recentSnapshots = snapshots.slice(-3);
  
  let totalVelocity = 0;
  let validPairs = 0;

  for (let i = 1; i < recentSnapshots.length; i++) {
    const prev = recentSnapshots[i - 1];
    const curr = recentSnapshots[i];
    
    const timeDiffMinutes = (curr.timestamp - prev.timestamp) / 60000;
    if (timeDiffMinutes === 0) continue;

    const lpChange = curr.amount - prev.amount;
    const percentChange = prev.amount > 0 ? (lpChange / prev.amount) * 100 : 0;
    const velocity = percentChange / timeDiffMinutes;

    totalVelocity += velocity;
    validPairs++;
  }

  return validPairs > 0 ? totalVelocity / validPairs : 0;
}

/**
 * Calculate LP change in last 1 minute
 */
export function calculateLPChange1m(snapshots: LPSnapshot[]): number {
  if (snapshots.length < 2) return 0;

  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Find snapshot closest to 1 minute ago
  let baseSnapshot = snapshots[0];
  for (const snapshot of snapshots) {
    if (snapshot.timestamp >= oneMinuteAgo) {
      baseSnapshot = snapshot;
      break;
    }
  }

  const currentSnapshot = snapshots[snapshots.length - 1];
  return currentSnapshot.amount - baseSnapshot.amount;
}

// =============================================
// LP STATUS DETECTION
// =============================================

/**
 * Determine LP status from snapshots
 */
export function determineLPStatus(
  snapshots: LPSnapshot[],
  velocity: number
): LPStatus {
  if (snapshots.length === 0) return 'STABLE';

  const current = snapshots[snapshots.length - 1];
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  // Check for locked/burned first (priority status)
  if (current.isBurned) return 'BURNED';
  if (current.isLocked) return 'LOCKED';

  // Check for rug pull (LP went to 0)
  if (previous && previous.amount > 0 && current.amount === 0) {
    return 'RUGGED';
  }

  // Check for new LP (first time adding liquidity)
  if (snapshots.length === 1 && current.amount > 0) {
    return 'NEW_LP';
  }

  // Check for re-added (was 0, now has LP)
  if (previous && previous.amount === 0 && current.amount > 0) {
    return 'RE_ADDED';
  }

  // Check for surging (high positive velocity)
  if (velocity > 50) {
    return 'SURGING';
  }

  // Check for draining (negative velocity)
  if (velocity < -10) {
    return 'DRAINING';
  }

  return 'STABLE';
}

// =============================================
// LP SCORE CALCULATION
// =============================================

/**
 * Calculate LP score (0-100)
 */
export function calculateLPScore(
  lpAmount: number,
  velocity: number,
  isLocked: boolean,
  isBurned: boolean,
  lpStatus: LPStatus
): LPScore {
  let amountScore = 0;
  let velocityScore = 0;
  let safetyScore = 0;

  // Amount score (0-30)
  if (lpAmount >= 100) amountScore = 30;
  else if (lpAmount >= 50) amountScore = 25;
  else if (lpAmount >= 20) amountScore = 20;
  else if (lpAmount >= 10) amountScore = 15;
  else if (lpAmount >= 5) amountScore = 10;
  else amountScore = 5;

  // Velocity score (0-30)
  if (velocity > 100) velocityScore = 30;
  else if (velocity > 50) velocityScore = 25;
  else if (velocity > 20) velocityScore = 20;
  else if (velocity > 10) velocityScore = 15;
  else if (velocity > 0) velocityScore = 10;
  else if (velocity > -10) velocityScore = 5;
  else velocityScore = 0; // Negative velocity is bad

  // Safety score (0-40)
  if (isBurned) safetyScore = 40;
  else if (isLocked) safetyScore = 35;
  else if (lpStatus === 'STABLE') safetyScore = 20;
  else if (lpStatus === 'SURGING') safetyScore = 25;
  else if (lpStatus === 'NEW_LP') safetyScore = 15;
  else if (lpStatus === 'RE_ADDED') safetyScore = 10;
  else if (lpStatus === 'DRAINING') safetyScore = 5;
  else safetyScore = 0; // RUGGED

  const total = amountScore + velocityScore + safetyScore;

  // Confidence based on status
  let confidence = 0.5;
  if (isBurned || isLocked) confidence = 0.9;
  else if (lpStatus === 'SURGING') confidence = 0.8;
  else if (lpStatus === 'STABLE') confidence = 0.7;
  else if (lpStatus === 'NEW_LP') confidence = 0.6;
  else if (lpStatus === 'DRAINING') confidence = 0.3;
  else if (lpStatus === 'RUGGED') confidence = 0.1;

  return {
    total,
    breakdown: {
      amount: amountScore,
      velocity: velocityScore,
      safety: safetyScore,
    },
    confidence,
  };
}

// =============================================
// LP EVENT DETECTION
// =============================================

/**
 * Detect and log LP events
 */
export function detectLPEvents(
  mint: string,
  snapshots: LPSnapshot[]
): LPEvent[] {
  if (snapshots.length < 2) return [];

  const events: LPEvent[] = [];
  const recent = snapshots.slice(-2);
  const prev = recent[0];
  const curr = recent[1];

  const lpChange = curr.amount - prev.amount;

  // LP Added
  if (prev.amount === 0 && curr.amount > 0) {
    events.push({
      id: `lp-event-${Date.now()}`,
      timestamp: curr.timestamp,
      tokenMint: mint,
      type: 'LP_ADDED',
      lpBefore: prev.amount,
      lpAfter: curr.amount,
      lpChange,
    });
  }

  // LP Removed / Rugged
  if (prev.amount > 0 && curr.amount === 0) {
    events.push({
      id: `lp-event-${Date.now()}`,
      timestamp: curr.timestamp,
      tokenMint: mint,
      type: 'LP_RUGGED',
      lpBefore: prev.amount,
      lpAfter: curr.amount,
      lpChange,
    });
  }

  // LP Locked
  if (!prev.isLocked && curr.isLocked) {
    events.push({
      id: `lp-event-${Date.now()}`,
      timestamp: curr.timestamp,
      tokenMint: mint,
      type: 'LP_LOCKED',
      lpBefore: prev.amount,
      lpAfter: curr.amount,
      lpChange,
    });
  }

  // LP Burned
  if (!prev.isBurned && curr.isBurned) {
    events.push({
      id: `lp-event-${Date.now()}`,
      timestamp: curr.timestamp,
      tokenMint: mint,
      type: 'LP_BURNED',
      lpBefore: prev.amount,
      lpAfter: curr.amount,
      lpChange,
    });
  }

  // Significant LP change (>20%)
  if (prev.amount > 0) {
    const percentChange = Math.abs(lpChange / prev.amount) * 100;
    if (percentChange > 20) {
      events.push({
        id: `lp-event-${Date.now()}`,
        timestamp: curr.timestamp,
        tokenMint: mint,
        type: lpChange > 0 ? 'LP_ADDED' : 'LP_REMOVED',
        lpBefore: prev.amount,
        lpAfter: curr.amount,
        lpChange,
      });
    }
  }

  // Store events
  if (events.length > 0) {
    if (!lpEvents.has(mint)) {
      lpEvents.set(mint, []);
    }
    const storedEvents = lpEvents.get(mint)!;
    storedEvents.push(...events);
    
    // Keep only last 20 events
    if (storedEvents.length > 20) {
      storedEvents.splice(0, storedEvents.length - 20);
    }
  }

  return events;
}

/**
 * Get LP events for token
 */
export function getLPEvents(mint: string): LPEvent[] {
  return lpEvents.get(mint) ?? [];
}

// =============================================
// OPPORTUNITY GENERATION
// =============================================

/**
 * Generate LP opportunity from token
 */
export function generateLPOpportunity(token: Token): LPOpportunity | null {
  const mint = token.mint;
  const snapshots = getLPSnapshots(mint);

  if (snapshots.length === 0) {
    return null;
  }

  const current = snapshots[snapshots.length - 1];
  const velocity = calculateLPVelocity(snapshots);
  const lpChange1m = calculateLPChange1m(snapshots);
  const lpStatus = determineLPStatus(snapshots, velocity);
  const lpScore = calculateLPScore(
    current.amount,
    velocity,
    current.isLocked,
    current.isBurned,
    lpStatus
  );

  // Determine safety
  const isSafe = current.isLocked || current.isBurned;

  // Determine recommendation
  let recommendation: 'BUY_NOW' | 'WAIT' | 'AVOID' = 'WAIT';
  if (lpStatus === 'RUGGED' || lpStatus === 'DRAINING') {
    recommendation = 'AVOID';
  } else if (
    (lpStatus === 'SURGING' || lpStatus === 'NEW_LP') &&
    isSafe &&
    lpScore.total >= 70
  ) {
    recommendation = 'BUY_NOW';
  } else if (lpScore.total >= 50 && isSafe) {
    recommendation = 'WAIT';
  } else {
    recommendation = 'AVOID';
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (isSafe && lpScore.total >= 70) riskLevel = 'low';
  else if (lpScore.total < 40 || !isSafe) riskLevel = 'high';

  return {
    mint,
    symbol: token.metadata.symbol,
    name: token.metadata.name,
    lpAmount: current.amount,
    lpChange1m,
    lpVelocity: velocity,
    lpStatus,
    lpScore,
    isSafe,
    recommendation,
    riskLevel,
    lastUpdated: Date.now(),
    snapshots: snapshots.slice(-3), // Last 3 snapshots
    events: getLPEvents(mint).slice(-5), // Last 5 events
  };
}

// =============================================
// EXPORTS
// =============================================

export default {
  addLPSnapshot,
  getLPSnapshots,
  clearLPSnapshots,
  calculateLPVelocity,
  calculateLPChange1m,
  determineLPStatus,
  calculateLPScore,
  detectLPEvents,
  getLPEvents,
  generateLPOpportunity,
};
