/**
 * Limit Trader Types (S5)
 * 
 * Type definitions for automated buy/sell limit trading system
 */

// =============================================
// LIMIT ACTION
// =============================================

export type LimitAction = "BUY" | "SELL";

// =============================================
// TRIGGER TYPES
// =============================================

export type TriggerType =
  | "PRICE_BELOW"
  | "PRICE_ABOVE"
  | "MC_BELOW"
  | "MC_ABOVE"
  | "PERCENT_UP"
  | "PERCENT_DOWN"
  | "LP_INCREASE"
  | "LP_DECREASE"
  | "VELOCITY_UP"
  | "VELOCITY_DOWN";

// =============================================
// RULE STATUS
// =============================================

export type RuleStatus = "ACTIVE" | "TRIGGERED" | "DISABLED";

// =============================================
// LIMIT CONDITION
// =============================================

export interface LimitCondition {
  /** Token mint address to monitor */
  tokenMint: string;
  
  /** Trigger type */
  trigger: TriggerType;
  
  /** Threshold value (price, MC, %, LP amount, or velocity) */
  value: number;
  
  /** Base price for percentage calculations (PERCENT_UP/DOWN) */
  basePrice?: number;
  
  /** Base LP for LP change calculations (LP_INCREASE/DECREASE) */
  baseLp?: number;
}

// =============================================
// LIMIT RULE
// =============================================

export interface LimitRule {
  /** Unique rule ID */
  id: string;
  
  /** Rule name/description */
  name: string;
  
  /** Action to take when triggered (BUY or SELL) */
  action: LimitAction;
  
  /** Amount in SOL (for BUY) or percentage (for SELL) */
  amount: number;
  
  /** Condition that triggers this rule */
  condition: LimitCondition;
  
  /** Safety: Require LP locked */
  requireLpLocked: boolean;
  
  /** Safety: Require authority renounced */
  requireAuthorityRenounced: boolean;
  
  /** Safety: Require bonding < 99% */
  requireSafeBonding: boolean;
  
  /** Is rule enabled */
  enabled: boolean;
  
  /** Rule status */
  status: RuleStatus;
  
  /** Created timestamp */
  createdAt: number;
  
  /** Last checked timestamp */
  lastChecked?: number;
  
  /** Last triggered timestamp */
  lastTriggered?: number;
  
  /** Number of times triggered */
  triggerCount: number;
}

// =============================================
// RULE RESULT
// =============================================

export interface RuleResult {
  /** Rule ID that was evaluated */
  ruleId: string;
  
  /** Was the rule triggered */
  triggered: boolean;
  
  /** Reason for trigger or failure */
  reason: string;
  
  /** Timestamp of evaluation */
  timestamp: number;
  
  /** Current token values at time of evaluation */
  tokenData?: {
    price: number;
    marketCap: number;
    lpAmount: number;
    bondingProgress: number;
    velocity?: number;
  };
}

// =============================================
// LIMIT EXECUTION
// =============================================

export interface LimitExecution {
  /** Execution ID */
  id: string;
  
  /** Rule ID that triggered this execution */
  ruleId: string;
  
  /** Token mint address */
  tokenMint: string;
  
  /** Token symbol */
  tokenSymbol: string;
  
  /** Action executed (BUY or SELL) */
  action: LimitAction;
  
  /** Amount in SOL or percentage */
  amount: number;
  
  /** Execution timestamp */
  timestamp: number;
  
  /** Execution status */
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  
  /** Transaction signature */
  signature?: string;
  
  /** Error message if failed */
  error?: string;
  
  /** Token price at execution */
  executionPrice: number;
  
  /** Market cap at execution */
  executionMc: number;
}

// =============================================
// LIMIT TRADER STATE
// =============================================

export interface LimitTraderState {
  /** Active rules */
  rules: LimitRule[];
  
  /** Execution history */
  executions: LimitExecution[];
  
  /** Is monitoring active */
  isMonitoring: boolean;
  
  /** Last update timestamp */
  lastUpdated: number;
}

// =============================================
// EXPORTS
// =============================================

// All types exported via named exports above
