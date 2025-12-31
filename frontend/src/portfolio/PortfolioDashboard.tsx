/**
 * PortfolioDashboard Component (D12)
 * 
 * Graffiti neon main dashboard with spray-paint aesthetics
 * Features:
 * - Total value in neon pink spray text
 * - SOL + USD value
 * - 24h PnL with green/red pulse
 * - Spray tags that animate when PnL changes
 * - 3 graffiti metric cards
 */

import React, { useEffect, useRef } from 'react';
import { usePortfolioEngine, formatUSD, formatSOL, formatPercent } from './portfolioEngine';
import { useSFX } from '../sfx/useSFX';

export const PortfolioDashboard: React.FC = () => {
  const portfolio = usePortfolioEngine();
  const { play } = useSFX();
  const prevPnL = useRef(portfolio.pnl24h);

  // Play sound when PnL changes significantly
  useEffect(() => {
    const pnlDiff = Math.abs(portfolio.pnl24h - prevPnL.current);
    if (pnlDiff > 10 && prevPnL.current !== 0) {
      play(portfolio.pnl24h > prevPnL.current ? 'alert' : 'shotgun');
    }
    prevPnL.current = portfolio.pnl24h;
  }, [portfolio.pnl24h, play]);

  const totalTokens = portfolio.tokenHoldings.length;
  const totalWallets = portfolio.walletSummaries.length;

  return (
    <>
      <style>
        {`
          @keyframes sprayDrip {
            0% { transform: translateY(-20px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(20px); opacity: 0; }
          }

          @keyframes pulsePnL {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }

          @keyframes sprayBurst {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
            100% { transform: scale(1) rotate(360deg); opacity: 0; }
          }

          @keyframes neonFlicker {
            0%, 100% { opacity: 1; text-shadow: 0 0 20px currentColor; }
            50% { opacity: 0.9; text-shadow: 0 0 40px currentColor; }
          }

          .portfolio-dashboard {
            padding: 32px;
            background: #07070A;
            min-height: 100vh;
          }

          .graffiti-header {
            position: relative;
            margin-bottom: 48px;
            padding-bottom: 24px;
            border-bottom: 3px solid transparent;
            border-image: linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%) 1;
          }

          .graffiti-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 20%;
            width: 60px;
            height: 20px;
            background: linear-gradient(180deg, #FF3EBF 0%, transparent 100%);
            border-radius: 50%;
            filter: blur(12px);
            animation: sprayDrip 4s infinite;
          }

          .graffiti-title {
            font-size: 64px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-shadow: 0 0 30px rgba(255,62,191,0.6);
            animation: neonFlicker 3s infinite;
            margin-bottom: 16px;
          }

          .graffiti-subtitle {
            font-size: 18px;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .value-display {
            background: linear-gradient(135deg, rgba(255,62,191,0.15) 0%, rgba(0,228,255,0.15) 100%);
            border: 3px solid #FF3EBF;
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
          }

          .value-display::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,62,191,0.2) 0%, transparent 70%);
            animation: sprayBurst 6s infinite;
          }

          .value-main {
            font-size: 56px;
            font-weight: 900;
            color: #FF3EBF;
            text-shadow: 0 0 30px rgba(255,62,191,0.8), 0 0 60px rgba(255,62,191,0.4);
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
          }

          .value-secondary {
            font-size: 28px;
            color: #00E4FF;
            text-shadow: 0 0 20px rgba(0,228,255,0.6);
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
          }

          .pnl-display {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 24px;
            background: rgba(0,0,0,0.5);
            border-radius: 16px;
            border: 2px solid;
            position: relative;
            z-index: 1;
            width: fit-content;
          }

          .pnl-display.positive {
            border-color: #00FF55;
            animation: pulsePnL 2s infinite;
          }

          .pnl-display.negative {
            border-color: #FF3EBF;
            animation: pulsePnL 2s infinite;
          }

          .pnl-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .pnl-value {
            font-size: 32px;
            font-weight: 700;
          }

          .pnl-value.positive {
            color: #00FF55;
            text-shadow: 0 0 20px rgba(0,255,85,0.8);
          }

          .pnl-value.negative {
            color: #FF3EBF;
            text-shadow: 0 0 20px rgba(255,62,191,0.8);
          }

          .spray-tag {
            display: inline-block;
            padding: 8px 16px;
            background: rgba(155,0,255,0.3);
            border: 2px solid #9B00FF;
            border-radius: 12px;
            color: #9B00FF;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 15px rgba(155,0,255,0.6);
            margin-left: 12px;
          }

          .metric-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
          }

          .metric-card {
            background: #0A0A0F;
            border: 3px solid;
            border-radius: 20px;
            padding: 32px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .metric-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 0 40px rgba(255,62,191,0.6);
          }

          .metric-card.sol {
            border-color: #FF3EBF;
          }

          .metric-card.tokens {
            border-color: #9B00FF;
          }

          .metric-card.profit {
            border-color: #00E4FF;
          }

          .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, currentColor 0%, transparent 100%);
            opacity: 0.05;
            transition: opacity 0.3s ease;
          }

          .metric-card:hover::before {
            opacity: 0.15;
          }

          .metric-icon {
            font-size: 48px;
            margin-bottom: 16px;
            filter: drop-shadow(0 0 15px currentColor);
          }

          .metric-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
            font-weight: 700;
          }

          .metric-value {
            font-size: 40px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            text-shadow: 0 0 20px currentColor;
            color: inherit;
          }

          .graffiti-divider {
            height: 4px;
            background: linear-gradient(90deg, 
              transparent 0%, 
              #FF3EBF 20%, 
              #9B00FF 50%, 
              #00E4FF 80%, 
              transparent 100%
            );
            margin: 32px 0;
            position: relative;
            border-radius: 2px;
            box-shadow: 0 0 20px rgba(255,62,191,0.4);
          }

          .graffiti-divider::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 15px;
            background: linear-gradient(180deg, #9B00FF 0%, transparent 100%);
            border-radius: 50%;
            filter: blur(8px);
          }

          .loading-spray {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 400px;
            font-size: 24px;
            color: #FF3EBF;
            text-shadow: 0 0 20px rgba(255,62,191,0.8);
            animation: neonFlicker 1.5s infinite;
          }
        `}
      </style>

      <div className="portfolio-dashboard">
        {portfolio.loading ? (
          <div className="loading-spray">
            🎨 Loading Portfolio...
          </div>
        ) : (
          <>
            {/* Graffiti Header */}
            <div className="graffiti-header">
              <h1 className="graffiti-title dck-header-drip">💎 PORTFOLIO</h1>
              <div className="graffiti-subtitle">
                {totalWallets} Wallets • {totalTokens} Tokens
              </div>
            </div>

            {/* Main Value Display */}
            <div className="value-display">
              <div className="value-main">{formatUSD(portfolio.totalValueUSD)}</div>
              <div className="value-secondary">{formatSOL(portfolio.totalValueSOL)}</div>
              
              <div className={`pnl-display ${portfolio.pnl24h >= 0 ? 'positive' : 'negative'}`}>
                <div className="pnl-label">24H PnL</div>
                <div className={`pnl-value ${portfolio.pnl24h >= 0 ? 'positive' : 'negative'}`}>
                  {formatUSD(portfolio.pnl24h)}
                </div>
                <div className={`pnl-value ${portfolio.pnl24h >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(portfolio.pnl24hPercent)}
                </div>
                {Math.abs(portfolio.pnl24hPercent) > 10 && (
                  <span className="spray-tag">
                    {portfolio.pnl24h >= 0 ? '🔥 HOT' : '❄️ COLD'}
                  </span>
                )}
              </div>
            </div>

            {/* Graffiti Divider */}
            <div className="graffiti-divider" />

            {/* Metric Cards */}
            <div className="metric-cards">
              <div className="metric-card sol">
                <div className="metric-icon" style={{ color: '#FF3EBF' }}>💰</div>
                <div className="metric-label" style={{ color: '#FF3EBF' }}>Total SOL</div>
                <div className="metric-value" style={{ color: '#FF3EBF' }}>
                  {portfolio.totalValueSOL.toFixed(2)}
                </div>
              </div>

              <div className="metric-card tokens">
                <div className="metric-icon" style={{ color: '#9B00FF' }}>🎨</div>
                <div className="metric-label" style={{ color: '#9B00FF' }}>Total Tokens</div>
                <div className="metric-value" style={{ color: '#9B00FF' }}>
                  {totalTokens}
                </div>
              </div>

              <div className="metric-card profit">
                <div className="metric-icon" style={{ color: portfolio.pnlAllTime >= 0 ? '#00FF55' : '#FF3EBF' }}>
                  {portfolio.pnlAllTime >= 0 ? '📈' : '📉'}
                </div>
                <div className="metric-label" style={{ color: '#00E4FF' }}>Total Profit</div>
                <div className="metric-value" style={{ color: portfolio.pnlAllTime >= 0 ? '#00FF55' : '#FF3EBF' }}>
                  {formatUSD(portfolio.pnlAllTime)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PortfolioDashboard;
