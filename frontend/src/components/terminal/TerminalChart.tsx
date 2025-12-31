/**
 * TerminalChart Component
 * 
 * Professional trading chart for terminal center panel
 * Features:
 * - LiveChart integration
 * - Depth overlay (green/red walls)
 * - Volume bars
 * - Bonding progress overlay
 * - Quick Snipe button
 * - Timeframe selector
 * - Auto-update toggle
 */

import React, { useState, useEffect } from 'react';
import { LiveChart } from '../../charts/LiveChart';
import { Token } from '../../data/tokenTypes';
import { useQuickSnipe } from '../../hooks/useQuickSnipe';
import { Timeframe } from '../../charts/useChartData';

// =============================================
// TYPES
// =============================================

interface TerminalChartProps {
  token: Token | undefined;
  mint: string;
}

// =============================================
// COMPONENT
// =============================================

const TerminalChart: React.FC<TerminalChartProps> = ({ token, mint }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [showDepth, setShowDepth] = useState(true);
  const [showBonding, setShowBonding] = useState(true);
  const { openQuickSnipe } = useQuickSnipe();

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h'];

  const handleSnipe = () => {
    openQuickSnipe(mint);
  };

  return (
    <div style={styles.container}>
      {/* Controls Bar */}
      <div style={styles.controlsBar}>
        {/* Quick Snipe Button */}
        <button onClick={handleSnipe} style={styles.snipeButton}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span>SNIPE</span>
        </button>

        {/* Timeframe Selector */}
        <div style={styles.timeframeGroup}>
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                ...styles.timeframeButton,
                ...(timeframe === tf ? styles.timeframeButtonActive : {}),
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Overlay Toggles */}
        <div style={styles.toggleGroup}>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={showDepth}
              onChange={(e) => setShowDepth(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            <span style={{ fontSize: '11px' }}>DEPTH</span>
          </label>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={showBonding}
              onChange={(e) => setShowBonding(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            <span style={{ fontSize: '11px' }}>BONDING</span>
          </label>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            <span style={{ fontSize: '11px' }}>AUTO</span>
          </label>
        </div>
      </div>

      {/* Chart Container */}
      <div style={styles.chartContainer}>
        {token ? (
          <LiveChart
            token={{
              mint: token.mint,
              symbol: token.metadata.symbol,
              bondingProgress: token.bonding.bondingProgress,
              bondingVelocity: token.bonding.velocityScore,
              liquidityHealth: token.liquidityHealth,
              authorityRisk: !token.isFullyRenounced,
            }}
          />
        ) : (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}>⏳</div>
            <div style={{ color: '#8899AA', fontSize: '14px', marginTop: '16px' }}>
              Loading chart data...
            </div>
            <div style={{ color: '#556677', fontSize: '12px', marginTop: '8px' }}>
              {mint.slice(0, 8)}...
            </div>
          </div>
        )}
      </div>

      {/* Overlays */}
      {token && showBonding && (
        <div style={styles.bondingOverlay}>
          <div style={styles.bondingProgress}>
            <div style={{ fontSize: '11px', color: '#8899AA', marginBottom: '4px' }}>
              BONDING
            </div>
            <div style={styles.bondingBar}>
              <div
                style={{
                  ...styles.bondingFill,
                  width: `${token.bonding.bondingProgress}%`,
                }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
              {token.bonding.bondingProgress.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {showDepth && (
        <div style={styles.depthOverlay}>
          <div style={styles.depthIndicator}>
            <span style={{ color: '#00FF88' }}>🟢 BUY WALL</span>
          </div>
          <div style={styles.depthIndicator}>
            <span style={{ color: '#FF3EBF' }}>🔴 SELL WALL</span>
          </div>
        </div>
      )}

      {/* Info Bar */}
      {token && (
        <div style={styles.infoBar}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>PRICE</span>
            <span style={styles.infoValue}>${token.market.price.toFixed(8)}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>24H</span>
            <span
              style={{
                ...styles.infoValue,
                color: (token.market.priceChange24h || 0) >= 0 ? '#00FF88' : '#FF3EBF',
              }}
            >
              {(token.market.priceChange24h || 0) >= 0 ? '+' : ''}
              {(token.market.priceChange24h || 0).toFixed(2)}%
            </span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>VOLUME</span>
            <span style={styles.infoValue}>
              ${(token.market.volume24h / 1000).toFixed(1)}K
            </span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>LIQUIDITY</span>
            <span style={styles.infoValue}>
              ${(token.market.liquidity / 1000).toFixed(1)}K
            </span>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// =============================================
// STYLES
// =============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#03040A',
    position: 'relative',
  },
  controlsBar: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(155,0,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(155,0,255,0.05)',
  },
  snipeButton: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
    border: '2px solid #00E4FF',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0,228,255,0.4)',
  },
  timeframeGroup: {
    display: 'flex',
    gap: '4px',
    marginLeft: 'auto',
  },
  timeframeButton: {
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#8899AA',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  timeframeButtonActive: {
    background: 'rgba(155,0,255,0.3)',
    border: '1px solid #9B00FF',
    color: '#FFFFFF',
    boxShadow: '0 0 12px rgba(155,0,255,0.6)',
  },
  toggleGroup: {
    display: 'flex',
    gap: '12px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#8899AA',
    cursor: 'pointer',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  loadingState: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    fontSize: '48px',
    animation: 'spin 2s linear infinite',
  },
  bondingOverlay: {
    position: 'absolute',
    top: '80px',
    right: '16px',
    background: 'rgba(3,4,10,0.9)',
    border: '1px solid rgba(155,0,255,0.4)',
    borderRadius: '12px',
    padding: '12px',
    minWidth: '120px',
    backdropFilter: 'blur(10px)',
  },
  bondingProgress: {
    textAlign: 'center',
  },
  bondingBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  bondingFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 12px rgba(155,0,255,0.8)',
  },
  depthOverlay: {
    position: 'absolute',
    top: '80px',
    left: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  depthIndicator: {
    background: 'rgba(3,4,10,0.9)',
    border: '1px solid rgba(0,228,255,0.3)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 700,
    backdropFilter: 'blur(10px)',
  },
  infoBar: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(155,0,255,0.2)',
    display: 'flex',
    gap: '24px',
    background: 'rgba(155,0,255,0.05)',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '10px',
    color: '#8899AA',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
};

// =============================================
// EXPORTS
// =============================================

export default TerminalChart;
