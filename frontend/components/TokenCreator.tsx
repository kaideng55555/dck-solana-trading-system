import React from 'react';
import { dckNeonTheme } from '../styles/dckNeonTheme';

export const TokenCreator: React.FC = () => {
  return (
    <div style={{
      padding: '16px',
      background: dckNeonTheme.colors.bgCard,
      border: `1px solid ${dckNeonTheme.colors.border}`,
      borderRadius: '12px',
      minHeight: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: dckNeonTheme.colors.textSecondary,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🪙</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Token Creator</div>
        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
          Create and deploy custom Solana tokens
        </div>
      </div>
    </div>
  );
};

export default TokenCreator;
