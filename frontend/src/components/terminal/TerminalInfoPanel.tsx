/**
 * TerminalInfoPanel Component
 * 
 * Token information display for trading terminal
 * Features:
 * - Token metrics and stats
 * - Security indicators
 * - Holder distribution
 * - Liquidity info
 */

import React from 'react';
import { dckNeonTheme } from '../../styles/dckNeonTheme';

export const TerminalInfoPanel: React.FC = () => {
  // Mock data - replace with real token data
  const tokenInfo = {
    symbol: 'PEPE',
    name: 'Pepe Token',
    price: 0.0001234,
    marketCap: 1234567,
    liquidity: 234567,
    holders: 1523,
    age: '12m 3d',
  };

  const InfoRow = ({ label, value, color = '#FFFFFF' }: { label: string; value: string | number; color?: string }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid rgba(0,228,255,0.1)',
    }}>
      <span style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '13px',
      }}>
        {label}
      </span>
      <span style={{
        color,
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'monospace',
      }}>
        {value}
      </span>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A0B14 0%, #03040A 100%)',
      border: '1px solid rgba(0,228,255,0.2)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 0 20px rgba(0,228,255,0.1)',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
      }}>
        <div style={{
          color: dckNeonTheme.colors.neonCyan,
          textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '4px',
        }}>
          {tokenInfo.symbol}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px',
        }}>
          {tokenInfo.name}
        </div>
      </div>

      {/* Stats */}
      <InfoRow label="Price" value={`$${tokenInfo.price.toFixed(8)}`} color={dckNeonTheme.colors.neonCyan} />
      <InfoRow label="Market Cap" value={`$${(tokenInfo.marketCap / 1000).toFixed(1)}K`} color={dckNeonTheme.colors.neonPurple} />
      <InfoRow label="Liquidity" value={`$${(tokenInfo.liquidity / 1000).toFixed(1)}K`} color={dckNeonTheme.colors.neonPink} />
      <InfoRow label="Holders" value={tokenInfo.holders.toLocaleString()} />
      <InfoRow label="Age" value={tokenInfo.age} />

      {/* Security indicators */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(0,228,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(0,228,255,0.15)',
      }}>
        <div style={{
          color: dckNeonTheme.colors.neonCyan,
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '8px',
        }}>
          Security Status
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            padding: '4px 8px',
            background: 'rgba(0,228,255,0.2)',
            borderRadius: '4px',
            fontSize: '11px',
            color: dckNeonTheme.colors.neonCyan,
          }}>
            ✓ Mint Renounced
          </span>
          <span style={{
            padding: '4px 8px',
            background: 'rgba(0,228,255,0.2)',
            borderRadius: '4px',
            fontSize: '11px',
            color: dckNeonTheme.colors.neonCyan,
          }}>
            ✓ LP Locked
          </span>
        </div>
      </div>
    </div>
  );
};

export default TerminalInfoPanel;
