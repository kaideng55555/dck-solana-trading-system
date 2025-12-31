/**
 * useLimitTrader Hook
 * 
 * React hook for limit trading system
 * Manages rules, evaluates conditions, and tracks execution logs
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getRules,
  addRule as addRuleEngine,
  removeRule as removeRuleEngine,
  updateRule as updateRuleEngine,
  startLimitTrader,
  stopLimitTrader,
  isLimitTraderRunning,
  updateTokenCache,
  evaluateRule,
  getTokenFromCache,
} from './limitTrader';
import { useGlobalTokenData } from '../../data/useGlobalTokenData';
import type { LimitRule, RuleResult } from '../../types/limitTypes';

// =============================================
// HOOK
// =============================================

export function useLimitTrader() {
  const [rules, setRules] = useState<LimitRule[]>([]);
  const [logs, setLogs] = useState<RuleResult[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [isMonitoring, setIsMonitoring] = useState(false);

  const { tokens } = useGlobalTokenData();
  const evaluationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Add new rule
   */
  const addRule = useCallback((rule: LimitRule) => {
    addRuleEngine(rule);
    syncRules();
  }, []);

  /**
   * Remove rule
   */
  const removeRule = useCallback((ruleId: string) => {
    removeRuleEngine(ruleId);
    syncRules();
  }, []);

  /**
   * Update rule
   */
  const updateRule = useCallback((ruleId: string, updates: Partial<LimitRule>) => {
    updateRuleEngine(ruleId, updates);
    syncRules();
  }, []);

  /**
   * Start limit monitoring
   */
  const startLimits = useCallback(() => {
    if (isMonitoring) {
      console.log('⚠️ Limit monitoring already running');
      return;
    }

    console.log('🎯 Limit Trader: Starting monitoring');
    startLimitTrader();
    setIsMonitoring(true);

    // Evaluate rules every 1 second
    evaluationIntervalRef.current = setInterval(() => {
      evaluateAllRules();
    }, 1000);
  }, [isMonitoring]);

  /**
   * Stop limit monitoring
   */
  const stopLimits = useCallback(() => {
    if (!isMonitoring) {
      console.log('⚠️ Limit monitoring not running');
      return;
    }

    console.log('🛑 Limit Trader: Stopping monitoring');
    stopLimitTrader();
    setIsMonitoring(false);

    if (evaluationIntervalRef.current) {
      clearInterval(evaluationIntervalRef.current);
      evaluationIntervalRef.current = null;
    }
  }, [isMonitoring]);

  /**
   * Sync rules from engine
   */
  const syncRules = useCallback(() => {
    const currentRules = getRules();
    
    // Sort rules: ACTIVE → TRIGGERED → DISABLED
    const sorted = [...currentRules].sort((a, b) => {
      const statusOrder = { ACTIVE: 0, TRIGGERED: 1, DISABLED: 2 };
      const aOrder = statusOrder[a.status] ?? 3;
      const bOrder = statusOrder[b.status] ?? 3;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // Within same status, sort by last triggered (most recent first)
      if (a.lastTriggered && b.lastTriggered) {
        return b.lastTriggered - a.lastTriggered;
      }

      // Then by created (newest first)
      return b.createdAt - a.createdAt;
    });

    setRules(sorted);
    setLastUpdated(Date.now());
  }, []);

  /**
   * Evaluate all rules and store logs
   */
  const evaluateAllRules = useCallback(() => {
    const currentRules = getRules();
    const newLogs: RuleResult[] = [];

    for (const rule of currentRules) {
      // Only evaluate enabled rules
      if (!rule.enabled) continue;

      // Get token from cache
      const token = getTokenFromCache(rule.condition.tokenMint);
      if (!token) continue;

      // Evaluate rule
      const result = evaluateRule(rule, token);
      newLogs.push(result);

      // Log triggered rules
      if (result.triggered) {
        console.log(`🎯 Rule triggered: ${rule.name}`);
        console.log(`   Reason: ${result.reason}`);
      }
    }

    // Add new logs (keep last 100)
    if (newLogs.length > 0) {
      setLogs((prevLogs) => {
        const updated = [...prevLogs, ...newLogs];
        return updated.slice(-100); // Keep only last 100 logs
      });
    }

    // Sync rules to get updated status
    syncRules();
  }, [syncRules]);

  /**
   * Update token cache when global data changes
   */
  useEffect(() => {
    updateTokenCache(tokens);
  }, [tokens]);

  /**
   * Sync rules on mount
   */
  useEffect(() => {
    syncRules();
    setIsMonitoring(isLimitTraderRunning());
  }, [syncRules]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (evaluationIntervalRef.current) {
        clearInterval(evaluationIntervalRef.current);
      }
    };
  }, []);

  return {
    rules,
    logs,
    lastUpdated,
    isMonitoring,
    addRule,
    removeRule,
    updateRule,
    startLimits,
    stopLimits,
  };
}

export default useLimitTrader;
