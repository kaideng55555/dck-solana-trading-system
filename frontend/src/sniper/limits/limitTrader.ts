/**
 * Limit Trader Engine (S5)
 * 
 * Core engine for automated buy/sell limit trading
 * Evaluates rules every 1 second and triggers actions
 */

import type {
  LimitRule,
  LimitExecution,
  RuleResult,
  TriggerType,
} from '../../types/limitTypes';
import type { Token } from '../../data/tokenTypes';

// =============================================
// STATE
// =============================================

let rules: LimitRule[] = [];
let executions: LimitExecution[] = [];
let isMonitoring = false;
let monitoringInterval: NodeJS.Timeout | null = null;
let tokenCache: Map<string, Token> = new Map();

// =============================================
// RULE MANAGEMENT
// =============================================

/**
 * Add new rule
 */
export function addRule(rule: LimitRule): void {
  rules.push(rule);
  console.log(`🎯 Limit Trader: Rule added - ${rule.name}`);
}

/**
 * Remove rule by ID
 */
export function removeRule(ruleId: string): void {
  rules = rules.filter((r) => r.id !== ruleId);
  console.log(`🗑️ Limit Trader: Rule removed - ${ruleId}`);
}

/**
 * Update rule
 */
export function updateRule(ruleId: string, updates: Partial<LimitRule>): void {
  const ruleIndex = rules.findIndex((r) => r.id === ruleId);
  if (ruleIndex !== -1) {
    rules[ruleIndex] = { ...rules[ruleIndex], ...updates };
    console.log(`✏️ Limit Trader: Rule updated - ${ruleId}`);
  }
}

/**
 * Enable/disable rule
 */
export function toggleRule(ruleId: string, enabled: boolean): void {
  updateRule(ruleId, { enabled });
}

/**
 * Get all rules
 */
export function getRules(): LimitRule[] {
  return [...rules];
}

/**
 * Get rule by ID
 */
export function getRule(ruleId: string): LimitRule | undefined {
  return rules.find((r) => r.id === ruleId);
}

// =============================================
// EXECUTION HISTORY
// =============================================

/**
 * Get execution history
 */
export function getExecutions(): LimitExecution[] {
  return [...executions];
}

/**
 * Clear execution history
 */
export function clearExecutions(): void {
  executions = [];
  console.log('🗑️ Limit Trader: Execution history cleared');
}

// =============================================
// TOKEN CACHE
// =============================================

/**
 * Update token cache
 */
export function updateTokenCache(tokens: Token[]): void {
  tokens.forEach((token) => {
    tokenCache.set(token.mint, token);
  });
}

/**
 * Get token from cache
 */
export function getTokenFromCache(mint: string): Token | undefined {
  return tokenCache.get(mint);
}

// =============================================
// RULE EVALUATION
// =============================================

/**
 * Evaluate a single rule
 */
export function evaluateRule(rule: LimitRule, token: Token): RuleResult {
  const result: RuleResult = {
    ruleId: rule.id,
    triggered: false,
    reason: '',
    timestamp: Date.now(),
    tokenData: {
      price: token.market.price,
      marketCap: token.market.marketCap,
      lpAmount: token.market.liquidity,
      bondingProgress: token.bonding.bondingProgress,
      velocity: token.bonding.velocityScore,
    },
  };

  // Check if rule is enabled
  if (!rule.enabled) {
    result.reason = 'Rule disabled';
    return result;
  }

  // Check safety conditions
  if (rule.requireLpLocked && !token.lpLocked) {
    result.reason = 'LP not locked';
    return result;
  }

  if (rule.requireAuthorityRenounced && !token.isFullyRenounced) {
    result.reason = 'Authority not renounced';
    return result;
  }

  if (rule.requireSafeBonding && token.bonding.bondingProgress >= 99) {
    result.reason = 'Bonding progress >= 99%';
    return result;
  }

  // Evaluate trigger condition
  const triggered = evaluateTrigger(rule.condition, token);

  if (triggered) {
    result.triggered = true;
    result.reason = getTriggerReason(rule.condition, token);
  } else {
    result.reason = 'Condition not met';
  }

  return result;
}

