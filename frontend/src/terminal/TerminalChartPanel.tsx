/**
 * TerminalChartPanel Component (Trader Terminal - Main Chart)
 * 
 * Professional trading chart with lightweight-charts library
 * 
 * Features:
 * - Real-time candlestick chart with volume
 * - Bonding curve progress overlay
 * - Multiple timeframes (1m, 5m, 15m, 1h)
 * - Buy/Sell/Snipe quick action buttons
 * - Auto-update toggle
 * - DCK Neon graffiti styling
 * - Sound effects integration
 * - Velocity and liquidity status indicators
 */

import React, { useState, useEffect, useRef } from 'react';
import type { IChartApi, ISeriesApi, CandlestickSeriesPartialOptions, HistogramSeriesPartialOptions, LineSeriesPartialOptions, Time } from 'lightweight-charts';
import { useToken } from '../data/tokenDataStore';
import { useChartData, type Timeframe } from '../charts/useChartData';
import { useSwapStore, DEFAULT_TOKENS } from '../stores/swapStore';
import { useQuickSnipe } from '../hooks/useQuickSnipe';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface TerminalChartPanelProps {
  /** Token mint address */
  mint: string;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Format price with appropriate decimals
 */
function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
}

/**
 * Format percentage change
 */
function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * Get liquidity status
 */
function getLiquidityStatus(token: any): { label: string; color: string } {
  if (!token) return { label: 'UNKNOWN', color: '#6B7280' };
  
  if (token.rugLikely || token.honeypotRisk) {
    return { label: 'RISK', color: '#FF3E3E' };
  }
  
  if (token.earlyRugWarning || token.whaleExitSpike) {
    return { label: 'WARNING', color: '#FFA500' };
  }
  
  if (token.lpLocked && token.lpBurned && token.liquidityHealth > 70) {
    return { label: 'SAFE', color: '#00E4FF' };
  }
  
  return { label: 'MEDIUM', color: '#FFD700' };
}

/**
 * Get velocity indicator
 */
function getVelocityIndicator(velocityScore?: number): { icon: string; color: string } {
  if (!velocityScore) return { icon: '➡️', color: '#6B7280' };
  
  if (velocityScore >= 75) return { icon: '⬆️', color: '#00E4FF' };
  if (velocityScore >= 50) return { icon: '↗️', color: '#00E4FF' };
  if (velocityScore <= 25) return { icon: '⬇️', color: '#FF3EBF' };
  if (velocityScore <= 40) return { icon: '↘️', color: '#FF3EBF' };
  
  return { icon: '➡️', color: '#FFD700' };
}

/**
 * Get bonding progress color
 */
function getBondingColor(progress: number): string {
  if (progress >= 99) return '#FF3E3E'; // Red pulse
  if (progress >= 90) return '#FFA500'; // Orange glow
  return '#00E4FF'; // Cyan
}

// =============================================
// COMPONENT
// =============================================

