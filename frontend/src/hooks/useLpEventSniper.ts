/**
 * useLpEventSniper Hook
 * 
 * React hook for LP event monitoring and snipe opportunity generation
 * Tracks liquidity changes and generates scored opportunities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  addLPSnapshot,
  generateLPOpportunity,
  detectLPEvents,
  clearLPSnapshots,
} from '../sniper/lp/lpEventSniper';
import { useGlobalTokenData } from '../data/useGlobalTokenData';
import type { LPOpportunity } from '../types/lpTypes';
import { useSFX } from '../sfx/useSFX';

// =============================================
// HOOK
// =============================================

export function useLpEventSniper() {
  const [lpOpportunities, setLpOpportunities] = useState<LPOpportunity[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const { tokens } = useGlobalTokenData();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const monitoredMintsRef = useRef<Set<string>>(new Set());
  const { play } = useSFX();
  const lastAlertRef = useRef<Set<string>>(new Set());

  /**
   * Update opportunities from token data
   */
  const updateOpportunities = useCallback(() => {
    const opportunities: LPOpportunity[] = [];

    // Process all tokens
    for (const token of tokens) {
      // Add snapshot
      addLPSnapshot(token);

      // Detect events
      detectLPEvents(token.mint, []);

      // Generate opportunity
      const opportunity = generateLPOpportunity(token);
      if (opportunity) {
        opportunities.push(opportunity);
        monitoredMintsRef.current.add(token.mint);
      }
    }

    // Sort by LP score (highest first)
    opportunities.sort((a, b) => b.lpScore.total - a.lpScore.total);

    // Play sound for new high-scoring opportunities
    opportunities.forEach(opp => {
      // Alert for high-scoring opportunities (score >= 70)
      if (opp.lpScore.total >= 70 && !lastAlertRef.current.has(opp.mint)) {
        play('sniperReady');
        lastAlertRef.current.add(opp.mint);
        console.log(`💧 LP EVENT ALERT: ${opp.symbol} - Score: ${opp.lpScore.total}`);
      }
    });

    // Clean up old alerts
    const currentMints = new Set(opportunities.map(o => o.mint));
    lastAlertRef.current.forEach(mint => {
      if (!currentMints.has(mint)) {
        lastAlertRef.current.delete(mint);
      }
    });

    setLpOpportunities(opportunities);
    setLastUpdated(Date.now());
  }, [tokens, play]);

  /**
   * Start monitoring LP events
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    console.log('💧 LP Event Sniper: Monitoring started');
    setIsMonitoring(true);

    // Initial update
    updateOpportunities();

    // Update every 1 second
    intervalRef.current = setInterval(() => {
      updateOpportunities();
    }, 1000);
  }, [isMonitoring, updateOpportunities]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    console.log('🛑 LP Event Sniper: Monitoring stopped');
    setIsMonitoring(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isMonitoring]);

  /**
   * Force snipe a specific token
   */
  const forceSnipe = useCallback((mint: string) => {
    const opportunity = lpOpportunities.find((opp) => opp.mint === mint);

    if (!opportunity) {
      console.error('❌ Token not found in LP opportunities:', mint);
      return;
    }

    console.log(`💧 FORCE LP SNIPE: ${opportunity.symbol} (${mint})`);
    console.log(`   LP Amount: ${opportunity.lpAmount} SOL`);
    console.log(`   LP Status: ${opportunity.lpStatus}`);
    console.log(`   LP Score: ${opportunity.lpScore.total}/100`);
    console.log(`   Safe: ${opportunity.isSafe ? 'YES' : 'NO'}`);

    // This will be picked up by the SnipeButton component
    return opportunity;
  }, [lpOpportunities]);

  /**
   * Clear all monitoring data
   */
  const clearAllData = useCallback(() => {
    monitoredMintsRef.current.forEach((mint) => {
      clearLPSnapshots(mint);
    });
    monitoredMintsRef.current.clear();
    setLpOpportunities([]);
    setLastUpdated(Date.now());
    console.log('🗑️ LP monitoring data cleared');
  }, []);

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
    lpOpportunities,
    isMonitoring,
    lastUpdated,
    startMonitoring,
    stopMonitoring,
    forceSnipe,
    clearAllData,
  };
}

export default useLpEventSniper;
