import React, { useState } from 'react';
import { dckTheme, dckStyles } from '../styles/dckTheme';

interface DCKHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DCKHeader: React.FC<DCKHeaderProps> = ({ activeTab, onTabChange }) => {
  const [isConnected, setIsConnected] = useState(false);

  const tabs = [
    { id: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
    { id: 'analysis', label: '🔍 Token Scanner', icon: '🔍' },
    { id: 'monitoring', label: '📊 Live Feed', icon: '📊' },
    { id: 'portfolio', label: '💰 Portfolio', icon: '💰' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  return (
    <header style={dckStyles.header}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* DCK Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: dckTheme.colors.gradientPrimary,
            borderRadius: '12px',
            padding: '8px 16px',
            fontWeight: 'bold',
            fontSize: '20px',
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            DCK
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              background: dckTheme.colors.gradientPrimary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Tools Cop
            </h1>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: dckTheme.colors.textMuted,
              fontWeight: '500',
            }}>
              Solana Token Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '4px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                ...dckStyles.tab,
                ...(activeTab === tab.id ? dckStyles.tabActive : {}),
                borderRadius: dckTheme.borderRadius.sm,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = `${dckTheme.colors.primary}08`;
                  e.currentTarget.style.color = dckTheme.colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = dckTheme.colors.textSecondary;
                }
              }}
            >
              <span style={{ marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Connection Status & Wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Network Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: dckTheme.colors.bgAccent,
            borderRadius: dckTheme.borderRadius.sm,
            border: `1px solid ${dckTheme.colors.border}`,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? dckTheme.colors.success : dckTheme.colors.danger,
              boxShadow: isConnected ? dckTheme.shadows.glow : dckTheme.shadows.glowDanger,
            }} />
            <span style={{
              fontSize: '12px',
              color: dckTheme.colors.textSecondary,
              fontWeight: '500',
            }}>
              {isConnected ? 'Solana Mainnet' : 'Disconnected'}
            </span>
          </div>

          {/* Wallet Connect Button */}
          <button
            onClick={() => setIsConnected(!isConnected)}
            style={{
              ...dckStyles.button,
              padding: '10px 20px',
              fontSize: '13px',
              background: isConnected ? dckTheme.colors.bgAccent : dckTheme.colors.gradientPrimary,
              border: isConnected ? `1px solid ${dckTheme.colors.border}` : 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = isConnected ? dckTheme.shadows.md : dckTheme.shadows.glow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isConnected ? (
              <>
                <span style={{ marginRight: '8px' }}>👤</span>
                7x1g...k9mP
              </>
            ) : (
              <>
                <span style={{ marginRight: '8px' }}>🔗</span>
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};