/**
 * Evaluate trigger condition
 */
function evaluateTrigger(
  condition: LimitRule['condition'],
  token: Token
): boolean {
  const { trigger, value } = condition;

  switch (trigger) {
    case 'PRICE_BELOW':
      return token.market.price < value;

    case 'PRICE_ABOVE':
      return token.market.price > value;

    case 'MC_BELOW':
      return token.market.marketCap < value;

    case 'MC_ABOVE':
      return token.market.marketCap > value;

    case 'PERCENT_UP':
      if (!condition.basePrice) return false;
      const percentUp = ((token.market.price - condition.basePrice) / condition.basePrice) * 100;
      return percentUp >= value;

    case 'PERCENT_DOWN':
      if (!condition.basePrice) return false;
      const percentDown = ((condition.basePrice - token.market.price) / condition.basePrice) * 100;
      return percentDown >= value;

    case 'LP_INCREASE':
      if (!condition.baseLp) return false;
      return token.market.liquidity - condition.baseLp >= value;

    case 'LP_DECREASE':
      if (!condition.baseLp) return false;
      return condition.baseLp - token.market.liquidity >= value;

    case 'VELOCITY_UP':
      return (token.bonding.velocityScore ?? 0) >= value;

    case 'VELOCITY_DOWN':
      return (token.bonding.velocityScore ?? 0) <= value;

    default:
      return false;
  }
}

/**
 * Get trigger reason text
 */
function getTriggerReason(
  condition: LimitRule['condition'],
  token: Token
): string {
  const { trigger, value } = condition;

  switch (trigger) {
    case 'PRICE_BELOW':
      return `Price $${token.market.price.toFixed(8)} below $${value.toFixed(8)}`;
    case 'PRICE_ABOVE':
      return `Price $${token.market.price.toFixed(8)} above $${value.toFixed(8)}`;
    case 'MC_BELOW':
      return `MC $${token.market.marketCap.toLocaleString()} below $${value.toLocaleString()}`;
    case 'MC_ABOVE':
      return `MC $${token.market.marketCap.toLocaleString()} above $${value.toLocaleString()}`;
    case 'PERCENT_UP':
      const percentUp = condition.basePrice
        ? ((token.market.price - condition.basePrice) / condition.basePrice) * 100
        : 0;
      return `Price up ${percentUp.toFixed(2)}% (target: ${value}%)`;
    case 'PERCENT_DOWN':
      const percentDown = condition.basePrice
        ? ((condition.basePrice - token.market.price) / condition.basePrice) * 100
        : 0;
      return `Price down ${percentDown.toFixed(2)}% (target: ${value}%)`;
    case 'LP_INCREASE':
      return `LP increased to ${token.market.liquidity.toFixed(2)} SOL`;
    case 'LP_DECREASE':
      return `LP decreased to ${token.market.liquidity.toFixed(2)} SOL`;
    case 'VELOCITY_UP':
      return `Velocity ${token.bonding.velocityScore ?? 0} >= ${value}`;
    case 'VELOCITY_DOWN':
      return `Velocity ${token.bonding.velocityScore ?? 0} <= ${value}`;
    default:
      return 'Condition met';
  }
}

// =============================================
// RULE EXECUTION
// =============================================

/**
 * Execute rule action
 */
