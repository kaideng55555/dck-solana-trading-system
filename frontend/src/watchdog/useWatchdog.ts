/**
 * useWatchdog Hook (S6)
 * 
 * React hook wrapper for Watchdog Engine
 * Provides state management and real-time monitoring
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { WatchdogEngine } from './watchdogEngine';
import { useGlobalTokenData } from '../data/useGlobalTokenData';
import type {
  WatchdogRule,
  WatchdogSnapshot,
  WatchdogEvent,
  WatchdogStatus,
} from './watchdogTypes';

// =============================================
// HOOK
// =============================================

export function useWatchdog() {
  const engineRef = useRef(new WatchdogEngine());
  const [events, setEvents] = useState<WatchdogEvent[]>([]);
  const [rules, setRules] = useState<WatchdogRule[]>([]);
  const [status, setStatus] = useState<WatchdogStatus>('IDLE');
  const [lastTick, setLastTick] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { tokens } = useGlobalTokenData();

  /**
   * Sync rules from engine
   */
  const syncRules = useCallback(() => {
    setRules(engineRef.current.getRules());
  }, []);

  /**
   * Start watchdog monitoring
   */
  const start = useCallback(() => {
    if (status === 'RUNNING') {
      console.log('⚠️ Watchdog already running');
      return;
    }

    console.log('🐕 Watchdog: Starting monitoring');
    setStatus('RUNNING');

    // Evaluation loop - runs every 1 second
    intervalRef.current = setInterval(() => {
      try {
        // Evaluate all rules
        engineRef.current.evaluate();

        // Get new events
        const newEvents = engineRef.current.getEvents();
        if (newEvents.length > 0) {
          setEvents((prev) => {
            const combined = [...prev, ...newEvents];
            // Keep only last 100 events
            return combined.slice(-100);
          });

          // Clear events from engine
          engineRef.current.clearEvents();
        }

        // Update last tick
        setLastTick(Date.now());
      } catch (error) {
        console.error('❌ Watchdog evaluation error:', error);
        setStatus('ERROR');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);
  }, [status]);

  /**
   * Stop watchdog monitoring
   */
  const stop = useCallback(() => {
    if (status !== 'RUNNING') {
      console.log('⚠️ Watchdog not running');
      return;
    }

    console.log('🛑 Watchdog: Stopping monitoring');
    setStatus('IDLE');

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  /**
   * Add a new rule
   */
  const addRule = useCallback(
    (rule: WatchdogRule) => {
      engineRef.current.addRule(rule);
      syncRules();
    },
    [syncRules]
  );

  /**
   * Remove a rule
   */
  const removeRule = useCallback(
    (ruleId: string) => {
      engineRef.current.removeRule(ruleId);
      syncRules();
    },
    [syncRules]
  );

  /**
   * Update a rule
   */
  const updateRule = useCallback(
    (rule: WatchdogRule) => {
      engineRef.current.updateRule(rule);
      syncRules();
    },
    [syncRules]
  );

  /**
   * Toggle rule enabled/disabled
   */
  const toggleRule = useCallback(
    (ruleId: string, enabled: boolean) => {
      const rule = engineRef.current.getRule(ruleId);
      if (rule) {
        rule.enabled = enabled;
        engineRef.current.updateRule(rule);
        syncRules();
      }
    },
    [syncRules]
  );

  /**
   * Update token snapshot manually
   */
  const updateSnapshot = useCallback((snapshot: WatchdogSnapshot) => {
    engineRef.current.updateSnapshot(snapshot);
  }, []);

  /**
   * Clear all events
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
    engineRef.current.clearEvents();
  }, []);

  /**
   * Get stats
   */
  const getStats = useCallback(() => {
    return engineRef.current.getStats();
  }, []);

  /**
   * Auto-update snapshots from global token data
   */
  useEffect(() => {
    if (status !== 'RUNNING') return;

    // Convert tokens to snapshots
    for (const token of tokens) {
      const snapshot: WatchdogSnapshot = {
        mint: token.mint,
        symbol: token.metadata.symbol,
        price: token.market.price,
        marketCap: token.market.marketCap,
        lpAmount: token.market.liquidity,
        lpVelocity: 0, // TODO: Calculate from LP history
        bondingProgress: token.bonding.bondingProgress,
        bondingVelocity: token.bonding.velocityScore ?? 0,
        volume24h: token.market.volume24h,
        priceChange24h: token.market.priceChange24h,
        authorityRisk: !token.isFullyRenounced || token.suspiciousAuthority,
        lpLocked: token.lpLocked,
        isRenounced: token.isFullyRenounced,
        lastUpdated: Date.now(),
      };

      engineRef.current.updateSnapshot(snapshot);
    }
  }, [tokens, status]);

  /**
   * Initial sync
   */
  useEffect(() => {
    syncRules();
  }, [syncRules]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    status,
    events,
    rules,
    lastTick,

    // Actions
    start,
    stop,
    addRule,
    removeRule,
    updateRule,
    toggleRule,
    updateSnapshot,
    clearEvents,
    getStats,
  };
}

export default useWatchdog;
