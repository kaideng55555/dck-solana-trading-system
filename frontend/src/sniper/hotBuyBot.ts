/**
 * Hot Buy Bot Engine (S3)
 * 
 * Automated trading bot that executes buys based on configurable rules
 * Monitors token metrics and triggers purchases when conditions are met
 */

import type {
  HotBuyRule,
  HotBuyEvent,
  HotBuyBotState,
  HotBuyRuleType,
} from '../types/hotBuyTypes';
import type { Token } from '../data/tokenTypes';

// =============================================
// BOT STATE
// =============================================

let botState: HotBuyBotState = {
  isRunning: false,
  rules: [],
  history: [],
  totalTrades: 0,
  successfulTrades: 0,
  failedTrades: 0,
};

let monitoringInterval: NodeJS.Timeout | null = null;
let tokenCache: Map<string, Token> = new Map();

// =============================================
// SAFETY CHECKS
// =============================================

/**
 * Validate token safety based on rule settings
 */
function isTokenSafe(token: Token, rule: HotBuyRule): boolean {
  const { safety } = rule;

  // Check LP threshold (minimum 5 SOL)
  if (safety.lpSafe) {
    const liquidity = token.market.liquidity ?? 0;
    if (liquidity < 5) {
      console.log(`⚠️ LP too low: ${liquidity} SOL`);
      return false;
    }
  }

  // Check authority safety (no mint/freeze authority)
  if (safety.authoritySafe) {
    if (token.authorities?.mintAuthority || token.authorities?.freezeAuthority) {
      console.log(`⚠️ Unsafe authorities detected`);
      return false;
    }
  }

  // Check rug flags
  if (safety.rugSafe) {
    if (!token.isAlive) {
      console.log(`⚠️ Token flagged as dead`);
      return false;
    }
  }

  // Check confidence threshold (use default 50% if not available)
  const confidence = 50; // Default confidence if not tracked
  if (confidence < safety.minConfidence) {
    console.log(`⚠️ Confidence too low: ${confidence}% < ${safety.minConfidence}%`);
    return false;
  }

  // Check minimum age
  const age = (Date.now() - token.createdAt) / 1000; // seconds
  if (age < safety.minAge) {
    console.log(`⚠️ Token too young: ${age}s < ${safety.minAge}s`);
    return false;
  }

  return true;
}

/**
 * Check if rule is on cooldown
 */
function isRuleCoolingDown(rule: HotBuyRule): boolean {
  if (!rule.lastTriggered) return false;

  const timeSinceLastTrigger = (Date.now() - rule.lastTriggered) / 1000;
  return timeSinceLastTrigger < rule.cooldown;
}

/**
 * Check if rate limit is exceeded
 */
function isRateLimited(rule: HotBuyRule): boolean {
  const oneMinuteAgo = Date.now() - 60000;
  const recentTrades = botState.history.filter(
    (event) => event.ruleId === rule.id && event.timestamp > oneMinuteAgo
  );

  return recentTrades.length >= rule.maxTradesPerMinute;
}

// =============================================
// RULE EVALUATION
// =============================================

/**
 * Evaluate single rule against token
 */
function evaluateRule(token: Token, rule: HotBuyRule): boolean {
  if (!rule.enabled) return false;

  const { type, threshold } = rule;
  const marketCap = token.market.marketCap ?? 0;
  const price = token.market.price ?? 0;
  const volume24h = token.market.volume24h ?? 0;

  switch (type) {
    case 'marketCapBelow':
      return marketCap < threshold;

    case 'marketCapAbove':
      return marketCap > threshold;

    case 'priceBelow':
      return price < threshold;

    case 'priceAbove':
      return price > threshold;

    case 'velocityAbove':
      // Velocity from bonding curve data (default 0)
      const velocity = 0; // Would need to track via BondingCurvePredictor
      return velocity > threshold;

    case 'accelerationAbove':
      // Acceleration from bonding curve data (default 0)
      const acceleration = 0; // Would need to track via BondingCurvePredictor
      return acceleration > threshold;

    case 'etaBelow':
      // ETA to graduation (calculate from bonding progress)
      const progress = token.bonding?.bondingProgress ?? 0;
      const remaining = 100 - progress;
      const etaMinutes = remaining > 0 ? remaining * 2 : Infinity; // Rough estimate
      return etaMinutes < threshold;

    case 'volumeSpike':
      // Volume spike detection (compare current to baseline)
      const avgVolume = volume24h / 24; // Hourly average
      return volume24h > threshold * avgVolume;

    case 'bigBuyerDetected':
      // Big buyer detection (would need transaction monitoring)
      const lastBuyAmount = 0; // Would need real-time transaction tracking
      return lastBuyAmount > threshold;

    default:
      return false;
  }
}

/**
 * Evaluate all rules against all tokens
 */
export function evaluateRules(): void {
  if (!botState.isRunning) return;

  const tokens = Array.from(tokenCache.values());

  for (const rule of botState.rules) {
    // Skip if rule is on cooldown or rate limited
    if (isRuleCoolingDown(rule) || isRateLimited(rule)) {
      continue;
    }

    // Evaluate rule against all tokens
    for (const token of tokens) {
      // Safety checks first
      if (!isTokenSafe(token, rule)) {
        continue;
      }

      // Evaluate rule condition
      if (evaluateRule(token, rule)) {
        console.log(`🎯 Rule "${rule.type}" triggered for ${token.metadata.symbol}`);
        executeHotBuy(token, rule);
        
        // Update last triggered timestamp
        rule.lastTriggered = Date.now();
        
        // Break after first match to prevent multiple buys
        break;
      }
    }
  }
}

