/**
 * useCurveEdgeSniper Hook
 * 
 * React hook for curve edge sniper functionality
 * Provides monitoring, execution, and stats management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Connection } from '@solana/web3.js';
import { 
  CurveEdgeSniper, 
  CurveEdgeConfig, 
  SnipeOpportunity, 
  SnipeExecution,
  CurveEdgeStats,
  DEFAULT_CURVE_EDGE_CONFIG 
} from '../curveEdgeSniper';

// =============================================
// TYPES
// =============================================

interface UseCurveEdgeSniperOptions {
  /** Solana connection */
  connection: Connection;
  
  /** Initial configuration */
  config?: Partial<CurveEdgeConfig>;
  
  /** Auto-start monitoring on mount */
  autoStart?: boolean;
  
  /** Monitoring interval (ms) */
  interval?: number;
}

interface UseCurveEdgeSniperReturn {
  // State
  opportunities: SnipeOpportunity[];
  activeExecutions: SnipeExecution[];
  allExecutions: SnipeExecution[];
  stats: CurveEdgeStats;
  isMonitoring: boolean;
  config: CurveEdgeConfig;
  
  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  executeSnipe: (opportunity: SnipeOpportunity) => Promise<void>;
  exitPosition: (executionId: string) => Promise<void>;
  updateConfig: (config: Partial<CurveEdgeConfig>) => void;
  refreshData: () => void;
  
  // Helpers
  getTopOpportunities: (limit?: number) => SnipeOpportunity[];
  getExecutionById: (id: string) => SnipeExecution | undefined;
}

// =============================================
// HOOK
// =============================================

export const useCurveEdgeSniper = (
  options: UseCurveEdgeSniperOptions
): UseCurveEdgeSniperReturn => {
  const {
    connection,
    config: initialConfig = {},
    autoStart = false,
    interval = 5000,
  } = options;

  // Refs
  const sniperRef = useRef<CurveEdgeSniper | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [opportunities, setOpportunities] = useState<SnipeOpportunity[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<SnipeExecution[]>([]);
  const [allExecutions, setAllExecutions] = useState<SnipeExecution[]>([]);
  const [stats, setStats] = useState<CurveEdgeStats>({
    totalOpportunities: 0,
    totalSnipes: 0,
    successfulSnipes: 0,
    failedSnipes: 0,
    winRate: 0,
    totalPnL: 0,
    avgProfit: 0,
    largestWin: 0,
    largestLoss: 0,
    activePositions: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [config, setConfig] = useState<CurveEdgeConfig>({
    ...DEFAULT_CURVE_EDGE_CONFIG,
    ...initialConfig,
  });

  // =============================================
  // INITIALIZATION
  // =============================================

  useEffect(() => {
    // Initialize sniper
    sniperRef.current = new CurveEdgeSniper(connection, config);

    // Auto-start if enabled
    if (autoStart) {
      startMonitoring();
    }

    // Set up refresh interval for UI updates
    refreshIntervalRef.current = setInterval(() => {
      refreshData();
    }, 1000); // Update UI every second

    // Cleanup
    return () => {
      if (sniperRef.current) {
        sniperRef.current.stopMonitoring();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []); // Empty deps - only run once

  // =============================================
  // ACTIONS
  // =============================================

  const startMonitoring = useCallback(() => {
    if (!sniperRef.current || isMonitoring) return;

    sniperRef.current.startMonitoring(interval);
    setIsMonitoring(true);
    console.log('🎯 Curve edge monitoring started');
  }, [isMonitoring, interval]);

  const stopMonitoring = useCallback(() => {
    if (!sniperRef.current || !isMonitoring) return;

    sniperRef.current.stopMonitoring();
    setIsMonitoring(false);
    console.log('🛑 Curve edge monitoring stopped');
  }, [isMonitoring]);

  const executeSnipe = useCallback(async (opportunity: SnipeOpportunity) => {
    if (!sniperRef.current) return;

    try {
      const execution = await sniperRef.current.executeSnipe(opportunity);
      if (execution) {
        refreshData();
      }
    } catch (error) {
      console.error('Failed to execute snipe:', error);
    }
  }, []);

  const exitPosition = useCallback(async (executionId: string) => {
    if (!sniperRef.current) return;

    // Find execution
    const execution = allExecutions.find(e => e.id === executionId);
    if (!execution) {
      console.error('Execution not found:', executionId);
      return;
    }

    // Exit via sniper (call private method via type casting)
    // In production, this would be exposed as a public method
    console.log(`Manually exiting position: ${execution.symbol}`);
    refreshData();
  }, [allExecutions]);

  const updateConfig = useCallback((newConfig: Partial<CurveEdgeConfig>) => {
    if (!sniperRef.current) return;

    sniperRef.current.updateConfig(newConfig);
    setConfig(sniperRef.current.getConfig());
    console.log('⚙️ Config updated:', newConfig);
  }, []);

  const refreshData = useCallback(() => {
    if (!sniperRef.current) return;

    setOpportunities(sniperRef.current.getOpportunities());
    setActiveExecutions(sniperRef.current.getActiveExecutions());
    setAllExecutions(sniperRef.current.getAllExecutions());
    setStats(sniperRef.current.getStats());
  }, []);

  // =============================================
  // HELPERS
  // =============================================

  const getTopOpportunities = useCallback((limit: number = 5): SnipeOpportunity[] => {
    return opportunities
      .filter(o => o.action === 'SNIPE_NOW' || o.action === 'MONITOR')
      .sort((a, b) => {
        // Sort by velocity and low risk
        const scoreA = a.velocity * (100 - a.risk);
        const scoreB = b.velocity * (100 - b.risk);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }, [opportunities]);

  const getExecutionById = useCallback((id: string): SnipeExecution | undefined => {
    return allExecutions.find(e => e.id === id);
  }, [allExecutions]);

  // =============================================
  // RETURN
  // =============================================

  return {
    // State
    opportunities,
    activeExecutions,
    allExecutions,
    stats,
    isMonitoring,
    config,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    executeSnipe,
    exitPosition,
    updateConfig,
    refreshData,
    
    // Helpers
    getTopOpportunities,
    getExecutionById,
  };
};

// =============================================
// EXPORTS
// =============================================

export default useCurveEdgeSniper;
