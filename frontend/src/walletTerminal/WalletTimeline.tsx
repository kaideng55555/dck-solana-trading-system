/**
 * WalletTimeline Component (D11)
 * 
 * Slide-up drawer showing all executed trades
 * Features:
 * - Action badges
 * - PnL display
 * - Sniper type indicators
 * - Risk badges
 * - Sound effects on new entries
 */

import React from 'react';
import { useMultiWalletEngine } from './multiWalletEngine';
import { walletTheme } from './walletTheme';
import type { WalletHistoryEntry, Wallet } from './walletTypes';

const { colors, bg, riskColors, animations } = walletTheme;

export const WalletTimeline: React.FC = () => {
  const { wallets, timelineOpen, toggleTimeline } = useMultiWalletEngine();

  // Get all history entries across all wallets
  const allHistory: (WalletHistoryEntry & { walletName: string })[] = (wallets as Wallet[])
    .flatMap((wallet: Wallet) =>
      wallet.history.map((entry: WalletHistoryEntry) => ({
        ...entry,
        walletName: wallet.name,
      }))
    )
    .sort((a: any, b: any) => b.timestamp - a.timestamp)
    .slice(0, 100);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const formatUsd = (val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <>
      <style>
        {`
          ${animations.slideUp}
          ${animations.fadeIn}
          
          .timeline-container {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: ${bg.dark};
            border-top: 2px solid ${colors.pink};
            box-shadow: 0 -4px 20px rgba(255,62,191,0.3);
            z-index: 1000;
            transition: transform 0.3s ease;
            transform: translateY(${timelineOpen ? '0' : '100%'});
          }
          
          .timeline-header {
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          
          .timeline-title {
            font-size: 18px;
            font-weight: 700;
            color: ${colors.cyan};
            text-shadow: 0 0 10px rgba(0,228,255,0.8);
          }
          
          .timeline-close {
            background: rgba(255,0,85,0.2);
            border: 1px solid ${colors.red};
            border-radius: 6px;
            padding: 6px 12px;
            color: ${colors.red};
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.1s ease;
          }
          
          .timeline-close:hover {
            background: rgba(255,0,85,0.4);
            box-shadow: 0 0 12px rgba(255,0,85,0.6);
          }
          
          .timeline-content {
            max-height: 300px;
            overflow-y: auto;
            padding: 12px 20px;
          }
          
          .timeline-entry {
            background: ${bg.card};
            border: 1px solid rgba(155,0,255,0.2);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: fadeIn 0.3s ease;
          }
          
          .timeline-entry:hover {
            border-color: ${colors.cyan};
            box-shadow: 0 0 12px rgba(0,228,255,0.4);
          }
          
          .action-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            flex-shrink: 0;
          }
          
          .risk-badge {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            flex-shrink: 0;
          }
        `}
      </style>

      <div className="timeline-container">
        <div className="timeline-header">
          <div className="timeline-title">📊 Trade Timeline</div>
          <button className="timeline-close" onClick={toggleTimeline}>
            Close
          </button>
        </div>

        <div className="timeline-content">
          {allHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              No trades yet
            </div>
          ) : (
            allHistory.map((entry) => (
              <div key={entry.id} className="timeline-entry">
                <div
                  className="action-badge"
                  style={{
                    background: entry.action === 'SNIPE' ? `linear-gradient(135deg, ${colors.pink}, ${colors.cyan})` : entry.action.includes('BUY') ? `rgba(0,255,85,0.2)` : `rgba(255,0,85,0.2)`,
                    color: entry.action === 'SNIPE' ? '#FFF' : entry.action.includes('BUY') ? colors.green : colors.red,
                    border: `1px solid ${entry.action === 'SNIPE' ? colors.pink : entry.action.includes('BUY') ? colors.green : colors.red}`,
                  }}
                >
                  {entry.action}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF', marginBottom: '4px' }}>
                    {entry.tokenSymbol}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    {entry.walletName} • {formatTime(entry.timestamp)}
                  </div>
                </div>

                {entry.sniperType && (
                  <div style={{ padding: '2px 6px', background: 'rgba(0,228,255,0.2)', border: `1px solid ${colors.cyan}`, borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: colors.cyan }}>
                    {entry.sniperType}
                  </div>
                )}

                <div
                  className="risk-badge"
                  style={{
                    background: `rgba(${riskColors[entry.risk]}, 0.2)`,
                    color: riskColors[entry.risk],
                    border: `1px solid ${riskColors[entry.risk]}`,
                  }}
                >
                  {entry.risk}
                </div>

                {entry.pnl !== null && (
                  <div style={{ fontSize: '14px', fontWeight: 700, color: entry.pnl >= 0 ? colors.green : colors.red, minWidth: '80px', textAlign: 'right' }}>
                    {formatUsd(entry.pnl)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WalletTimeline;
