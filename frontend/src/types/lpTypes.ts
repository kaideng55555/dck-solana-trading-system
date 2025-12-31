/**
 * LP Event Sniper Types
 * 
 * Type definitions for S4 liquidity pool monitoring and sniping
 */

// =============================================
// LP STATUS ENUM
// =============================================

export type LPStatus =
  | 'NEW_LP'
  | 'RE_ADDED'
  | 'SURGING'
  | 'LOCKED'
  | 'BURNED'
  | 'DRAINING'
  | 'RUGGED'
  | 'STABLE';

// =============================================
// LP SCORE
// =============================================

export interface LPScore {
  /** Overall score (0-100) */
  total: number;
  
  /** Score breakdown */
  breakdown: {
    /** LP amount score (0-30) */
    amount: number;
    
    /** LP velocity score (0-30) */
    velocity: number;
    
    /** LP safety score (0-40) */
    safety: number;
  };
  
  /** Confidence level (0-1) */
  confidence: number;
}

// =============================================
// LP EVENT
// =============================================

export interface LPEvent {
  /** Event ID */
  id: string;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Token mint address */
  tokenMint: string;
  
  /** Event type */
  type: 'LP_ADDED' | 'LP_REMOVED' | 'LP_LOCKED' | 'LP_BURNED' | 'LP_MIGRATED' | 'LP_RUGGED';
  
  /** LP amount before event */
  lpBefore: number;
  
  /** LP amount after event */
  lpAfter: number;
  
  /** LP change amount */
  lpChange: number;
  
  /** Transaction signature */
  signature?: string;
}

// =============================================
// LP SNAPSHOT
// =============================================

export interface LPSnapshot {
  /** Snapshot timestamp */
  timestamp: number;
  
  /** LP amount at snapshot */
  amount: number;
  
  /** Is LP locked */
  isLocked: boolean;
  
  /** Is LP burned */
  isBurned: boolean;
}

// =============================================
// LP OPPORTUNITY
// =============================================

export interface LPOpportunity {
  /** Token mint address */
  mint: string;
  
  /** Token symbol */
  symbol: string;
  
  /** Token name */
  name: string;
  
  /** Current LP amount (SOL) */
  lpAmount: number;
  
  /** LP change in last 1 minute (SOL) */
  lpChange1m: number;
  
  /** LP velocity (%/min) */
  lpVelocity: number;
  
  /** LP status */
  lpStatus: LPStatus;
  
  /** LP score */
  lpScore: LPScore;
  
  /** Is LP safe (locked or burned) */
  isSafe: boolean;
  
  /** Recommendation */
  recommendation: 'BUY_NOW' | 'WAIT' | 'AVOID';
  
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high';
  
  /** Last updated timestamp */
  lastUpdated: number;
  
  /** LP snapshots (last 3) */
  snapshots: LPSnapshot[];
  
  /** Recent LP events */
  events: LPEvent[];
}

// =============================================
// LP MONITORING STATE
// =============================================

export interface LPMonitoringState {
  /** Monitored tokens */
  tokens: Map<string, LPOpportunity>;
  
  /** LP history snapshots */
  snapshots: Map<string, LPSnapshot[]>;
  
  /** Is monitoring active */
  isMonitoring: boolean;
  
  /** Last update timestamp */
  lastUpdated: number;
}

// =============================================
// EXPORTS
// =============================================

// Types are exported via named exports above
