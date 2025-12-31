import { CandlestickData } from 'lightweight-charts';

interface OHLCData extends CandlestickData {
  time: any;
}

interface SniperFeedConfig {
  // Use local HTTP endpoint (e.g., http://localhost:3001)
  localEndpoint?: string;
  // Use remote API (via env var VITE_API_URL)
  useRemoteAPI?: boolean;
}

let config: SniperFeedConfig = {
  useRemoteAPI: true,
};

/**
 * Configure sniper feed data source
 * @param newConfig Configuration object
 */
export function setSniperFeedConfig(newConfig: Partial<SniperFeedConfig>) {
  config = { ...config, ...newConfig };
}

/**
 * Fetch live sniper price data from local endpoint
 * @param pair - Trading pair (e.g., 'SOL/USDC', 'SOL')
 * @returns Array of candlestick data from sniper bot
 */
export async function fetchSniperData(pair: string = "SOL/USDC"): Promise<OHLCData[]> {
  try {
    const endpoint = config.localEndpoint || 'http://localhost:3001';
    const url = `${endpoint}/api/prices?pair=${pair}`;
    
    console.log(`[SniperFeed] Fetching live data from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: Sniper feed unavailable`);
    
    const prices = await response.json();

    // Convert to chart-friendly format
    return prices.map((p: any) => ({
      time: Math.floor(p.timestamp / 1000),
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    }));
  } catch (err) {
    console.warn("⚠️ Sniper feed error:", err);
    return [];
  }
}

/**
 * Fetch OHLC (candlestick) data for a trading pair
 * @param pairSlug - Trading pair slug (e.g., 'SOL/USDC', 'BTC', 'ETH')
 * @returns Array of candlestick data for charting
 */
export async function getOHLC(pairSlug: string): Promise<OHLCData[]> {
  try {
    let url: string;

    if (config.localEndpoint) {
      // Use local HTTP endpoint (e.g., sniper bot running on localhost:3001)
      url = `${config.localEndpoint}/ohlc/${pairSlug}`;
      console.log(`[SniperFeed] Fetching from local endpoint: ${url}`);
    } else {
      // Use remote API via env var
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      url = `${apiUrl}/api/ohlc/${pairSlug}`;
      console.log(`[SniperFeed] Fetching from remote API: ${url}`);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate and transform data
    return data.map((candle: any) => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
  } catch (error) {
    console.error(`[SniperFeed] Failed to fetch OHLC data for ${pairSlug}:`, error);
    // Return sample data as fallback
    return getSampleOHLC();
  }
}

/**
 * Sample OHLC data for development/demo purposes
 */
function getSampleOHLC(): OHLCData[] {
  const now = Math.floor(Date.now() / 1000);
  const oneHourAgo = now - 3600;
  
  return [
    { time: oneHourAgo, open: 100, high: 115, low: 98, close: 110 },
    { time: oneHourAgo + 600, open: 110, high: 120, low: 108, close: 118 },
    { time: oneHourAgo + 1200, open: 118, high: 125, low: 115, close: 120 },
    { time: oneHourAgo + 1800, open: 120, high: 122, low: 110, close: 112 },
    { time: oneHourAgo + 2400, open: 112, high: 118, low: 105, close: 115 },
    { time: oneHourAgo + 3000, open: 115, high: 130, low: 113, close: 128 },
  ];
}

/**
 * Generate live mock price data for demo/testing
 * Used until the sniper feed is connected
 */
export async function getPriceData(): Promise<{ time: number; open: number; high: number; low: number; close: number; }[]> {
  const now = Math.floor(Date.now() / 1000);
  const data = [];
  for (let i = 60; i >= 0; i--) {
    const t = now - i * 60;
    const base = 100 + Math.sin(t / 10) * 10 + Math.random() * 2;
    data.push({
      time: t,
      open: base - 1,
      high: base + 1,
      low: base - 2,
      close: base + 0.5,
    });
  }
  return data;
}
