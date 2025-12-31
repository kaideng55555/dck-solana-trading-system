/**
 * useLimitTrader Hook
 * 
 * React hook for limit trading system
 * Manages rules and monitors executions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getRules,
  getExecutions,
  addRule as addRuleEngine,
  removeRule as removeRuleEngine,
  updateRule as updateRuleEngine,
  toggleRule as toggleRuleEngine,
  startLimitTrader,
  stopLimitTrader,
  isLimitTraderRunning,
  updateTokenCache,
  forceTriggerRule as forceTriggerRuleEngine,
} from '../sniper/limits/limitTrader';
import { useGlobalTokenData } from '../data/useGlobalTokenData';
import type { LimitRule, LimitExecution } from '../types/limitTypes';
import { useSFX } from '../sfx/useSFX';

// =============================================
// HOOK
// =============================================

export function useLimitTrader() {
  const [rules, setRules] = useState<LimitRule[]>([]);
  const [executions, setExecutions] = useState<LimitExecution[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const { tokens } = useGlobalTokenData();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { play } = useSFX();
  const lastExecutionCountRef = useRef(0);

  /**
   * Sync state from engine
   */
  const syncState = useCallback(() => {
    const newRules = getRules();
    const newExecutions = getExecutions();
    const newIsMonitoring = isLimitTraderRunning();
    
    // Play sounds for new executions
    if (newExecutions.length > lastExecutionCountRef.current) {
      const latestExecution = newExecutions[newExecutions.length - 1];
      
      if (latestExecution.status === 'SUCCESS') {
        // Play sell for SELL action, buy for BUY action
        if (latestExecution.action === 'SELL') {
          play('sell');
          console.log(`🔊 SFX: Sell sound triggered for ${latestExecution.tokenSymbol}`);
        } else if (latestExecution.action === 'BUY') {
          play('buy');
          console.log(`🔊 SFX: Buy sound triggered for ${latestExecution.tokenSymbol}`);
        }
      } else if (latestExecution.status === 'FAILED') {
        play('rug');
        console.log(`🔊 SFX: Rug sound triggered for failed execution`);
      }
      
      lastExecutionCountRef.current = newExecutions.length;
    }
    
    setRules(newRules);
    setExecutions(newExecutions);
    setIsMonitoring(newIsMonitoring);
    setLastUpdated(Date.now());
  }, [play]);

  /**
   * Add new rule
   */
  const addRule = useCallback(
    (rule: LimitRule) => {
      addRuleEngine(rule);
      syncState();
    },
    [syncState]
  );

  /**
   * Remove rule
   */
  const removeRule = useCallback(
    (ruleId: string) => {
      removeRuleEngine(ruleId);
      syncState();
    },
    [syncState]
  );

  /**
   * Update rule
   */
  const updateRule = useCallback(
    (ruleId: string, updates: Partial<LimitRule>) => {
      updateRuleEngine(ruleId, updates);
      syncState();
    },
    [syncState]
  );

  /**
   * Toggle rule enabled/disabled
   */
  const toggleRule = useCallback(
    (ruleId: string, enabled: boolean) => {
      toggleRuleEngine(ruleId, enabled);
      syncState();
    },
    [syncState]
  );

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    startLimitTrader();
    setIsMonitoring(true);

    // Sync state every 1 second while monitoring
    syncIntervalRef.current = setInterval(() => {
      syncState();
    }, 1000);
  }, [syncState]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    stopLimitTrader();
    setIsMonitoring(false);

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    syncState();
  }, [syncState]);

  /**
   * Force trigger a rule
   */
  const forceTrigger = useCallback(
    (ruleId: string) => {
      forceTriggerRuleEngine(ruleId);
      setTimeout(() => syncState(), 100);
    },
    [syncState]
  );

  /**
   * Get sorted rules (ACTIVE → TRIGGERED → DISABLED)
   */
  const getSortedRules = useCallback((): LimitRule[] => {
    const sorted = [...rules];
    sorted.sort((a, b) => {
      const statusOrder = { ACTIVE: 0, TRIGGERED: 1, DISABLED: 2 };
      const aOrder = statusOrder[a.status] ?? 3;
      const bOrder = statusOrder[b.status] ?? 3;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Within same status, sort by last triggered (most recent first)
      if (a.lastTriggered && b.lastTriggered) {
        return b.lastTriggered - a.lastTriggered;
      }
      
      // Then by created (newest first)
      return b.createdAt - a.createdAt;
    });
    return sorted;
  }, [rules]);

  /**
   * Update token cache from global data
   */
  useEffect(() => {
    updateTokenCache(tokens);
  }, [tokens]);

  /**
   * Initial sync
   */
  useEffect(() => {
    syncState();
  }, [syncState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    rules: getSortedRules(),
    executions,
    isMonitoring,
    lastUpdated,
    addRule,
    removeRule,
    updateRule,
    toggleRule,
    startMonitoring,
    stopMonitoring,
    forceTrigger,
    syncState,
  };
}

export default useLimitTrader;
