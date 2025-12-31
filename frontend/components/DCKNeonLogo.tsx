import React from 'react';
import { dckNeonTheme } from '../styles/dckNeonTheme';

export const DCKNeonLogo: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Main DCK Text with Neon Graffiti Effect */}
      <div style={{
        fontSize: '32px',
        fontWeight: '900',
        fontFamily: '"Impact", "Arial Black", sans-serif',
        color: dckNeonTheme.colors.neonCyan,
        textShadow: `
          0 0 5px ${dckNeonTheme.colors.neonCyan},
          0 0 10px ${dckNeonTheme.colors.neonCyan},
          0 0 15px ${dckNeonTheme.colors.neonCyan},
          2px 2px 0px ${dckNeonTheme.colors.neonBlue},
          -1px -1px 0px ${dckNeonTheme.colors.neonPink}
        `,
        letterSpacing: '3px',
        transform: 'skew(-5deg)',
        position: 'relative',
        zIndex: 2,
      }}>
        DCK
      </div>
      
      {/* Underline accent */}
      <div style={{
        position: 'absolute',
        bottom: '-4px',
        left: '0',
        width: '100%',
        height: '3px',
        background: `linear-gradient(90deg, ${dckNeonTheme.colors.neonPink}, ${dckNeonTheme.colors.neonCyan})`,
        borderRadius: '2px',
        boxShadow: dckNeonTheme.colors.glowCyan,
      }} />
      
      {/* Side accent marks */}
      <div style={{
        position: 'absolute',
        right: '-8px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: dckNeonTheme.colors.neonPink,
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: dckNeonTheme.colors.glowPink,
      }}>
        ⚡
      </div>
    </div>
  );
};