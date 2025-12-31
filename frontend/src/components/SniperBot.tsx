/**
 * SniperBot Component
 * 
 * Main sniper bot panel with graffiti-style mode selector
 * Supports 3 modes: Quick Snipe, Curve Edge, MC Trigger
 */

import React, { useState } from 'react';
import { GraffitiModeTabs } from './sniper/GraffitiModeTabs';
import { QuickSnipeModule } from './sniper/QuickSnipeModule';
import { CurveEdgeModule } from './sniper/CurveEdgeModule';
import { MCTriggerModule } from './sniper/MCTriggerModule';

// =============================================
// TYPES
// =============================================

interface SniperBotProps {
  /** Optional: Default mode to start with */
  defaultMode?: 'quick' | 'curve' | 'mc';
  
  /** Optional: Custom styling */
  className?: string;
  style?: React.CSSProperties;
}

// =============================================
// COMPONENT
// =============================================

export const SniperBot: React.FC<SniperBotProps> = ({
  defaultMode = 'quick',
  className,
  style,
}) => {
  const [mode, setMode] = useState<'quick' | 'curve' | 'mc'>(defaultMode);

  const handleModeChange = (newMode: 'quick' | 'curve' | 'mc') => {
    setMode(newMode);
    console.log(`🎯 Sniper mode changed to: ${newMode.toUpperCase()}`);
  };

  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        ...style,
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={titleIconStyle}>🎯</span>
          <h1 style={titleStyle}>DCK$ Sniper Bot</h1>
        </div>
        <div style={statusBadgeStyle}>
          <div style={statusDotStyle} />
          <span style={statusTextStyle}>Active</span>
        </div>
      </div>

      {/* Graffiti Mode Tabs */}
      <div style={tabsContainerStyle}>
        <GraffitiModeTabs mode={mode} onChange={handleModeChange} />
      </div>

      {/* Module Content */}
      <div style={moduleContainerStyle}>
        {mode === 'quick' && <QuickSnipeModule />}
        {mode === 'curve' && <CurveEdgeModule />}
        {mode === 'mc' && <MCTriggerModule />}
      </div>

      {/* Footer Info */}
      <div style={footerStyle}>
        <div style={footerItemStyle}>
          <span style={footerLabelStyle}>Mode:</span>
          <span style={footerValueStyle}>{mode.toUpperCase()}</span>
        </div>
        <div style={footerItemStyle}>
          <span style={footerLabelStyle}>Network:</span>
          <span style={footerValueStyle}>Solana Mainnet</span>
        </div>
        <div style={footerItemStyle}>
          <span style={footerLabelStyle}>Status:</span>
          <span style={{ ...footerValueStyle, color: '#22C55E' }}>Ready</span>
        </div>
      </div>
    </div>
  );
};

// =============================================
// STYLES
// =============================================

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '24px',
  background: 'rgba(13, 17, 23, 0.95)',
  borderRadius: '24px',
  border: '2px solid rgba(0, 228, 255, 0.3)',
  boxShadow: '0 0 40px rgba(0, 228, 255, 0.2), 0 0 60px rgba(255, 62, 191, 0.1)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid rgba(0, 228, 255, 0.2)',
};

const titleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const titleIconStyle: React.CSSProperties = {
  fontSize: '32px',
  filter: 'drop-shadow(0 0 12px rgba(0, 228, 255, 0.6))',
};

const titleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 900,
  background: 'linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 20px rgba(0, 228, 255, 0.3)',
  letterSpacing: '1px',
  margin: 0,
};

const statusBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  background: 'rgba(34, 197, 94, 0.1)',
  border: '1px solid rgba(34, 197, 94, 0.3)',
  borderRadius: '20px',
};

const statusDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#22C55E',
  boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)',
  animation: 'pulse 2s infinite',
};

const statusTextStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#22C55E',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tabsContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
  display: 'flex',
  justifyContent: 'center',
};

const moduleContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
  animation: 'fadeIn 0.3s ease-in',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '16px',
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 228, 255, 0.1)',
};

const footerItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const footerLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const footerValueStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#00E4FF',
};

// =============================================
// EXPORTS
// =============================================

export default SniperBot;
