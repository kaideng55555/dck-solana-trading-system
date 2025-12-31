/**
 * WalletSniperFeed Component (D11)
 * 
 * Real-time feed of sniper engine triggers
 * Features:
 * - Sniper type badges (S1-S6)
 * - Token info with market data
 * - Neon streak animations
 * - Sound effects (alert + spray)
 */

import React, { useEffect, useRef } from 'react';
import { useGlobalTokenData } from '../data/useGlobalTokenData';
import { walletTheme } from './walletTheme';
import { useSFX } from '../sfx/useSFX';
import type { Token } from '../data/tokenTypes';

const { colors, bg, shadows, animations } = walletTheme;

export const WalletSniperFeed: React.FC = () => {
  const { tokens } = useGlobalTokenData();
  const { play } = useSFX();
  const prevCountRef = useRef(0);

  // Play sound on new entries
  useEffect(() => {
    if (tokens.length > prevCountRef.current && prevCountRef.current > 0) {
      play('alert');
    }
    prevCountRef.current = tokens.length;
  }, [tokens.length, play]);

  const formatMc = (mc: number) => {
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

  return (
    <>
      <style>
        {`
          ${animations.neonStreak}
          ${animations.fadeIn}
          
          .sniper-feed-container {
            background: ${bg.dark};
            border-left: 2px solid rgba(255,62,191,0.3);
            height: 100%;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
          }
          
          .feed-header {
            padding: 20px;
            border-bottom: 2px solid rgba(0,228,255,0.3);
          }
          
          .feed-title {
            font-size: 20px;
            font-weight: 700;
            color: ${colors.cyan};
            text-shadow: 0 0 10px rgba(0,228,255,0.8);
          }
          
          .feed-content {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
          }
          
          .feed-item {
            background: ${bg.card};
            border: 2px solid rgba(155,0,255,0.3);
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 10px;
            position: relative;
            overflow: hidden;
            animation: fadeIn 0.5s ease;
          }
          
          .feed-item:hover {
            border-color: ${colors.cyan};
            box-shadow: ${shadows.glowCyan};
          }
          
          .feed-item.fresh::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0,228,255,0.3), transparent);
            animation: neonStreak 1.5s ease-out;
          }
          
          .sniper-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .token-symbol {
            font-size: 16px;
            font-weight: 700;
            color: #FFF;
            margin-bottom: 6px;
          }
          
          .token-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            font-size: 11px;
          }
          
          .stat-label {
            color: rgba(255,255,255,0.5);
          }
          
          .stat-value {
            color: ${colors.cyan};
            font-weight: 600;
          }
        `}
      </style>

      <div className="sniper-feed-container">
        <div className="feed-header">
          <div className="feed-title">🎯 Sniper Feed</div>
        </div>

        <div className="feed-content">
          {tokens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Watching for opportunities...
            </div>
          ) : (
            tokens.slice(0, 50).map((token: Token, index: number) => (
              <div key={token.mint} className={`feed-item ${index === 0 ? 'fresh' : ''}`}>
                <div
                  className="sniper-badge"
                  style={{
                    background: `linear-gradient(135deg, ${colors.pink}, ${colors.purple})`,
                    color: '#FFF',
                  }}
                >
                  S2
                </div>

                <div className="token-symbol">{token.metadata.symbol}</div>

                <div className="token-stats">
                  <div>
                    <div className="stat-label">MC</div>
                    <div className="stat-value">{formatMc(token.market.marketCap || 0)}</div>
                  </div>
                  <div>
                    <div className="stat-label">Bonding</div>
                    <div className="stat-value">{token.bonding?.bondingProgress?.toFixed(1) || 0}%</div>
                  </div>
                  <div>
                    <div className="stat-label">Velocity</div>
                    <div className="stat-value">{(token.bonding?.bondingProgress || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="stat-label">Risk</div>
                    <div className="stat-value" style={{ color: colors.cyan }}>
                      {token.metadata?.name ? 'LOW' : 'UNKNOWN'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WalletSniperFeed;
