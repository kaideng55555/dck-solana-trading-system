/**
 * useChartData Hook
 * 
 * Pulls live price candles and bonding curve data for a token
 * Features:
 * - Live updates every 3 seconds
 * - Multiple timeframes (1m, 5m, 15m, 1h)
 * - Bonding curve overlay with color-coded stages
 * - Volume data for histogram display
 * 
 * Bonding Overlay Logic:
 * - < 90%: Cyan (#00E4FF)
 * - 90-99%: Orange glow
 * - 99-100%: Red pulse
 * - Uses bonding.velocity & eta if available
 */

import { useState, useEffect, useCallback } from 'react';

// =============================================
// TYPES
// =============================================

export type Timeframe = '1m' | '5m' | '15m' | '1h';

export interface CandleData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: number; // Unix timestamp in seconds
  value: number;
  color?: string; // Optional color override
}

export interface BondingOverlayPoint {
  time: number; // Unix timestamp in seconds
  value: number; // Bonding progress (0-100)
  color?: string; // Color based on progress
}

export interface ChartData {
  candles: CandleData[];
  volume: VolumeData[];
  bondingOverlay: BondingOverlayPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get color for bonding progress
 */
function getBondingColor(progress: number): string {
  if (progress >= 99) return '#FF3E3E'; // Red pulse
  if (progress >= 90) return '#FFA500'; // Orange glow
  return '#00E4FF'; // Cyan
}

/**
 * Get timeframe interval in milliseconds
 */
function getTimeframeInterval(timeframe: Timeframe): number {
  switch (timeframe) {
    case '1m': return 60 * 1000;
    case '5m': return 5 * 60 * 1000;
    case '15m': return 15 * 60 * 1000;
    case '1h': return 60 * 60 * 1000;
    default: return 5 * 60 * 1000;
  }
}

/**
 * Generate mock candle data (replace with real API call)
 */
function generateMockCandles(tokenMint: string, timeframe: Timeframe, count: number = 100): CandleData[] {
  const now = Math.floor(Date.now() / 1000);
  const interval = getTimeframeInterval(timeframe) / 1000;
  
  const candles: CandleData[] = [];
  let basePrice = 0.00001234; // Starting price
  
  for (let i = count - 1; i >= 0; i--) {
    const time = now - (i * interval);
    const volatility = 0.05; // 5% price movement
    
    const open = basePrice;
    const change = (Math.random() - 0.5) * volatility;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    
    candles.push({ time, open, high, low, close });
    basePrice = close; // Next candle starts at current close
  }
  
  return candles;
}

/**
 * Generate mock volume data (replace with real API call)
 */
function generateMockVolume(candles: CandleData[]): VolumeData[] {
  return candles.map(candle => ({
    time: candle.time,
    value: Math.random() * 100000 + 10000, // Random volume
    color: candle.close >= candle.open ? '#00E4FF55' : '#FF3EBF55',
  }));
}

/**
 * Generate mock bonding overlay data (replace with real API call)
 */
function generateMockBondingOverlay(candles: CandleData[]): BondingOverlayPoint[] {
  const startProgress = 50;
  const endProgress = 95;
  const progressPerCandle = (endProgress - startProgress) / candles.length;
  
  return candles.map((candle, index) => {
    const progress = startProgress + (progressPerCandle * index);
    return {
      time: candle.time,
      value: progress,
      color: getBondingColor(progress),
    };
  });
}

// =============================================
// HOOK
// =============================================

export function useChartData(tokenMint: string, timeframe: Timeframe = '5m'): ChartData {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [volume, setVolume] = useState<VolumeData[]>([]);
  const [bondingOverlay, setBondingOverlay] = useState<BondingOverlayPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with real API calls
      // const response = await fetch(`/api/charts/${tokenMint}?timeframe=${timeframe}`);
      // const data = await response.json();

      // Mock data generation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      const mockCandles = generateMockCandles(tokenMint, timeframe);
      const mockVolume = generateMockVolume(mockCandles);
      const mockBonding = generateMockBondingOverlay(mockCandles);

      setCandles(mockCandles);
      setVolume(mockVolume);
      setBondingOverlay(mockBonding);
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  }, [tokenMint, timeframe]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    candles,
    volume,
    bondingOverlay,
    loading,
    error,
    refresh,
  };
}

export default useChartData;
