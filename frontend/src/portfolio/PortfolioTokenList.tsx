/**
 * PortfolioTokenList Component (D12)
 * 
 * Token holdings list with neon graffiti sticker cards
 * Features:
 * - Icon sticker style with glow
 * - Name + symbol graffiti text
 * - Balance, USD value, % of portfolio
 * - 24h PnL with pulse animation
 * - Integrated BUY/SELL buttons
 * - Neon cyan glow on hover
 * - Spray-paint texture fade-in
 */

import React, { useState } from 'react';
import { usePortfolioEngine, formatUSD, formatPercent, formatCompactNumber } from './portfolioEngine';
import { useSwapStore } from '../stores/swapStore';
import { useQuickSnipe } from '../hooks/useQuickSnipe';
import { useSFX } from '../sfx/useSFX';

export const PortfolioTokenList: React.FC = () => {
  const portfolio = usePortfolioEngine();
  const openSwap = useSwapStore((s) => s.openSwap);
  const { openQuickSnipe } = useQuickSnipe();
  const { play } = useSFX();
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);

  const handleBuy = (tokenMint: string, symbol: string) => {
    openSwap(tokenMint, symbol);
    play('alert');
  };

  const handleSell = (tokenMint: string, symbol: string) => {
    openSwap(tokenMint, symbol);
    play('alert');
  };

  const handleSnipe = (tokenMint: string) => {
    openQuickSnipe(tokenMint);
    play('shotgun');
  };

  return (
    <>
      <style>
        {`
          @keyframes pulseGreen {
            0%, 100% {
              color: #00FF55;
              text-shadow: 0 0 15px rgba(0,255,85,0.8);
            }
            50% {
              color: #00FF88;
              text-shadow: 0 0 25px rgba(0,255,85,1);
            }
          }

          @keyframes pulseRed {
            0%, 100% {
              color: #FF3EBF;
              text-shadow: 0 0 15px rgba(255,62,191,0.8);
            }
            50% {
              color: #FF66CC;
              text-shadow: 0 0 25px rgba(255,62,191,1);
            }
          }

          @keyframes sprayTexture {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }

          @keyframes stickerFloat {
            0%, 100% { transform: translateY(0px) rotate(-2deg); }
            50% { transform: translateY(-5px) rotate(2deg); }
          }

          .token-list-container {
            background: #0A0A0F;
            border: 3px solid;
            border-image: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%) 1;
            border-radius: 24px;
            padding: 32px;
          }

          .token-list-title {
            font-size: 28px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            background: linear-gradient(135deg, #9B00FF 0%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 24px;
            text-shadow: 0 0 20px rgba(155,0,255,0.5);
          }

          .token-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .token-sticker-card {
            background: linear-gradient(135deg, rgba(255,62,191,0.05) 0%, rgba(0,228,255,0.05) 100%);
            border: 3px solid rgba(155,0,255,0.3);
            border-radius: 20px;
            padding: 24px;
            display: grid;
            grid-template-columns: auto 1fr auto auto;
            gap: 24px;
            align-items: center;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .token-sticker-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 30% 50%, rgba(255,62,191,0.1) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .token-sticker-card:hover::before {
            opacity: 1;
            animation: sprayTexture 0.5s ease;
          }

          .token-sticker-card:hover {
            border-color: #00E4FF;
            box-shadow: 0 0 30px rgba(0,228,255,0.4);
            transform: scale(1.02);
          }

          .token-icon-sticker {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            border: 3px solid rgba(255,255,255,0.2);
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
            position: relative;
            transition: all 0.3s ease;
          }

          .token-sticker-card:hover .token-icon-sticker {
            animation: stickerFloat 2s ease-in-out infinite;
            box-shadow: 0 0 30px rgba(0,228,255,0.8);
          }

          .token-icon-sticker::after {
            content: '✨';
            position: absolute;
            top: -8px;
            right: -8px;
            font-size: 20px;
            filter: drop-shadow(0 0 8px #FFD700);
          }

          .token-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .token-name-graffiti {
            font-size: 22px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            color: #FFFFFF;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 0 15px rgba(255,255,255,0.5);
          }

          .token-stats-row {
            display: flex;
            gap: 20px;
            font-size: 13px;
          }

          .token-stat {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .token-stat-label {
            color: rgba(255,255,255,0.5);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .token-stat-value {
            color: #FFFFFF;
            font-weight: 600;
          }

          .token-pnl-display {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }

          .token-pnl-value {
            font-size: 20px;
            font-weight: 900;
          }

          .token-pnl-value.positive {
            animation: pulseGreen 2s infinite;
          }

          .token-pnl-value.negative {
            animation: pulseRed 2s infinite;
          }

          .token-pnl-percent {
            font-size: 14px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 8px;
            border: 2px solid;
          }

          .token-pnl-percent.positive {
            color: #00FF55;
            border-color: #00FF55;
            background: rgba(0,255,85,0.1);
          }

          .token-pnl-percent.negative {
            color: #FF3EBF;
            border-color: #FF3EBF;
            background: rgba(255,62,191,0.1);
          }

          .token-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .token-action-btn {
            padding: 10px 20px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            border: 2px solid;
            transition: all 0.3s ease;
            white-space: nowrap;
          }

          .token-action-btn.buy {
            background: linear-gradient(135deg, #00FF55 0%, #00E4FF 100%);
            border-color: #00FF55;
            color: #000;
          }

          .token-action-btn.buy:hover {
            box-shadow: 0 0 20px rgba(0,255,85,0.8);
            transform: translateY(-2px);
          }

          .token-action-btn.sell {
            background: linear-gradient(135deg, #FF3EBF 0%, #FF7A00 100%);
            border-color: #FF3EBF;
            color: #FFF;
          }

          .token-action-btn.sell:hover {
            box-shadow: 0 0 20px rgba(255,62,191,0.8);
            transform: translateY(-2px);
          }

          .token-action-btn.snipe {
            background: linear-gradient(135deg, #00E4FF 0%, #9B00FF 100%);
            border-color: #00E4FF;
            color: #FFF;
          }

          .token-action-btn.snipe:hover {
            box-shadow: 0 0 20px rgba(0,228,255,0.8);
            transform: translateY(-2px);
          }

          .empty-state {
            padding: 60px 20px;
            text-align: center;
            color: rgba(255,255,255,0.5);
            font-size: 18px;
          }

          @media (max-width: 1024px) {
            .token-sticker-card {
              grid-template-columns: auto 1fr;
              gap: 16px;
            }

            .token-pnl-display,
            .token-actions {
              grid-column: 1 / -1;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }
          }
        `}
      </style>

      <div className="token-list-container">
        <h2 className="token-list-title">💎 Token Holdings</h2>

        <div className="token-grid">
          {portfolio.tokenHoldings.length === 0 ? (
            <div className="empty-state">
              No tokens in portfolio yet. Start trading to build your collection!
            </div>
          ) : (
            portfolio.tokenHoldings.map((token) => (
              <div
                key={token.mint}
                className="token-sticker-card"
                onMouseEnter={() => setHoveredToken(token.mint)}
                onMouseLeave={() => setHoveredToken(null)}
              >
                {/* Token Icon Sticker */}
                <div className="token-icon-sticker">
                  {token.symbol.charAt(0)}
                </div>

                {/* Token Info */}
                <div className="token-info">
                  <div className="token-name-graffiti">{token.symbol}</div>
                  <div className="token-stats-row">
                    <div className="token-stat">
                      <div className="token-stat-label">Balance</div>
                      <div className="token-stat-value">
                        {formatCompactNumber(token.balance)}
                      </div>
                    </div>
                    <div className="token-stat">
                      <div className="token-stat-label">Value</div>
                      <div className="token-stat-value">
                        {formatUSD(token.valueUSD)}
                      </div>
                    </div>
                    <div className="token-stat">
                      <div className="token-stat-label">% Portfolio</div>
                      <div className="token-stat-value">
                        {token.percentOfPortfolio.toFixed(2)}%
                      </div>
                    </div>
                    <div className="token-stat">
                      <div className="token-stat-label">Wallets</div>
                      <div className="token-stat-value">
                        {token.wallets.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PnL Display */}
                <div className="token-pnl-display">
                  <div className={`token-pnl-value ${token.pnl24h >= 0 ? 'positive' : 'negative'}`}>
                    {formatUSD(token.pnl24h)}
                  </div>
                  <div className={`token-pnl-percent ${token.pnl24hPercent >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercent(token.pnl24hPercent)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="token-actions">
                  <button
                    className="token-action-btn buy"
                    onClick={() => handleBuy(token.mint, token.symbol)}
                  >
                    🟢 BUY
                  </button>
                  <button
                    className="token-action-btn sell"
                    onClick={() => handleSell(token.mint, token.symbol)}
                  >
                    🔴 SELL
                  </button>
                  <button
                    className="token-action-btn snipe"
                    onClick={() => handleSnipe(token.mint)}
                  >
                    ⚡ SNIPE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default PortfolioTokenList;
