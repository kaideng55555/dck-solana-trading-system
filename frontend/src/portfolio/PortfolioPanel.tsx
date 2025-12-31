/**
 * PortfolioPanel Component
 * 
 * Live PnL tracker with DCK neon styling
 * Features:
 * - Summary card (total balance, cost, PnL)
 * - Positions table with live updates
 * - Sell button for each position
 * - Color-coded PnL (green/red)
 * - Pulse animations for positive PnL
 * - Shake animations for big negative PnL
 * - Responsive design
 */

import React from 'react';
import { usePortfolioData } from './usePortfolioData';
import { useSwapStore } from '../stores/swapStore';
import { Position } from './portfolioTypes';

export const PortfolioPanel: React.FC = () => {
  const { positions, summary, loading, refresh } = usePortfolioData();
  const { openSwap } = useSwapStore();

  const handleSell = (position: Position) => {
    // Open swap modal: token → SOL
    openSwap(position.mint, 'SOL');
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatAmount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(4);
  };

  return (
    <>
      <style>
        {`
          @keyframes pulseGreen {
            0%, 100% {
              box-shadow: 0 0 15px rgba(0,228,255,0.4);
            }
            50% {
              box-shadow: 0 0 30px rgba(0,228,255,0.8);
            }
          }

          @keyframes shakeRed {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .portfolio-row:hover {
            background: rgba(0,228,255,0.05);
            box-shadow: 0 0 20px rgba(0,228,255,0.2);
          }
        `}
      </style>

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(7,7,10,0.95), rgba(20,10,30,0.95))',
          padding: '20px',
          overflow: 'auto',
        }}
      >
        {/* Summary Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255,62,191,0.1), rgba(155,0,255,0.1), rgba(0,228,255,0.1))',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 10s ease infinite',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF) 1',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 0 30px rgba(0,228,255,0.3)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Total Balance */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  marginBottom: '8px',
                  color: '#00E4FF',
                  textShadow: '0 0 10px rgba(0,228,255,0.8)',
                }}
              >
                🔥 TOTAL BALANCE
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFF',
                  textShadow: '0 0 15px rgba(0,228,255,0.8)',
                }}
              >
                {formatUSD(summary.totalValue)}
              </div>
            </div>

            {/* Total Cost */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  marginBottom: '8px',
                  color: '#9B00FF',
                  textShadow: '0 0 10px rgba(155,0,255,0.8)',
                }}
              >
                💸 TOTAL COST
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFF',
                  textShadow: '0 0 15px rgba(155,0,255,0.8)',
                }}
              >
                {formatUSD(summary.totalCost)}
              </div>
            </div>

            {/* Total PnL */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  marginBottom: '8px',
                  color: '#FF3EBF',
                  textShadow: '0 0 10px rgba(255,62,191,0.8)',
                }}
              >
                📈 TOTAL PnL
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: summary.totalPnl >= 0 ? '#00E4FF' : '#FF3E3E',
                  textShadow: `0 0 15px ${summary.totalPnl >= 0 ? 'rgba(0,228,255,0.8)' : 'rgba(255,62,62,0.8)'}`,
                  animation: summary.totalPnl > 0 ? 'pulseGreen 2s ease-in-out infinite' : 'none',
                }}
              >
                {formatUSD(summary.totalPnl)}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  marginTop: '4px',
                  color: summary.totalPnl >= 0 ? '#00E4FF' : '#FF3E3E',
                }}
              >
                {formatPercent(summary.pnlPercent)}
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, rgba(0,228,255,0.3), rgba(155,0,255,0.3))',
              border: '1px solid rgba(0,228,255,0.5)',
              borderRadius: '8px',
              color: '#00E4FF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Balances'}
          </button>
        </div>

        {/* Positions Table */}
        <div
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            border: '1px solid rgba(0,228,255,0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 120px',
              gap: '12px',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(255,62,191,0.2), rgba(155,0,255,0.2))',
              borderBottom: '2px solid rgba(0,228,255,0.3)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#00E4FF',
              textShadow: '0 0 10px rgba(0,228,255,0.8)',
            }}
          >
            <div>TOKEN</div>
            <div>AMOUNT</div>
            <div>PRICE</div>
            <div>COST BASIS</div>
            <div>VALUE</div>
            <div>PnL</div>
            <div>PnL %</div>
            <div>ACTION</div>
          </div>

          {/* Table Body */}
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {positions.length === 0 ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                }}
              >
                No positions yet. Buy some tokens to see them here!
              </div>
            ) : (
              positions.map((position) => (
                <div
                  key={position.mint}
                  className="portfolio-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 120px',
                    gap: '12px',
                    padding: '16px',
                    borderBottom: '1px solid rgba(0,228,255,0.1)',
                    transition: 'all 0.2s',
                    animation: position.pnl < -100 ? 'shakeRed 0.5s ease-in-out' : 'none',
                  }}
                >
                  {/* Token */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {position.logo && (
                      <img
                        src={position.logo}
                        alt={position.symbol}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '1px solid rgba(0,228,255,0.3)',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
                      {position.symbol}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    {formatAmount(position.amount)}
                  </div>

                  {/* Price */}
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    {formatUSD(position.value / position.amount)}
                  </div>

                  {/* Cost Basis */}
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    {formatUSD(position.costBasis)}
                  </div>

                  {/* Value */}
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#00E4FF' }}>
                    {formatUSD(position.value)}
                  </div>

                  {/* PnL */}
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: position.pnl >= 0 ? '#00E4FF' : '#FF3E3E',
                      textShadow: `0 0 10px ${position.pnl >= 0 ? 'rgba(0,228,255,0.6)' : 'rgba(255,62,62,0.6)'}`,
                    }}
                  >
                    {formatUSD(position.pnl)}
                  </div>

                  {/* PnL % */}
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: position.pnlPercent >= 0 ? '#00E4FF' : '#FF3E3E',
                    }}
                  >
                    {formatPercent(position.pnlPercent)}
                  </div>

                  {/* Sell Button */}
                  <button
                    onClick={() => handleSell(position)}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, rgba(255,62,191,0.3), rgba(255,62,62,0.3))',
                      border: '1px solid rgba(255,62,191,0.5)',
                      borderRadius: '8px',
                      color: '#FF3EBF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,62,191,0.5), rgba(255,62,62,0.5))';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255,62,191,0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,62,191,0.3), rgba(255,62,62,0.3))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    🔴 SELL
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioPanel;
