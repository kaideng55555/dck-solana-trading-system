/**
 * OrderFlowTape Component
 * 
 * Real-time trade feed for terminal left panel
 * Features:
 * - Buy/sell/snipe/LP event stream
 * - Color-coded by event type
 * - Auto-scroll to bottom
 * - Volume spike pulse effect
 * - Graffiti drip border
 */

import React, { useEffect, useRef, useState } from 'react';
import { Token } from '../../data/tokenTypes';

// =============================================
// TYPES
// =============================================

interface OrderFlowTapeProps {
  mint: string;
}

interface TradeEvent {
  id: string;
  type: 'buy' | 'sell' | 'snipe' | 'lp_add' | 'lp_remove';
  timestamp: number;
  amount: number;
  price: number;
  wallet: string;
  size: 'small' | 'medium' | 'large';
}

// =============================================
// COMPONENT
// =============================================

const OrderFlowTape: React.FC<OrderFlowTapeProps> = ({ mint }) => {
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastVolumeRef = useRef(0);

  // Mock trade generator (replace with actual WebSocket feed)
  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade: TradeEvent = {
        id: Date.now().toString(),
        type: ['buy', 'sell', 'snipe', 'lp_add', 'lp_remove'][Math.floor(Math.random() * 5)] as any,
        timestamp: Date.now(),
        amount: Math.random() * 1000,
        price: 0.00001 + Math.random() * 0.0001,
        wallet: `${Math.random().toString(36).slice(2, 8)}...${Math.random().toString(36).slice(2, 6)}`,
        size: Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small',
      };

      setTrades((prev) => {
        const updated = [newTrade, ...prev].slice(0, 100); // Keep last 100
        return updated;
      });
    }, 2000 + Math.random() * 3000); // Random interval 2-5s

    return () => clearInterval(interval);
  }, [mint]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Scroll to top (newest first)
    }
  }, [trades, autoScroll]);

  const getEventColor = (type: TradeEvent['type']): string => {
    switch (type) {
      case 'buy':
        return '#00E4FF'; // Cyan
      case 'sell':
        return '#FF3EBF'; // Pink
      case 'snipe':
        return '#FFD700'; // Gold
      case 'lp_add':
        return '#9B00FF'; // Purple
      case 'lp_remove':
        return '#FF4444'; // Red
      default:
        return '#8899AA';
    }
  };

  const getEventLabel = (type: TradeEvent['type']): string => {
    switch (type) {
      case 'buy':
        return '🟢 BUY';
      case 'sell':
        return '🔴 SELL';
      case 'snipe':
        return '⚡ SNIPE';
      case 'lp_add':
        return '💧 LP ADD';
      case 'lp_remove':
        return '🔥 LP REMOVE';
      default:
        return '❓ UNKNOWN';
    }
  };

  const getSizeIndicator = (size: TradeEvent['size']): string => {
    switch (size) {
      case 'large':
        return '🐋';
      case 'medium':
        return '🦈';
      case 'small':
        return '🐟';
      default:
        return '';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={{ fontSize: '16px' }}>📊</span>
          <span>ORDER FLOW</span>
        </div>
        <label style={styles.autoScrollToggle}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            style={{ marginRight: '6px' }}
          />
          <span style={{ fontSize: '11px' }}>AUTO</span>
        </label>
      </div>

      {/* Trade List */}
      <div ref={scrollRef} style={styles.tradeList}>
        {trades.length === 0 && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</span>
            <div style={{ color: '#8899AA', fontSize: '13px' }}>
              Waiting for trades...
            </div>
          </div>
        )}

        {trades.map((trade) => {
          const color = getEventColor(trade.type);
          const shouldPulse = trade.size === 'large';

          return (
            <div
              key={trade.id}
              style={{
                ...styles.tradeRow,
                borderLeft: `3px solid ${color}`,
                animation: shouldPulse ? 'pulseTrade 1s ease-out' : 'none',
              }}
            >
              {/* Type + Size */}
              <div style={styles.tradeHeader}>
                <span style={{ color, fontSize: '11px', fontWeight: 700 }}>
                  {getEventLabel(trade.type)}
                </span>
                <span style={{ fontSize: '14px' }}>
                  {getSizeIndicator(trade.size)}
                </span>
              </div>

              {/* Amount + Price */}
              <div style={styles.tradeData}>
                <div style={styles.tradeAmount}>
                  ${trade.amount.toFixed(2)}
                </div>
                <div style={styles.tradePrice}>
                  @ ${trade.price.toFixed(8)}
                </div>
              </div>

              {/* Wallet + Time */}
              <div style={styles.tradeFooter}>
                <span style={styles.tradeWallet}>{trade.wallet}</span>
                <span style={styles.tradeTime}>
                  {new Date(trade.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div style={styles.footer}>
        <div style={styles.statItem}>
          <span style={{ color: '#00E4FF' }}>🟢</span>
          <span style={styles.statValue}>
            {trades.filter((t) => t.type === 'buy').length}
          </span>
        </div>
        <div style={styles.statItem}>
          <span style={{ color: '#FF3EBF' }}>🔴</span>
          <span style={styles.statValue}>
            {trades.filter((t) => t.type === 'sell').length}
          </span>
        </div>
        <div style={styles.statItem}>
          <span style={{ color: '#FFD700' }}>⚡</span>
          <span style={styles.statValue}>
            {trades.filter((t) => t.type === 'snipe').length}
          </span>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes pulseTrade {
            0% {
              background: rgba(255,62,191,0.3);
              transform: scale(1.02);
            }
            100% {
              background: rgba(255,62,191,0);
              transform: scale(1);
            }
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
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,228,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0,228,255,0.05)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#00E4FF',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  autoScrollToggle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#8899AA',
    cursor: 'pointer',
  },
  tradeList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeRow: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    padding: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  tradeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  tradeData: {
    marginBottom: '6px',
  },
  tradeAmount: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: '2px',
  },
  tradePrice: {
    fontSize: '11px',
    color: '#8899AA',
  },
  tradeFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
  },
  tradeWallet: {
    color: '#9B00FF',
    fontFamily: 'monospace',
  },
  tradeTime: {
    color: '#556677',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(0,228,255,0.2)',
    display: 'flex',
    justifyContent: 'space-around',
    background: 'rgba(0,228,255,0.05)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statValue: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
};

// =============================================
// EXPORTS
// =============================================

export default OrderFlowTape;
