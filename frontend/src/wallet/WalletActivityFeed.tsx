/**
 * WalletActivityFeed Component (D11)
 * 
 * Real-time event feed with animated neon bubbles
 * Features:
 * - Event types: buy, sell, send, receive, snipe, lpEvent, rugBlocked
 * - Animated neon event bubbles
 * - Scrollable 300px panel
 * - Sound effects on new events
 */

import React, { useEffect, useRef } from 'react';
import { useMultiWalletEngine } from '../walletTerminal/multiWalletEngine';
import { useSFX } from '../sfx/useSFX';
import type { WalletHistoryEntry, Wallet } from '../walletTerminal/walletTypes';

interface WalletActivityFeedProps {
  walletId?: string;
}

type EventType = 'buy' | 'sell' | 'send' | 'receive' | 'snipe' | 'lpEvent' | 'rugBlocked' | 'autoSell';

export const WalletActivityFeed: React.FC<WalletActivityFeedProps> = ({ walletId }) => {
  const { wallets } = useMultiWalletEngine();
  const { play } = useSFX();
  const prevCountRef = useRef(0);

  // Get activity for specific wallet or all wallets
  const allActivity: (WalletHistoryEntry & { walletName: string })[] = (wallets as Wallet[])
    .filter((w) => !walletId || w.id === walletId)
    .flatMap((wallet) =>
      wallet.history.map((entry) => ({
        ...entry,
        walletName: wallet.name,
      }))
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  // Play sound on new events
  useEffect(() => {
    if (allActivity.length > prevCountRef.current && prevCountRef.current > 0) {
      const latestEvent = allActivity[0];
      if (latestEvent.action === 'SNIPE') {
        play('shotgun');
      } else if (latestEvent.action === 'BUY' || latestEvent.action === 'SELL') {
        play('alert');
      } else {
        play('alert');
      }
    }
    prevCountRef.current = allActivity.length;
  }, [allActivity.length, play]);

  const getEventIcon = (action: string): string => {
    switch (action) {
      case 'buy':
        return '🟢';
      case 'sell':
        return '🔴';
      case 'send':
        return '📤';
      case 'receive':
        return '📥';
      case 'snipe':
        return '⚡';
      case 'lpEvent':
        return '💧';
      case 'rugBlocked':
        return '🛡️';
      case 'autoSell':
        return '🤖';
      default:
        return '📊';
    }
  };

  const getEventColor = (action: string): string => {
    switch (action) {
      case 'buy':
        return '#00FF55';
      case 'sell':
        return '#FF3EBF';
      case 'snipe':
        return '#00E4FF';
      case 'lpEvent':
        return '#9B00FF';
      case 'rugBlocked':
        return '#FF7A00';
      case 'autoSell':
        return '#FFAA00';
      default:
        return '#FFFFFF';
    }
  };

  const getEventGlow = (action: string): string => {
    const color = getEventColor(action);
    return `0 0 12px ${color}80`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K`;
    return amount.toFixed(4);
  };

  const formatUSD = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <style>
        {`
          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes bubblePulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          .activity-feed-container {
            background: #0A0A0F;
            border: 2px solid rgba(155,0,255,0.3);
            border-radius: 12px;
            max-height: 300px;
            overflow-y: auto;
            padding: 12px;
          }

          .activity-feed-container::-webkit-scrollbar {
            width: 8px;
          }

          .activity-feed-container::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
          }

          .activity-feed-container::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #FF3EBF 0%, #9B00FF 100%);
            border-radius: 4px;
          }

          .activity-item {
            display: flex;
            align-items: start;
            gap: 12px;
            padding: 12px;
            background: #131318;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            margin-bottom: 8px;
            animation: fadeInSlide 0.3s ease;
            transition: all 0.2s ease;
          }

          .activity-item:hover {
            border-color: rgba(0,228,255,0.5);
            transform: translateX(4px);
          }

          .activity-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            animation: bubblePulse 2s infinite;
          }

          .activity-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .activity-action {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .activity-time {
            font-size: 11px;
            color: rgba(255,255,255,0.5);
          }

          .activity-details {
            font-size: 13px;
            color: rgba(255,255,255,0.8);
          }

          .activity-token {
            font-weight: 600;
            color: #00E4FF;
          }

          .activity-amount {
            color: rgba(255,255,255,0.6);
            font-size: 12px;
          }

          .activity-pnl {
            font-size: 12px;
            font-weight: 600;
            margin-top: 4px;
          }

          .activity-pnl.positive {
            color: #00FF55;
          }

          .activity-pnl.negative {
            color: #FF3EBF;
          }

          .activity-badges {
            display: flex;
            gap: 6px;
            margin-top: 6px;
            flex-wrap: wrap;
          }

          .activity-badge {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .activity-badge.sniper {
            background: rgba(0,228,255,0.2);
            color: #00E4FF;
            border: 1px solid #00E4FF;
          }

          .activity-badge.risk {
            background: rgba(255,62,191,0.2);
            color: #FF3EBF;
            border: 1px solid #FF3EBF;
          }

          .activity-badge.clean {
            background: rgba(0,255,85,0.2);
            color: #00FF55;
            border: 1px solid #00FF55;
          }

          .activity-wallet {
            font-size: 11px;
            color: rgba(255,255,255,0.4);
            margin-top: 4px;
          }

          .empty-feed {
            padding: 40px 20px;
            text-align: center;
            color: rgba(255,255,255,0.5);
            font-size: 14px;
          }
        `}
      </style>

      <div className="activity-feed-container">
        {allActivity.length === 0 ? (
          <div className="empty-feed">
            No activity yet. Start trading to see your history!
          </div>
        ) : (
          allActivity.map((activity, idx) => (
            <div key={`${activity.id}-${idx}`} className="activity-item">
              <div
                className="activity-icon"
                style={{
                  boxShadow: getEventGlow(activity.action),
                }}
              >
                {getEventIcon(activity.action)}
              </div>

              <div className="activity-content">
                <div className="activity-header">
                  <div
                    className="activity-action"
                    style={{ color: getEventColor(activity.action) }}
                  >
                    {activity.action}
                  </div>
                  <div className="activity-time">{formatTime(activity.timestamp)}</div>
                </div>

                <div className="activity-details">
                  <span className="activity-token">{activity.tokenSymbol}</span>
                  <span className="activity-amount"> • {formatAmount(activity.amount)}</span>
                  {activity.price && (
                    <span className="activity-amount"> @ {formatUSD(activity.price)}</span>
                  )}
                </div>

                {activity.pnl !== undefined && activity.pnl !== null && (
                  <div className={`activity-pnl ${activity.pnl >= 0 ? 'positive' : 'negative'}`}>
                    PnL: {formatUSD(activity.pnl)} ({activity.pnlPercent?.toFixed(2)}%)
                  </div>
                )}

                <div className="activity-badges">
                  {activity.sniperType && (
                    <div className="activity-badge sniper">{activity.sniperType}</div>
                  )}
                  {activity.risk && (
                    <div className={`activity-badge ${activity.risk.toLowerCase()}`}>
                      {activity.risk}
                    </div>
                  )}
                  {activity.confidence !== undefined && activity.confidence !== null && activity.confidence > 0.8 && (
                    <div className="activity-badge clean">High Confidence</div>
                  )}
                </div>

                {!walletId && (
                  <div className="activity-wallet">Wallet: {activity.walletName}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default WalletActivityFeed;
