import React from 'react';
import TradingDashboard from '../../components/TradingDashboard';
import TokenFeed from '../../components/TokenFeed';
import PortfolioAnalyzer from '../../components/PortfolioAnalyzer';
import { LiveMonitoring } from '../../components/LiveMonitoring';

interface MainContentProps {
  section: string;
}

export default function MainContent({ section }: MainContentProps) {
  const mainStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #2FD9FF, #FF41D6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '24px',
  };

  const containerStyle: React.CSSProperties = {
    padding: '32px',
  };

  const renderContent = () => {
    switch (section) {
      case 'dashboard':
        return <TradingDashboard />;
      
      case 'scanner':
        return (
          <div style={containerStyle}>
            <h2 style={sectionTitleStyle}>🔍 Token Scanner</h2>
            <TokenFeed type="newest" title="🌟 New Tokens" />
          </div>
        );
      
      case 'portfolio':
        return (
          <div style={containerStyle}>
            <h2 style={sectionTitleStyle}>💼 Portfolio</h2>
            <PortfolioAnalyzer
              positions={[
                {
                  mintAddress: '7x1g...k9mP',
                  symbol: 'BONK',
                  amount: 1000000,
                  avgBuyPrice: 0.000012,
                  currentPrice: 0.000015,
                  pnl: 30,
                  pnlPercent: 25,
                },
              ]}
              showPnL={true}
              showActivity={true}
            />
          </div>
        );
      
      case 'live-monitor':
        return (
          <div style={containerStyle}>
            <h2 style={sectionTitleStyle}>📡 Live Monitor</h2>
            <LiveMonitoring isConnected={true} />
          </div>
        );
      
      case 'analytics':
      case 'settings':
        return (
          <div style={{
            ...containerStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {section === 'analytics' ? '📊' : '⚙️'}
              </div>
              <p style={{ fontSize: '20px', color: '#2FD9FFB3' }}>
                {section === 'analytics' ? 'Advanced analytics coming soon' : 'Settings coming soon'}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
              <p style={{ fontSize: '24px', color: '#2FD9FF' }}>DCK$ Tools</p>
              <p style={{ fontSize: '14px', color: '#2FD9FF80', marginTop: '8px' }}>
                Select a section to get started
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <main style={mainStyle}>
      {renderContent()}
    </main>
  );
}
