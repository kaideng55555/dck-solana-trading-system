/**
 * TokenInfoPanel Component
 * 
 * Token information and sniper signals for terminal right panel
 * Features:
 * - Token metadata + price
 * - Market stats
 * - Bonding progress ring
 * - Sniper indicators (FRESH, CURVE EDGE, TRENDING)
 * - Authority/liquidity risk badges
 * - Buy/Sell buttons
 * - Recent alerts for this token
 */

import React, { useMemo } from 'react';
import { Token } from '../../data/tokenTypes';
import { useSwapStore } from '../../stores/swapStore';
import { useAlertsStore, AlertItem } from '../../stores/alertsStore';

// =============================================
// TYPES
// =============================================

interface TokenInfoPanelProps {
  token: Token | undefined;
  mint: string;
}

// =============================================
// COMPONENT
// =============================================

const TokenInfoPanel: React.FC<TokenInfoPanelProps> = ({ token, mint }) => {
  const { openSwap } = useSwapStore();
  const alerts = useAlertsStore((state) =>
    state.alerts.filter((a: AlertItem) => a.message?.includes(mint.slice(0, 8))).slice(0, 10)
  );

  const SOL_MINT = 'So11111111111111111111111111111111111111112';

  // Compute sniper signals
  const signals = useMemo(() => {
    if (!token) return [];

    const result = [];

    // FRESH (< 90 seconds old)
    if (token.ageMinutes * 60 < 90) {
      result.push({ label: 'FRESH', color: '#FFD700', emoji: '🆕' });
    }

    // CURVE EDGE (bonding > 96%)
    if (token.bonding.bondingProgress > 96 && !token.bonding.isMigrated) {
      result.push({ label: 'CURVE EDGE', color: '#FF3EBF', emoji: '🎯' });
    }

    // TRENDING UP (velocity score > 70)
    if ((token.bonding.velocityScore || 0) > 70) {
      result.push({ label: 'TRENDING UP', color: '#00E4FF', emoji: '📈' });
    }

    // HIGH VOLUME (volume24h > 50K)
    if (token.market.volume24h > 50000) {
      result.push({ label: 'HIGH VOLUME', color: '#9B00FF', emoji: '🔥' });
    }

    return result;
  }, [token]);

  const handleBuy = () => {
    openSwap(SOL_MINT, mint);
  };

  const handleSell = () => {
    openSwap(mint, SOL_MINT);
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div style={{ color: '#8899AA', fontSize: '13px' }}>
            Loading token data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {token.metadata.image && (
          <img
            src={token.metadata.image}
            alt={token.metadata.symbol}
            style={styles.tokenImage}
          />
        )}
        <div style={styles.tokenInfo}>
          <div style={styles.tokenSymbol}>{token.metadata.symbol}</div>
          <div style={styles.tokenName}>{token.metadata.name}</div>
        </div>
      </div>

      {/* Price Section */}
      <div style={styles.priceSection}>
        <div style={styles.priceLabel}>PRICE</div>
        <div style={styles.priceValue}>${token.market.price.toFixed(8)}</div>
        <div
          style={{
            ...styles.priceChange,
            color: (token.market.priceChange24h || 0) >= 0 ? '#00FF88' : '#FF3EBF',
          }}
        >
          {(token.market.priceChange24h || 0) >= 0 ? '▲' : '▼'}{' '}
          {Math.abs(token.market.priceChange24h || 0).toFixed(2)}%
        </div>
      </div>

      {/* Market Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>MARKET CAP</div>
          <div style={styles.statValue}>
            ${(token.market.marketCap / 1000).toFixed(1)}K
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>LIQUIDITY</div>
          <div style={styles.statValue}>
            ${(token.market.liquidity / 1000).toFixed(1)}K
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>VOLUME 24H</div>
          <div style={styles.statValue}>
            ${(token.market.volume24h / 1000).toFixed(1)}K
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>HOLDERS</div>
          <div style={styles.statValue}>{token.market.holders || '—'}</div>
        </div>
      </div>

      {/* Bonding Progress Ring */}
      <div style={styles.bondingSection}>
        <div style={styles.bondingRing}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#bondingGradient)"
              strokeWidth="8"
              strokeDasharray={`${(token.bonding.bondingProgress / 100) * 314} 314`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="bondingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E4FF" />
                <stop offset="50%" stopColor="#9B00FF" />
                <stop offset="100%" stopColor="#FF3EBF" />
              </linearGradient>
            </defs>
          </svg>
          <div style={styles.bondingText}>
            <div style={styles.bondingPercent}>
              {token.bonding.bondingProgress.toFixed(0)}%
            </div>
            <div style={styles.bondingLabel}>BONDING</div>
          </div>
        </div>
      </div>

      {/* Sniper Signals */}
      {signals.length > 0 && (
        <div style={styles.signalsSection}>
          <div style={styles.sectionTitle}>🎯 SNIPER SIGNALS</div>
          <div style={styles.signalsGrid}>
            {signals.map((signal, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.signalBadge,
                  borderColor: signal.color,
                  boxShadow: `0 0 12px ${signal.color}40`,
                }}
              >
                <span style={{ fontSize: '14px' }}>{signal.emoji}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: signal.color }}>
                  {signal.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Badges */}
      <div style={styles.riskSection}>
        <div style={styles.sectionTitle}>🛡️ RISK ANALYSIS</div>
        <div style={styles.riskGrid}>
          <div
            style={{
              ...styles.riskBadge,
              borderColor: token.isFullyRenounced ? '#00FF88' : '#FF4444',
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700 }}>
              {token.isFullyRenounced ? '✅' : '⚠️'} AUTHORITY
            </span>
          </div>
          <div
            style={{
              ...styles.riskBadge,
              borderColor: token.liquidityHealth > 70 ? '#00FF88' : '#FF4444',
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700 }}>
              {token.liquidityHealth > 70 ? '✅' : '⚠️'} LIQUIDITY
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button onClick={handleBuy} style={styles.buyButton}>
          <span style={{ fontSize: '16px' }}>🟢</span>
          <span>BUY</span>
        </button>
        <button onClick={handleSell} style={styles.sellButton}>
          <span style={{ fontSize: '16px' }}>🔴</span>
          <span>SELL</span>
        </button>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div style={styles.alertsSection}>
          <div style={styles.sectionTitle}>📢 RECENT ALERTS</div>
          <div style={styles.alertsList}>
            {alerts.map((alert: AlertItem, idx: number) => (
              <div key={idx} style={styles.alertItem}>
                <span style={{ fontSize: '10px', color: '#8899AA' }}>
                  {new Date(alert.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span style={{ fontSize: '11px', color: '#FFFFFF' }}>
                  {alert.message?.slice(0, 40)}...
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
    overflowY: 'auto',
    background: '#03040A',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  loadingState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(155,0,255,0.2)',
  },
  tokenImage: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid rgba(155,0,255,0.4)',
    boxShadow: '0 0 12px rgba(155,0,255,0.6)',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  tokenName: {
    fontSize: '12px',
    color: '#8899AA',
  },
  priceSection: {
    textAlign: 'center',
    padding: '12px',
    background: 'rgba(155,0,255,0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(155,0,255,0.3)',
  },
  priceLabel: {
    fontSize: '10px',
    color: '#8899AA',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  priceValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  priceChange: {
    fontSize: '13px',
    fontWeight: 700,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  statItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '9px',
    color: '#8899AA',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  bondingSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0',
  },
  bondingRing: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  bondingText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  bondingPercent: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  bondingLabel: {
    fontSize: '10px',
    color: '#8899AA',
    textTransform: 'uppercase',
  },
  signalsSection: {
    borderTop: '1px solid rgba(0,228,255,0.2)',
    paddingTop: '12px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#00E4FF',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  signalsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  signalBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid',
    borderRadius: '8px',
  },
  riskSection: {
    borderTop: '1px solid rgba(0,228,255,0.2)',
    paddingTop: '12px',
  },
  riskGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  riskBadge: {
    padding: '8px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid',
    borderRadius: '8px',
    textAlign: 'center',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '8px',
  },
  buyButton: {
    padding: '12px',
    background: 'linear-gradient(135deg, #00FF88 0%, #00E4FF 100%)',
    border: '2px solid #00FF88',
    borderRadius: '10px',
    color: '#000000',
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0,255,136,0.4)',
  },
  sellButton: {
    padding: '12px',
    background: 'linear-gradient(135deg, #FF3EBF 0%, #FF4444 100%)',
    border: '2px solid #FF3EBF',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(255,62,191,0.4)',
  },
  alertsSection: {
    borderTop: '1px solid rgba(0,228,255,0.2)',
    paddingTop: '12px',
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  alertItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '6px',
    borderLeft: '2px solid #FFD700',
  },
};

// =============================================
// EXPORTS
// =============================================

export default TokenInfoPanel;
