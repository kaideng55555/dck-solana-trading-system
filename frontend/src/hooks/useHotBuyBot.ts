/**
 * useHotBuyBot Hook
 * 
 * React hook for managing Hot Buy Bot state and operations
 * Integrates with global token store and swap system
 */

import { useState, useEffect, useCallback } from 'react';
import {
  startHotBuyBot,
  stopHotBuyBot,
  isHotBuyRunning,
  addRule as addRuleToBot,
  removeRule as removeRuleFromBot,
  getRules,
  getHistory,
  clearHistory as clearBotHistory,
  updateTokenCache,
  getBotState,
} from '../sniper/hotBuyBot';
import { useGlobalTokenData } from '../data/useGlobalTokenData';
import type { HotBuyRule, HotBuyEvent } from '../types/hotBuyTypes';
import { useSFX } from '../sfx/useSFX';

// =============================================
// HOOK
// =============================================

export function useHotBuyBot() {
  const [rules, setRules] = useState<HotBuyRule[]>([]);
  const [history, setHistory] = useState<HotBuyEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
  });

  const { tokens } = useGlobalTokenData();
  const { play } = useSFX();

  /**
   * Sync state with bot engine
   */
  const syncState = useCallback(() => {
    const prevHistory = history;
    const newRules = getRules();
    const newHistory = getHistory();
    const newIsRunning = isHotBuyRunning();
    
    // Check for new trades and play sounds
    if (newHistory.length > prevHistory.length) {
      const latestEvent = newHistory[newHistory.length - 1];
      
      if (latestEvent.status === 'success') {
        play('buy');
        console.log(`🔊 SFX: Buy sound triggered for ${latestEvent.tokenMint}`);
      } else if (latestEvent.status === 'failed') {
        play('rug');
        console.log(`🔊 SFX: Rug sound triggered for failed trade`);
      } else if (latestEvent.status === 'pending') {
        play('alert');
        console.log(`🔊 SFX: Alert sound triggered for trade execution`);
      }
    }
    
    setRules(newRules);
    setHistory(newHistory);
    setIsRunning(newIsRunning);
    
    const botState = getBotState();
    setStats({
      totalTrades: botState.totalTrades,
      successfulTrades: botState.successfulTrades,
      failedTrades: botState.failedTrades,
    });
  }, [history, play]);

  /**
   * Update token cache when tokens change
   */
  useEffect(() => {
    if (tokens.length > 0) {
      updateTokenCache(tokens);
    }
  }, [tokens]);

  /**
   * Sync state periodically while running
   */
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      syncState();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, syncState]);

  /**
   * Add new rule
   */
  const addRule = useCallback((rule: HotBuyRule) => {
    addRuleToBot(rule);
    syncState();
  }, [syncState]);

  /**
   * Remove rule
   */
  const removeRule = useCallback((ruleId: string) => {
    removeRuleFromBot(ruleId);
    syncState();
  }, [syncState]);

  /**
   * Start bot
   */
  const start = useCallback(() => {
    startHotBuyBot();
    syncState();
  }, [syncState]);

  /**
   * Stop bot
   */
  const stop = useCallback(() => {
    stopHotBuyBot();
    syncState();
  }, [syncState]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    clearBotHistory();
    syncState();
  }, [syncState]);

  /**
   * Initial sync
   */
  useEffect(() => {
    syncState();
  }, [syncState]);

  return {
    rules,
    history,
    isRunning,
    stats,
    addRule,
    removeRule,
    start,
    stop,
    clearHistory,
  };
}

export default useHotBuyBot;