export const TerminalChartPanel: React.FC<TerminalChartPanelProps> = ({ mint }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const bondingSeriesRef = useRef<any>(null);

  const token = useToken(mint);
  const chartData = useChartData(mint, timeframe);
  const openSwap = useSwapStore((state) => state.openSwap);
  const { openQuickSnipe } = useQuickSnipe();
  const { play } = useSFX();

  // Inject CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bondingPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes sprayPaint {
        0% { opacity: 0.05; }
        50% { opacity: 0.15; }
        100% { opacity: 0.05; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes neonPulseBorder {
        0%, 100% { 
          box-shadow: 0 0 30px rgba(0,245,255,0.3), 0 0 60px rgba(155,0,255,0.2);
        }
        50% { 
          box-shadow: 0 0 50px rgba(0,245,255,0.6), 0 0 90px rgba(155,0,255,0.4), 0 0 120px rgba(255,62,191,0.3);
        }
      }
      
      .terminal-chart-button {
        transition: all 0.15s ease;
      }
      
      .terminal-chart-button:hover {
        transform: scale(1.05);
      }
      
      .terminal-chart-button:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize lightweight-charts
  useEffect(() => {
    let mounted = true;

    const initChart = async () => {
      if (!chartContainerRef.current) return;

      try {
        const { createChart } = await import('lightweight-charts');

        if (!mounted) return;

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
          layout: {
            background: { color: '#050508' },
            textColor: '#B8BCC8',
            fontSize: 12,
            fontFamily: "'Inter', -apple-system, sans-serif",
          },
          grid: {
            vertLines: { color: '#9B00FF33' },
            horzLines: { color: '#9B00FF33' },
          },
          crosshair: {
            mode: 1,
            vertLine: {
              color: '#00E4FF',
              width: 1,
              style: 3,
              labelBackgroundColor: '#00E4FF',
            },
            horzLine: {
              color: '#00E4FF',
              width: 1,
              style: 3,
              labelBackgroundColor: '#00E4FF',
            },
          },
          rightPriceScale: {
            borderColor: '#2A2A3A',
            textColor: '#B8BCC8',
          },
          timeScale: {
            borderColor: '#2A2A3A',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        // Candlestick series
        const candleSeries = (chart as any).addCandlestickSeries({
          upColor: '#00E4FF',
          downColor: '#FF3EBF',
          borderUpColor: '#00E4FF',
          borderDownColor: '#FF3EBF',
          wickUpColor: '#00E4FF',
          wickDownColor: '#FF3EBF',
        });

        // Volume histogram
        const volumeSeries = (chart as any).addHistogramSeries({
          color: '#00E4FF55',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
        });

        chart.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        // Bonding curve overlay
        const bondingSeries = (chart as any).addLineSeries({
          color: '#00E4FF',
          lineWidth: 2,
          priceScaleId: 'bonding',
          lastValueVisible: false,
          priceLineVisible: false,
        });

        chart.priceScale('bonding').applyOptions({
          scaleMargins: {
            top: 0.1,
            bottom: 0.8,
          },
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;
        bondingSeriesRef.current = bondingSeries;
        setChartReady(true);

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height: chartContainerRef.current.clientHeight,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
          }
        };
      } catch (error) {
        console.error('Failed to initialize chart:', error);
      }
    };

    initChart();

    return () => {
      mounted = false;
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!chartReady || !chartData || chartData.loading) return;

    if (candleSeriesRef.current && chartData.candles.length > 0) {
      candleSeriesRef.current.setData(chartData.candles.map((c: any) => ({
        ...c,
        time: c.time as Time,
      })));
    }

    if (volumeSeriesRef.current && chartData.volume.length > 0) {
      volumeSeriesRef.current.setData(chartData.volume.map((v: any) => ({
        ...v,
        time: v.time as Time,
      })));
    }

    if (bondingSeriesRef.current && chartData.bondingOverlay.length > 0) {
      bondingSeriesRef.current.setData(chartData.bondingOverlay.map((point: any) => ({
        time: point.time as Time,
        value: point.value / 100, // Normalize to 0-1 scale
      })));
      
      // Update line color based on latest progress
      const latestProgress = chartData.bondingOverlay[chartData.bondingOverlay.length - 1]?.value || 0;
      const color = getBondingColor(latestProgress);
      bondingSeriesRef.current.applyOptions({ color });
    }

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [chartReady, chartData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      chartData.refresh();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [autoUpdate, chartData]);

  // =============================================
  // HANDLERS
  // =============================================

  const handleBuy = () => {
    play('buy');
    openSwap(DEFAULT_TOKENS.SOL, mint, 'default');
    console.log(`🟢 BUY: ${mint}`);
  };

  const handleSell = () => {
    play('sell');
    openSwap(mint, DEFAULT_TOKENS.SOL, 'default');
    console.log(`🔴 SELL: ${mint}`);
  };

  const handleSnipe = () => {
    play('shotgun');
    openQuickSnipe(mint);
    console.log(`⚡ SNIPE: ${mint}`);
  };

  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
  };

  const handleAutoUpdateToggle = () => {
    setAutoUpdate(!autoUpdate);
  };

  // =============================================
  // RENDER DATA
  // =============================================

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const chartHeight = isMobile ? (window.innerWidth < 414 ? 280 : 330) : 450;
  
  const liquidityStatus = getLiquidityStatus(token);
  const velocityIndicator = getVelocityIndicator(token?.bonding?.velocityScore);
  const bondingProgress = token?.bonding?.bondingProgress || 0;
  const bondingColor = getBondingColor(bondingProgress);
  
  const priceChange = token?.market?.priceChange24h || 0;
  const priceChangeColor = priceChange >= 0 ? '#00E4FF' : '#FF3EBF';
  
  // Determine if we should pulse the border (bonding >= 96%)
  const shouldPulseBorder = bondingProgress >= 96;

  // =============================================
  // RENDER
  // =============================================

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '2px solid transparent',
        borderRadius: '12px',
        background: 'linear-gradient(#0B0B0F, #0B0B0F) padding-box, linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%) border-box',
        padding: isMobile ? '10px' : '12px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        boxShadow: isMobile ? 'none' : '0 0 20px rgba(255,62,191,0.2)',
        position: 'relative',
      }}
    >
      {/* Spray paint graffiti accent */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'sprayPaint 4s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />

      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          zIndex: 1,
        }}
      >
        {/* Token Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: isMobile ? 'center' : 'left' }}>
          {token?.metadata?.image && (
            <img
              src={token.metadata.image}
              alt={token.metadata.symbol}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid #00E4FF',
                boxShadow: '0 0 8px rgba(0,245,255,0.5)',
              }}
            />
          )}
          <div>
            <div
              style={{
                fontSize: isMobile ? '15px' : '14px',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.2,
              }}
            >
              {token?.metadata?.symbol || 'TOKEN'}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#6B7280',
                lineHeight: 1.2,
              }}
            >
              {token?.metadata?.name || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Price & Change */}
        <div style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: isMobile ? 'center' : 'flex-start' }}>
          <div
            style={{
              fontSize: isMobile ? '22px' : '16px',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
            }}
          >
            {token ? formatPrice(token.market.price) : '$0.00'}
          </div>
          <div
            className={Math.abs(priceChange) >= 5 ? 'dck-price-surge' : ''}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: priceChangeColor,
              textShadow: `0 0 8px ${priceChangeColor}`,
              lineHeight: 1.2,
            }}
          >
            {token ? formatPercent(priceChange) : '+0.00%'}
          </div>
        </div>

        {/* Overlays Section */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Bonding Progress */}
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: `${bondingColor}22`,
              border: `1px solid ${bondingColor}`,
              fontSize: '11px',
              fontWeight: 600,
              color: bondingColor,
              textShadow: `0 0 6px ${bondingColor}`,
              animation: bondingProgress >= 99 ? 'bondingPulse 2s infinite' : 'none',
            }}
          >
            🔥 {bondingProgress.toFixed(1)}%
          </div>

          {/* Velocity Indicator */}
          <div
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: `${velocityIndicator.color}22`,
              border: `1px solid ${velocityIndicator.color}`,
              fontSize: '11px',
              fontWeight: 600,
              color: velocityIndicator.color,
            }}
          >
            {velocityIndicator.icon}
          </div>

          {/* Liquidity Status */}
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: `${liquidityStatus.color}22`,
              border: `1px solid ${liquidityStatus.color}`,
              fontSize: '11px',
              fontWeight: 600,
              color: liquidityStatus.color,
              textShadow: `0 0 6px ${liquidityStatus.color}`,
            }}
          >
            {liquidityStatus.label}
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          zIndex: 1,
        }}
      >
        {/* Left: Action Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="terminal-chart-button"
            onClick={handleBuy}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00E4FF 0%, #00C3E6 100%)',
              border: '1px solid #00E4FF',
              color: '#000000',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(0,245,255,0.5)',
            }}
          >
            🟢 BUY
          </button>

          <button
            className="terminal-chart-button"
            onClick={handleSell}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF3EBF 0%, #E62A9F 100%)',
              border: '1px solid #FF3EBF',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(255,62,191,0.5)',
            }}
          >
            🔴 SELL
          </button>

          <button
            className="terminal-chart-button"
            onClick={handleSnipe}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #9B00FF 0%, #7A00CC 100%)',
              border: '1px solid #9B00FF',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(155,0,255,0.5)',
            }}
          >
            ⚡ SNIPE
          </button>
        </div>

        {/* Right: Timeframe + Auto-Update */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* Timeframe Selector */}
          <div
            style={{
              display: 'flex',
              gap: isMobile ? '4px' : '6px',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            {(['1m', '5m', '15m', '1h'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: timeframe === tf ? '#00E4FF22' : 'transparent',
                  border: `1px solid ${timeframe === tf ? '#00E4FF' : '#2A2A3A'}`,
                  color: timeframe === tf ? '#00E4FF' : '#6B7280',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tf}
              </button>
            ))}

            {/* Auto-Update Toggle */}
            <button
              onClick={handleAutoUpdateToggle}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: autoUpdate ? '#00E4FF22' : 'transparent',
                border: `1px solid ${autoUpdate ? '#00E4FF' : '#2A2A3A'}`,
                color: autoUpdate ? '#00E4FF' : '#6B7280',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {autoUpdate ? '🔄' : '⏸️'}
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        style={{
          flex: 1,
          minHeight: 0,
          height: chartHeight,
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#050508',
          border: '1px solid #2A2A3A',
        }}
      />

      {/* Loading Overlay */}
      {chartData.loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5,5,8,0.9)',
            color: '#00E4FF',
            fontSize: '14px',
            fontWeight: 600,
            textShadow: '0 0 10px rgba(0,245,255,0.8)',
            zIndex: 10,
          }}
        >
          Loading chart data...
        </div>
      )}
    </div>
  );
};

export default TerminalChartPanel;