export async function executeRule(rule: LimitRule, token: Token): Promise<void> {
  console.log(`🎯 LIMIT TRIGGERED: ${rule.name}`);
  console.log(`   Token: ${token.metadata.symbol}`);
  console.log(`   Action: ${rule.action}`);
  console.log(`   Amount: ${rule.amount}`);

  const execution: LimitExecution = {
    id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ruleId: rule.id,
    tokenMint: token.mint,
    tokenSymbol: token.metadata.symbol,
    action: rule.action,
    amount: rule.amount,
    timestamp: Date.now(),
    status: 'PENDING',
    executionPrice: token.market.price,
    executionMc: token.market.marketCap,
  };

  executions.push(execution);

  // Keep only last 50 executions
  if (executions.length > 50) {
    executions.shift();
  }

  // Update rule status
  updateRule(rule.id, {
    status: 'TRIGGERED',
    lastTriggered: Date.now(),
    triggerCount: rule.triggerCount + 1,
  });

  try {
    if (rule.action === 'BUY') {
      // TODO: Call openQuickSnipe() when integrated
      console.log(`   📈 BUY: ${rule.amount} SOL of ${token.metadata.symbol}`);
      execution.status = 'SUCCESS';
      execution.signature = 'simulated-buy-tx-' + Date.now();
    } else {
      // TODO: Call SwapEngine for SELL when integrated
      console.log(`   📉 SELL: ${rule.amount}% of ${token.metadata.symbol}`);
      execution.status = 'SUCCESS';
      execution.signature = 'simulated-sell-tx-' + Date.now();
    }
  } catch (error) {
    console.error('❌ Limit execution failed:', error);
    execution.status = 'FAILED';
    execution.error = error instanceof Error ? error.message : 'Unknown error';
  }
}

// =============================================
// MONITORING
// =============================================

/**
 * Start monitoring and evaluating rules
 */
export function startLimitTrader(): void {
  if (isMonitoring) {
    console.log('⚠️ Limit Trader already running');
    return;
  }

  console.log('🎯 Limit Trader: Monitoring started');
  isMonitoring = true;

  // Evaluate all rules every 1 second
  monitoringInterval = setInterval(() => {
    evaluateAllRules();
  }, 1000);
}

/**
 * Stop monitoring
 */
export function stopLimitTrader(): void {
  if (!isMonitoring) {
    console.log('⚠️ Limit Trader not running');
    return;
  }

  console.log('🛑 Limit Trader: Monitoring stopped');
  isMonitoring = false;

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

/**
 * Evaluate all active rules
 */
function evaluateAllRules(): void {
  const activeRules = rules.filter((r) => r.enabled && r.status === 'ACTIVE');

  for (const rule of activeRules) {
    const token = tokenCache.get(rule.condition.tokenMint);

    if (!token) {
      continue; // Token not in cache
    }

    // Update last checked timestamp
    updateRule(rule.id, { lastChecked: Date.now() });

    // Evaluate rule
    const result = evaluateRule(rule, token);

    if (result.triggered) {
      // Execute rule action
      executeRule(rule, token);
    }
  }
}

/**
 * Get monitoring state
 */
export function isLimitTraderRunning(): boolean {
  return isMonitoring;
}

// =============================================
// FORCE TRIGGER
// =============================================

/**
 * Force trigger a specific rule (bypass conditions)
 */
export function forceTriggerRule(ruleId: string): void {
  const rule = getRule(ruleId);
  if (!rule) {
    console.error('❌ Rule not found:', ruleId);
    return;
  }

  const token = tokenCache.get(rule.condition.tokenMint);
  if (!token) {
    console.error('❌ Token not found:', rule.condition.tokenMint);
    return;
  }

  console.log(`⚡ FORCE TRIGGER: ${rule.name}`);
  executeRule(rule, token);
}

// =============================================
// EXPORTS
// =============================================

export default {
  addRule,
  removeRule,
  updateRule,
  toggleRule,
  getRules,
  getRule,
  getExecutions,
  clearExecutions,
  updateTokenCache,
  getTokenFromCache,
  evaluateRule,
  executeRule,
  startLimitTrader,
  stopLimitTrader,
  isLimitTraderRunning,
  forceTriggerRule,
};
