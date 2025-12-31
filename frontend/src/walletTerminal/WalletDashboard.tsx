/**
 * WalletDashboard Component (D11)
 * 
 * Cyberpunk trading terminal center panel
 * Features:
 * - Summary widgets (4 cards)
 * - PnL heatmap grid
 * - Portfolio table with quick actions
 */

import React from 'react';
import { useMultiWalletEngine } from './multiWalletEngine';
import { useSwapStore } from '../stores/swapStore';
import { useQuickSnipe } from '../hooks/useQuickSnipe';
import { walletTheme } from './walletTheme';

const { colors, bg, gradients, shadows } = walletTheme;

export const WalletDashboard: React.FC = () => {
  const { summary, activeWallet } = useMultiWalletEngine();
  const openSwap = useSwapStore((s) => s.openSwap);
  const { openQuickSnipe } = useQuickSnipe();

  const formatUsd = (val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', height: '100%', overflow: 'auto', background: bg.dark }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <SummaryCard
          icon="💰"
          title="Total Balance"
          value={formatUsd(summary.totalBalance)}
          gradient={gradients.neonPrimary}
        />
        <SummaryCard
          icon="📈"
          title="Total PnL"
          value={formatUsd(summary.totalPnl)}
          subtitle={formatPercent(summary.totalPnlPercent)}
          gradient={summary.totalPnl >= 0 ? gradients.success : gradients.danger}
        />
        <SummaryCard
          icon="🏆"
          title="Best Wallet"
          value={summary.bestWalletId ? `Wallet ${summary.bestWalletId.slice(7, 11)}` : 'N/A'}
          gradient={gradients.warning}
        />
        <SummaryCard
          icon="⚡"
          title="Last Snipe"
          value={summary.lastSnipe?.tokenSymbol || 'N/A'}
          subtitle={summary.lastSnipe ? formatUsd(summary.lastSnipe.pnl || 0) : ''}
          gradient={gradients.neonReverse}
        />
      </div>

      {/* Portfolio Table */}
      {activeWallet && (
        <div style={{ background: bg.card, borderRadius: '12px', border: `2px solid rgba(155,0,255,0.3)`, padding: '20px' }}>
          <h2 style={{ color: colors.cyan, fontSize: '20px', fontWeight: 700, marginBottom: '16px', textShadow: shadows.textGlow }}>
            💼 {activeWallet.name} Portfolio
          </h2>
          
          {activeWallet.history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
              No trades yet
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid rgba(255,62,191,0.3)` }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: colors.pink, fontSize: '12px', fontWeight: 700 }}>ACTION</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: colors.pink, fontSize: '12px', fontWeight: 700 }}>TOKEN</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: colors.pink, fontSize: '12px', fontWeight: 700 }}>AMOUNT</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: colors.pink, fontSize: '12px', fontWeight: 700 }}>PRICE</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: colors.pink, fontSize: '12px', fontWeight: 700 }}>PnL</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: colors.pink, fontSize: '12px', fontWeight: 700 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWallet.history.slice(0, 20).map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', color: '#FFF', fontSize: '13px', fontWeight: 600 }}>{entry.action}</td>
                      <td style={{ padding: '12px', color: colors.cyan, fontSize: '13px' }}>{entry.tokenSymbol}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#FFF', fontSize: '13px' }}>{entry.amount.toFixed(4)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#FFF', fontSize: '13px' }}>{formatUsd(entry.price)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: (entry.pnl || 0) >= 0 ? colors.green : colors.red, fontSize: '13px', fontWeight: 700 }}>
                        {entry.pnl ? formatUsd(entry.pnl) : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={() => openSwap('So11111111111111111111111111111111111111112', entry.tokenMint)}
                            style={{ padding: '4px 8px', fontSize: '11px', background: gradients.success, border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#FFF', fontWeight: 600 }}
                          >
                            🟢 Buy
                          </button>
                          <button
                            onClick={() => openSwap(entry.tokenMint, 'So11111111111111111111111111111111111111112')}
                            style={{ padding: '4px 8px', fontSize: '11px', background: gradients.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#FFF', fontWeight: 600 }}
                          >
                            🔴 Sell
                          </button>
                          <button
                            onClick={() => openQuickSnipe(entry.tokenMint)}
                            style={{ padding: '4px 8px', fontSize: '11px', background: gradients.neonPrimary, border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#FFF', fontWeight: 600 }}
                          >
                            ⚡ Snipe
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================
// SUMMARY CARD
// =============================================

interface SummaryCardProps {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  gradient: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, subtitle, gradient }) => (
  <div
    style={{
      background: bg.card,
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid rgba(0,228,255,0.3)',
      boxShadow: shadows.glowCyan,
    }}
  >
    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 700, background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
      {value}
    </div>
    {subtitle && (
      <div style={{ fontSize: '14px', color: colors.cyan, fontWeight: 600 }}>{subtitle}</div>
    )}
  </div>
);

export default WalletDashboard;
