import React, { useState } from 'react';
import { dckNeonTheme } from '../styles/dckNeonTheme';

interface Position {
  mintAddress: string;
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface Activity {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  timestamp: number;
}

interface PortfolioAnalyzerProps {
  positions: Position[];
  showPnL?: boolean;
  showActivity?: boolean;
}

// Generate initial activity timestamps outside component
const ONE_HOUR_AGO = Date.now() - 3600000;
const TWO_HOURS_AGO = Date.now() - 7200000;
const COMPONENT_MOUNT_TIME = Date.now();

const PortfolioAnalyzer: React.FC<PortfolioAnalyzerProps> = ({ 
  positions, 
  showPnL = true, 
  showActivity = true 
}) => {
  const [recentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'buy',
      symbol: 'DOGE',
      amount: 1000,
      price: 0.000012,
      timestamp: ONE_HOUR_AGO,
    },
    {
      id: '2',
      type: 'sell',
      symbol: 'PEPE',
      amount: 500,
      price: 0.000025,
      timestamp: TWO_HOURS_AGO,
    },
  ]);

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalValue = positions.reduce((sum, pos) => sum + (pos.amount * pos.currentPrice), 0);

  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(13, 17, 23, 0.95) 0%, rgba(25, 30, 40, 0.95) 100%)',
    border: `2px solid ${dckNeonTheme.colors.neonCyan}30`,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: dckNeonTheme.colors.neonCyan,
    textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
    marginBottom: '16px',
    fontFamily: 'monospace',
  };

  const summaryStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  };

  const statBoxStyle: React.CSSProperties = {
    padding: '12px',
    background: 'rgba(0, 245, 255, 0.05)',
    borderRadius: '8px',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}30`,
  };

  const positionsGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '12px',
    marginBottom: showActivity ? '20px' : '0',
  };

  const positionCardStyle: React.CSSProperties = {
    padding: '12px',
    background: 'rgba(0, 245, 255, 0.05)',
    borderRadius: '8px',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}30`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>📊 Portfolio Tracker</div>

      {showPnL && (
        <div style={summaryStyle}>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Total Value</div>
            <div style={{ fontSize: '18px', color: dckNeonTheme.colors.neonCyan, fontWeight: 'bold' }}>
              ${totalValue.toFixed(2)}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Total PnL</div>
            <div style={{ 
              fontSize: '18px', 
              color: totalPnL >= 0 ? dckNeonTheme.colors.neonCyan : dckNeonTheme.colors.neonPink,
              fontWeight: 'bold',
            }}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Positions</div>
            <div style={{ fontSize: '18px', color: dckNeonTheme.colors.neonCyan, fontWeight: 'bold' }}>
              {positions.length}
            </div>
          </div>
        </div>
      )}

      {positions.length > 0 && (
        <div style={positionsGridStyle}>
          {positions.map(position => (
            <div key={position.mintAddress} style={positionCardStyle}>
              <div>
                <div style={{ 
                  fontSize: '16px', 
                  color: dckNeonTheme.colors.neonCyan,
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}>
                  ${position.symbol}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {position.amount.toFixed(2)} tokens
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '16px',
                  color: position.pnl >= 0 ? dckNeonTheme.colors.neonCyan : dckNeonTheme.colors.neonPink,
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}>
                  {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  ${position.currentPrice.toFixed(8)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showActivity && recentActivity.length > 0 && (
        <div>
          <div style={{ 
            fontSize: '14px', 
            color: '#888',
            marginBottom: '12px',
            fontWeight: 'bold',
          }}>
            Recent Activity
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={{
                padding: '8px 12px',
                background: 'rgba(0, 245, 255, 0.03)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  fontSize: '14px',
                  alignItems: 'center',
                }}>
                  <span style={{
                    color: activity.type === 'buy' ? dckNeonTheme.colors.neonCyan : dckNeonTheme.colors.neonPink,
                    fontWeight: 'bold',
                  }}>
                    {activity.type === 'buy' ? '↗ BUY' : '↘ SELL'}
                  </span>
                  <span style={{ color: dckNeonTheme.colors.neonCyan }}>
                    ${activity.symbol}
                  </span>
                  <span style={{ color: '#888' }}>
                    {activity.amount} @ ${activity.price.toFixed(8)}
                  </span>
                </div>
                <div style={{ color: '#666' }}>
                  {Math.floor((COMPONENT_MOUNT_TIME - activity.timestamp) / 60000)}m ago
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {positions.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
          <div>No positions yet</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Start trading to see your portfolio here
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioAnalyzer;
