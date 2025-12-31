/**
 * Watchdog Types (S6)
 * 
 * Type definitions for full auto AI sniper system
 * Real-time monitoring and automated action execution
 */

// =============================================
// WATCH CONDITIONS
// =============================================

/**
 * Conditions that trigger watchdog actions
 */
export type WatchCondition =
  | "NEW_POOL"           // New liquidity pool detected
  | "LP_ADDED"           // Liquidity added to pool
  | "LP_SURGE"           // Large LP increase
  | "LP_DRAIN"           // LP being removed
  | "LP_RUG"             // LP pulled to zero
  | "MIGRATION"          // Pool migrating to new address
  | "BONDING_NEAR_GRAD"  // Bonding curve near graduation (90%+)
  | "BONDING_STALL"      // Bonding curve stalled
  | "MC_SPIKE"           // Market cap spike
  | "MC_CRASH"           // Market cap crash
  | "VOLUME_SPIKE"       // Volume surge
  | "VELOCITY_SPIKE"     // High velocity detected
  | "VELOCITY_DROP"      // Velocity dropped suddenly
  | "WHALE_BUY"          // Large buy detected
  | "WHALE_SELL"         // Large sell detected
  | "AUTHORITY_RISK"     // Authority flags detected
  | "SAFETY_FAIL";       // Safety checks failed

// =============================================
// WATCHDOG RULE
// =============================================

/**
 * Watchdog rule for automated monitoring and action
 */
export interface WatchdogRule {
  /** Unique rule ID */
  id: string;
  
  /** Rule name/description */
  name: string;
  
  /** Condition to watch for */
  condition: WatchCondition;
  
  /** Specific token to watch (if undefined, watches all tokens) */
  tokenMint?: string;
  
  /** Action to take when condition triggers */
  action: "BUY" | "SELL" | "ALERT" | "FREEZE";
  
  /** Amount in SOL (for BUY) or percentage (for SELL) */
  amount: number;
  
  /** Use safety checks (LP locked, authority renounced, no red flags) */
  useSafety: boolean;
  
  /** Is rule enabled */
  enabled: boolean;
  
  /** Rule priority (higher = executed first) */
  priority?: number;
  
  /** Cooldown in seconds between triggers */
  cooldown?: number;
  
  /** Last triggered timestamp */
  lastTriggered?: number;
  
  /** Number of times triggered */
  triggerCount?: number;
  
  /** Created timestamp */
  createdAt: number;
}

// =============================================
// WATCHDOG EVENT
// =============================================

/**
 * Event logged when a condition is detected
 */
export interface WatchdogEvent {
  /** Event ID */
  id?: string;
  
  /** Rule that triggered this event */
  ruleId: string;
  
  /** Token mint address */
  tokenMint: string;
  
  /** Token symbol */
  tokenSymbol?: string;
  
  /** Condition that triggered */
  condition: WatchCondition;
  
  /** Event message/description */
  message: string;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Action taken */
  action?: "BUY" | "SELL" | "ALERT" | "FREEZE";
  
  /** Execution status */
  status?: "PENDING" | "SUCCESS" | "FAILED";
  
  /** Transaction signature (if executed) */
  signature?: string;
  
  /** Error message (if failed) */
  error?: string;
}

// =============================================
// WATCHDOG STATUS
// =============================================

/**
 * Watchdog system status
 */
export type WatchdogStatus = "IDLE" | "RUNNING" | "ERROR";

// =============================================
// WATCHDOG SNAPSHOT
// =============================================

/**
 * Token snapshot for watchdog monitoring
 */
export interface WatchdogSnapshot {
  /** Token mint address */
  mint: string;
  
  /** Token symbol */
  symbol?: string;
  
  /** Current price */
  price: number;
  
  /** Market cap */
  marketCap: number;
  
  /** LP amount (SOL) */
  lpAmount: number;
  
  /** LP velocity (%/min) */
  lpVelocity: number;
  
  /** Bonding progress (0-100) */
  bondingProgress: number;
  
  /** Bonding velocity (progress/min) */
  bondingVelocity: number;
  
  /** 24h volume */
  volume24h?: number;
  
  /** Price change 24h (%) */
  priceChange24h?: number;
  
  /** Authority risk detected */
  authorityRisk: boolean;
  
  /** LP locked status */
  lpLocked?: boolean;
  
  /** Is fully renounced */
  isRenounced?: boolean;
  
  /** Last updated timestamp */
  lastUpdated: number;
}

// =============================================
// WATCHDOG STATE
// =============================================

/**
 * Watchdog system state
 */
export interface WatchdogState {
  /** Watchdog status */
  status: WatchdogStatus;
  
  /** Active rules */
  rules: WatchdogRule[];
  
  /** Event history */
  events: WatchdogEvent[];
  
  /** Token snapshots */
  snapshots: Map<string, WatchdogSnapshot[]>;
  
  /** Last update timestamp */
  lastUpdated: number;
  
  /** Total events triggered */
  totalEvents: number;
  
  /** Total successful executions */
  successfulExecutions: number;
  
  /** Total failed executions */
  failedExecutions: number;
}

// =============================================
// WATCHDOG CONFIG
// =============================================

/**
 * Watchdog configuration options
 */
export interface WatchdogConfig {
  /** Monitor interval in milliseconds (default: 1000) */
  monitorInterval?: number;
  
  /** Maximum events to keep in history (default: 100) */
  maxEventHistory?: number;
  
  /** Maximum snapshots per token (default: 10) */
  maxSnapshotsPerToken?: number;
  
  /** Enable console logging */
  enableLogging?: boolean;
  
  /** Auto-start on initialization */
  autoStart?: boolean;
}

// =============================================
// CONDITION THRESHOLDS
// =============================================

/**
 * Thresholds for condition detection
 */
export interface WatchdogThresholds {
  /** LP surge threshold (% increase) */
  lpSurgeThreshold: number; // default: 50%
  
  /** LP drain threshold (% decrease) */
  lpDrainThreshold: number; // default: 30%
  
  /** MC spike threshold (% increase) */
  mcSpikeThreshold: number; // default: 100%
  
  /** MC crash threshold (% decrease) */
  mcCrashThreshold: number; // default: 50%
  
  /** Volume spike threshold (x times average) */
  volumeSpikeMultiplier: number; // default: 5x
  
  /** Velocity spike threshold */
  velocitySpikeThreshold: number; // default: 50
  
  /** Velocity drop threshold */
  velocityDropThreshold: number; // default: -30
  
  /** Whale buy threshold (SOL) */
  whaleBuyThreshold: number; // default: 10 SOL
  
  /** Whale sell threshold (SOL) */
  whaleSellThreshold: number; // default: 10 SOL
  
  /** Bonding near graduation threshold (%) */
  bondingNearGradThreshold: number; // default: 90%
}

// =============================================
// EXPORTS
// =============================================

// All types exported via named exports above