// =============================================
// EXECUTION
// =============================================

/**
 * Execute hot buy for token
 */
export async function executeHotBuy(token: Token, rule: HotBuyRule): Promise<void> {
  const eventId = `hotbuy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const event: HotBuyEvent = {
    id: eventId,
    timestamp: Date.now(),
    tokenMint: token.mint,
    tokenSymbol: token.metadata.symbol,
    tokenName: token.metadata.name,
    price: token.market.price,
    marketCap: token.market.marketCap,
    ruleId: rule.id,
    triggerType: rule.type,
    status: 'pending',
    buyAmount: rule.buyAmount,
    slippage: rule.slippage,
  };

  // Add to history
  botState.history.unshift(event);
  botState.totalTrades++;

  console.log(`⚡ HOT BUY EXECUTING:`);
  console.log(`   Token: ${token.metadata.symbol} (${token.mint})`);
  console.log(`   Rule: ${rule.type} (threshold: ${rule.threshold})`);
  console.log(`   Amount: ${rule.buyAmount} SOL`);
  console.log(`   Slippage: ${rule.slippage}%`);

  try {
    // NOTE: Integration with swap system
    // This would call: openQuickSnipe(token.mint, "hotbuy")
    // With settings: slippage, priorityFee: "turbo", jitoEnabled: true
    
    // Simulate execution (replace with actual swap call)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update event status
    event.status = 'success';
    event.signature = `sim-tx-${Math.random().toString(36).substr(2, 9)}`;
    botState.successfulTrades++;

    console.log(`✅ HOT BUY SUCCESS: ${event.signature}`);
  } catch (error) {
    event.status = 'failed';
    event.error = error instanceof Error ? error.message : 'Unknown error';
    botState.failedTrades++;

    console.error(`❌ HOT BUY FAILED:`, event.error);
  }
}

// =============================================
// BOT CONTROL
// =============================================

/**
 * Start hot buy bot monitoring
 */
export function startHotBuyBot(): void {
  if (botState.isRunning) {
    console.warn('⚠️ Hot Buy Bot already running');
    return;
  }

  console.log('🚀 Hot Buy Bot STARTED');
  botState.isRunning = true;
  botState.startedAt = Date.now();

  // Monitor every 1 second
  monitoringInterval = setInterval(() => {
    evaluateRules();
  }, 1000);
}

/**
 * Stop hot buy bot monitoring
 */
export function stopHotBuyBot(): void {
  if (!botState.isRunning) {
    console.warn('⚠️ Hot Buy Bot not running');
    return;
  }

  console.log('🛑 Hot Buy Bot STOPPED');
  botState.isRunning = false;
  botState.startedAt = undefined;

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

/**
 * Check if bot is running
 */
export function isHotBuyRunning(): boolean {
  return botState.isRunning;
}

// =============================================
// RULE MANAGEMENT
// =============================================

/**
 * Add new rule
 */
export function addRule(rule: HotBuyRule): void {
  botState.rules.push(rule);
  console.log(`➕ Rule added: ${rule.type} (${rule.id})`);
}

/**
 * Remove rule by ID
 */
export function removeRule(ruleId: string): void {
  const index = botState.rules.findIndex((r) => r.id === ruleId);
  
  if (index !== -1) {
    const rule = botState.rules[index];
    botState.rules.splice(index, 1);
    console.log(`➖ Rule removed: ${rule.type} (${ruleId})`);
  }
}

/**
 * Get all rules
 */
export function getRules(): HotBuyRule[] {
  return botState.rules;
}

/**
 * Update rule
 */
export function updateRule(ruleId: string, updates: Partial<HotBuyRule>): void {
  const rule = botState.rules.find((r) => r.id === ruleId);
  
  if (rule) {
    Object.assign(rule, updates);
    console.log(`🔄 Rule updated: ${rule.type} (${ruleId})`);
  }
}

// =============================================
// HISTORY & STATS
// =============================================

/**
 * Get event history
 */
export function getHistory(): HotBuyEvent[] {
  return botState.history;
}

/**
 * Clear history
 */
export function clearHistory(): void {
  botState.history = [];
  botState.totalTrades = 0;
  botState.successfulTrades = 0;
  botState.failedTrades = 0;
  console.log('🗑️ History cleared');
}

/**
 * Get bot state
 */
export function getBotState(): HotBuyBotState {
  return botState;
}

// =============================================
// TOKEN MANAGEMENT
// =============================================

/**
 * Update token cache for evaluation
 */
export function updateTokenCache(tokens: Token[]): void {
  tokenCache.clear();
  tokens.forEach((token) => {
    tokenCache.set(token.mint, token);
  });
}

/**
 * Add single token to cache
 */
export function addTokenToCache(token: Token): void {
  tokenCache.set(token.mint, token);
}

/**
 * Remove token from cache
 */
export function removeTokenFromCache(mint: string): void {
  tokenCache.delete(mint);
}

// =============================================
// EXPORTS
// =============================================

export default {
  startHotBuyBot,
  stopHotBuyBot,
  isHotBuyRunning,
  addRule,
  removeRule,
  getRules,
  updateRule,
  evaluateRules,
  executeHotBuy,
  getHistory,
  clearHistory,
  getBotState,
  updateTokenCache,
  addTokenToCache,
  removeTokenFromCache,
};
