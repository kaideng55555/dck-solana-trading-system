/**
 * Hot Buy Bot Types
 * 
 * Type definitions for S3 automated trading rules
 */

// =============================================
// RULE TYPES
// =============================================

export type HotBuyRuleType =
  | 'marketCapBelow'
  | 'marketCapAbove'
  | 'priceBelow'
  | 'priceAbove'
  | 'velocityAbove'
  | 'accelerationAbove'
  | 'etaBelow'
  | 'volumeSpike'
  | 'bigBuyerDetected';

export interface HotBuySafetySettings {
  /** Check LP is above minimum threshold */
  lpSafe: boolean;
  
  /** Check authority is safe (no mint/freeze) */
  authoritySafe: boolean;
  
  /** Check token is not flagged as rug */
  rugSafe: boolean;
  
  /** Minimum confidence score (0-100) */
  minConfidence: number;
  
  /** Minimum token age in seconds */
  minAge: number;
  
  /** Maximum price impact allowed (%) */
  maxPriceImpact: number;
}

export interface HotBuyRule {
  /** Unique rule ID */
  id: string;
  
  /** Rule type */
  type: HotBuyRuleType;
  
  /** Threshold value for rule evaluation */
  threshold: number;
  
  /** Cooldown between rule fires (seconds) */
  cooldown: number;
  
  /** Maximum trades per minute */
  maxTradesPerMinute: number;
  
  /** Buy amount in SOL */
  buyAmount: number;
  
  /** Slippage tolerance (%) */
  slippage: number;
  
  /** Priority fee level */
  priorityFee: 'low' | 'medium' | 'high' | 'turbo';
  
  /** Enable Jito MEV protection */
  jitoEnabled: boolean;
  
  /** Safety settings */
  safety: HotBuySafetySettings;
  
  /** Rule enabled/disabled */
  enabled: boolean;
  
  /** Rule creation timestamp */
  createdAt: number;
  
  /** Last trigger timestamp */
  lastTriggered?: number;
}

// =============================================
// EVENT TYPES
// =============================================

export interface HotBuyEvent {
  /** Event ID */
  id: string;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Token mint address */
  tokenMint: string;
  
  /** Token symbol */
  tokenSymbol: string;
  
  /** Token name */
  tokenName: string;
  
  /** Token price at execution */
  price: number;
  
  /** Market cap at execution */
  marketCap: number;
  
  /** Rule that triggered this event */
  ruleId: string;
  
  /** Rule type that triggered */
  triggerType: HotBuyRuleType;
  
  /** Transaction signature */
  signature?: string;
  
  /** Execution status */
  status: 'pending' | 'success' | 'failed';
  
  /** Error message if failed */
  error?: string;
  
  /** Buy amount in SOL */
  buyAmount: number;
  
  /** Actual slippage used (%) */
  slippage: number;
}

// =============================================
// BOT STATE
// =============================================

export interface HotBuyBotState {
  /** Bot running status */
  isRunning: boolean;
  
  /** Active rules */
  rules: HotBuyRule[];
  
  /** Event history */
  history: HotBuyEvent[];
  
  /** Start timestamp */
  startedAt?: number;
  
  /** Total trades executed */
  totalTrades: number;
  
  /** Successful trades */
  successfulTrades: number;
  
  /** Failed trades */
  failedTrades: number;
}

// =============================================
// EXPORTS
// =============================================

// Types are exported via named exports above
