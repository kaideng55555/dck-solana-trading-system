import React, { useState } from 'react';
import { dckNeonTheme } from '../styles/dckNeonTheme';
import TokenFeed from './TokenFeed';
import PortfolioAnalyzer from './PortfolioAnalyzer';
import { DCKHeader } from './DCKHeader';
import DCKTradingChart from './DCKTradingChart';

interface Tab {
  id: string;
  label: string;
  category: string;
}

const TradingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs: Tab[] = [
    { id: 'dashboard', label: '🏠 Dashboard', category: 'Core' },
    { id: 'scanner', label: '🔍 Token Scanner', category: 'Core' },
    { id: 'monitor', label: '📡 Live Monitor', category: 'Tools' },
    { id: 'portfolio', label: '💼 Portfolio', category: 'Tools' },
    { id: 'analytics', label: '📈 Analytics', category: 'Data' },
  ];

  // Mock portfolio data
  const mockPositions = [
    {
      mintAddress: '7x1g...k9mP',
      symbol: 'BONK',
      amount: 1000000,
      avgBuyPrice: 0.000012,
      currentPrice: 0.000015,
      pnl: 30,
      pnlPercent: 25,
    },
    {
      mintAddress: '9Zk2...m3nQ',
      symbol: 'SAMO',
      amount: 5000,
      avgBuyPrice: 0.0085,
      currentPrice: 0.0092,
      pnl: 35,
      pnlPercent: 8.2,
    },
  ];

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0D1117 0%, #1a1f2e 50%, #0D1117 100%)',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '16px 20px',
    background: 'rgba(13, 17, 23, 0.95)',
    borderBottom: `2px solid ${dckNeonTheme.colors.neonCyan}30`,
    overflowX: 'auto',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: `2px solid ${isActive ? dckNeonTheme.colors.neonCyan : 'transparent'}`,
    background: isActive 
      ? `linear-gradient(135deg, ${dckNeonTheme.colors.neonCyan}20, ${dckNeonTheme.colors.neonPink}20)`
      : 'rgba(0, 245, 255, 0.05)',
    color: isActive ? dckNeonTheme.colors.neonCyan : '#888',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    boxShadow: isActive ? `0 0 20px ${dckNeonTheme.colors.neonCyan}40` : 'none',
    textShadow: isActive ? dckNeonTheme.textEffects.neonGlow.textShadow : 'none',
  });

  const contentStyle: React.CSSProperties = {
    padding: '20px',
  };

  const dashboardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    height: 'calc(100vh - 200px)',
  };

  return (
    <div style={containerStyle}>
      <DCKHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Navigation Tabs */}
      <div style={navStyle}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={tabButtonStyle(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.borderColor = `${dckNeonTheme.colors.neonCyan}60`;
                e.currentTarget.style.color = dckNeonTheme.colors.neonCyan;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = '#888';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={contentStyle}>
        {activeTab === 'dashboard' && (
          <div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: dckNeonTheme.colors.neonCyan,
              textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
              marginBottom: '24px',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}>
              ⚡ DCK TRADING TERMINAL
            </div>

            {/* Trading Chart */}
            <section style={{ marginBottom: '24px' }}>
              <DCKTradingChart pairSlug="SOL/USDC" />
            </section>

            {/* Portfolio Summary */}
            <PortfolioAnalyzer
              positions={mockPositions}
              showPnL={true}
              showActivity={true}
            />

            {/* 3-Column Token Feeds */}
            <div style={dashboardGridStyle}>
              <TokenFeed type="newest" title="🌟 New Creations" />
              <TokenFeed type="bonding" title="🚀 About to Graduate" />
              <TokenFeed type="graduated" title="✅ Graduated" />
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>Token Scanner</div>
            <div>Advanced token discovery and analysis coming soon</div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📡</div>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>Live Monitor</div>
            <div>Real-time monitoring dashboard coming soon</div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: dckNeonTheme.colors.neonCyan,
              textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
              marginBottom: '24px',
            }}>
              💼 Portfolio Management
            </div>
            <PortfolioAnalyzer
              positions={mockPositions}
              showPnL={true}
              showActivity={true}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>Analytics</div>
            <div>Advanced analytics and insights coming soon</div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TradingDashboard;
