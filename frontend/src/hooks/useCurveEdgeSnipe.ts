/**
 * useCurveEdgeSnipe Hook
 * 
 * Monitors tokens with bonding progress 90-100%
 * Tracks velocity and acceleration using BondingCurvePredictor
 * Generates snipe opportunities with detailed metrics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BondingCurvePredictor, type CurvePrediction } from '../sniper/bondingCurvePredictor';
import { getSnipeScore } from '../sniper/curveEdgeSniper';
import type { Token } from '../data/tokenTypes';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

export interface CurveEdgeOpportunity {
  /** Token mint address */
  mint: string;
  
  /** Token symbol */
  symbol: string;
  
  /** Token name */
  name: string;
  
  /** Current bonding progress (0-100) */
  progress: number;
  
  /** Velocity (% per minute) */
  velocity: number;
  
  /** Acceleration (change in velocity) */
  acceleration: number;
  
  /** Confidence score (0-100) */
  confidence: number;
  
  /** Estimated time to graduation (minutes) */
  etaMinutes: number | null;
  
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high';
  
  /** Recommendation */
  recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR' | 'AVOID';
  
  /** Snipe score (0-100) */
  snipeScore: number;
  
  /** Market cap */
  marketCap: number;
  
  /** Last updated timestamp */
  lastUpdated: number;
}

// Helper type to match BondingCurvePredictor expected format
interface TokenSnapshot {
  mint: string;
  symbol: string;
  name: string;
  bonding?: {
    progress?: number;
  };
  marketCap?: number;
}

// =============================================
// HOOK
// =============================================

export function useCurveEdgeSnipe() {
  const [opportunities, setOpportunities] = useState<CurveEdgeOpportunity[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  
  const predictorRef = useRef(new BondingCurvePredictor());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { play } = useSFX();
  const lastAlertRef = useRef<Set<string>>(new Set());
  const tokensRef = useRef<Map<string, Token>>(new Map());

  /**
   * Start monitoring curve edge opportunities
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    console.log('🎯 Curve Edge Snipe: Monitoring started');
    setIsMonitoring(true);
    
    // Initial update
    updateOpportunities();
    
    // Set up auto-refresh every 1 second
    intervalRef.current = setInterval(() => {
      updateOpportunities();
    }, 1000);
  }, [isMonitoring]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    console.log('🛑 Curve Edge Snipe: Monitoring stopped');
    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isMonitoring]);

  /**
   * Update opportunities from current token data
   */
  const updateOpportunities = useCallback(() => {
    const predictor = predictorRef.current;
    const tokens = Array.from(tokensRef.current.values());
    
    // Filter tokens in 90-100% range
    const curveTokens = tokens.filter(token => {
      const progress = token.bonding?.bondingProgress ?? 0;
      return progress >= 90 && progress < 100;
    });

    // Add snapshots to predictor (convert Token to TokenSnapshot format)
    curveTokens.forEach(token => {
      const snapshot: TokenSnapshot = {
        mint: token.mint,
        symbol: token.metadata.symbol,
        name: token.metadata.name,
        bonding: {
          progress: token.bonding?.bondingProgress,
        },
        marketCap: token.market.marketCap,
      };
      predictor.addSnapshot(snapshot as any);
    });

    // Generate opportunities
    const newOpportunities: CurveEdgeOpportunity[] = [];
    
    curveTokens.forEach(token => {
      const prediction = predictor.predict(token.mint);
      
      if (!prediction) return;
      
      const snipeScore = getSnipeScore(prediction);
      const progress = token.bonding?.bondingProgress ?? 0;
      
      newOpportunities.push({
        mint: token.mint,
        symbol: token.metadata.symbol || 'UNKNOWN',
        name: token.metadata.name || 'Unknown Token',
        progress,
        velocity: prediction.velocity,
        acceleration: prediction.acceleration,
        confidence: prediction.confidence,
        etaMinutes: prediction.etaMinutes,
        riskLevel: prediction.riskLevel,
        recommendation: prediction.recommendation,
        snipeScore,
        marketCap: token.market.marketCap ?? 0,
        lastUpdated: Date.now(),
      });
    });

    // Sort by snipe score descending
    newOpportunities.sort((a, b) => b.snipeScore - a.snipeScore);

    // Play sound for new high-confidence opportunities
    newOpportunities.forEach(opp => {
      // Only alert for high-confidence BUY_NOW recommendations
      if (opp.recommendation === 'BUY_NOW' && opp.confidence >= 75 && !lastAlertRef.current.has(opp.mint)) {
        play('sniperReady');
        lastAlertRef.current.add(opp.mint);
        console.log(`🎯 CURVE EDGE ALERT: ${opp.symbol} - Score: ${opp.snipeScore}`);
      }
    });

    // Clean up old alerts (remove tokens no longer in opportunities)
    const currentMints = new Set(newOpportunities.map(o => o.mint));
    lastAlertRef.current.forEach(mint => {
      if (!currentMints.has(mint)) {
        lastAlertRef.current.delete(mint);
      }
    });

    setOpportunities(newOpportunities);
    setLastUpdated(Date.now());
  }, []);

  /**
   * Force snipe a specific token
   */
  const forceSnipe = useCallback((mint: string) => {
    const opportunity = opportunities.find(opp => opp.mint === mint);
    
    if (!opportunity) {
      console.error('❌ Token not found in opportunities:', mint);
      return;
    }
    
    console.log(`⚡ FORCE SNIPE: ${opportunity.symbol} (${mint})`);
    console.log(`   Progress: ${opportunity.progress.toFixed(2)}%`);
    console.log(`   Velocity: ${opportunity.velocity.toFixed(2)}%/min`);
    console.log(`   Score: ${opportunity.snipeScore}/100`);
    
    // This will be picked up by the SnipeButton component
    return opportunity;
  }, [opportunities]);

  /**
   * Add token to monitoring (called by live feed)
   */
  const addToken = useCallback((token: Token) => {
    tokensRef.current.set(token.mint, token);
  }, []);

  /**
   * Update existing token data
   */
  const updateToken = useCallback((token: Token) => {
    tokensRef.current.set(token.mint, token);
  }, []);

  /**
   * Remove token from monitoring
   */
  const removeToken = useCallback((mint: string) => {
    tokensRef.current.delete(mint);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    opportunities,
    isMonitoring,
    lastUpdated,
    startMonitoring,
    stopMonitoring,
    forceSnipe,
    addToken,
    updateToken,
    removeToken,
  };
}

export default useCurveEdgeSnipe;
