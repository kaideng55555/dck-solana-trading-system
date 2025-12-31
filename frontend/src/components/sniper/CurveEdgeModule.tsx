/**
 * CurveEdgeModule (S2)
 * 
 * Bonding Curve Edge Sniper
 * Targets tokens approaching graduation (90-100% bonding progress)
 * Features velocity tracking, acceleration analysis, and ETA predictions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useCurveEdgeSnipe } from '../../hooks/useCurveEdgeSnipe';
import { SnipeButton } from '../SnipeButton';
import type { CurveEdgeOpportunity } from '../../hooks/useCurveEdgeSnipe';

// =============================================
// TYPES
// =============================================

interface OpportunityRowProps {
  opportunity: CurveEdgeOpportunity;
}

// =============================================
// COMPONENT
// =============================================

export const CurveEdgeModule: React.FC = () => {
  const {
    opportunities,
    startMonitoring,
    stopMonitoring,
    lastUpdated,
  } = useCurveEdgeSnipe();

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring();
    setIsMonitoring(true);

    return () => {
      stopMonitoring();
      setIsMonitoring(false);
    };
  }, [startMonitoring, stopMonitoring]);

  // Update current time every second for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sort opportunities by snipeScore (best first)
  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort((a, b) => b.snipeScore - a.snipeScore);
  }, [opportunities]);

  // Calculate time since last update
  const timeSinceUpdate = lastUpdated
    ? Math.floor((currentTime - lastUpdated) / 1000)
    : null;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={iconStyle}>⚡</span>
          <div>
            <h2 style={titleStyle}>CURVE EDGE SNIPER</h2>
            <p style={subtextStyle}>
              DCK graduation sniper — buys tokens about to leave bonding curve
            </p>
          </div>
        </div>

        {/* Monitoring Status */}
        <div style={statusContainerStyle}>
          <div style={statusDotStyle(isMonitoring)} />
          <span style={statusTextStyle}>
            {isMonitoring ? 'MONITORING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={summaryStyle}>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Opportunities</div>
          <div style={statValueStyle}>{sortedOpportunities.length}</div>
        </div>

        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Last Update</div>
          <div style={statValueStyle}>
            {timeSinceUpdate !== null ? `${timeSinceUpdate}s ago` : 'Never'}
          </div>
        </div>

        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Monitoring Range</div>
          <div style={statValueStyle}>90-100%</div>
        </div>
      </div>

      {/* Opportunities List */}
      <div style={listContainerStyle}>
        {sortedOpportunities.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>📊</div>
            <p style={emptyTextStyle}>No curve edge opportunities detected</p>
            <p style={emptySubtextStyle}>
              Waiting for tokens to reach 90-100% bonding progress...
            </p>
          </div>
        ) : (
          <div style={scrollContainerStyle}>
            {sortedOpportunities.map((opportunity) => (
              <OpportunityRow
                key={opportunity.mint}
                opportunity={opportunity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================
// OPPORTUNITY ROW COMPONENT
// =============================================

const OpportunityRow: React.FC<OpportunityRowProps> = ({ opportunity }) => {
  const {
    mint,
    symbol,
    name,
    progress,
    velocity,
    acceleration,
    confidence,
    etaMinutes,
    recommendation,
    snipeScore,
    riskLevel,
  } = opportunity;

  // Determine recommendation badge
  const getRecommendationBadge = () => {
    const rec = recommendation;
    
    switch (rec) {
      case 'BUY_NOW':
        return { label: 'BUY NOW', color: '#22C55E', glow: 'rgba(34, 197, 94, 0.4)' };
      case 'WAIT':
        return { label: 'WAIT', color: '#EAB308', glow: 'rgba(234, 179, 8, 0.4)' };
      case 'MONITOR':
        return { label: 'MONITOR', color: '#00E4FF', glow: 'rgba(0, 228, 255, 0.4)' };
      case 'AVOID':
        return { label: 'AVOID', color: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' };
      default:
        return { label: 'UNKNOWN', color: '#6B7280', glow: 'rgba(107, 116, 128, 0.4)' };
    }
  };

  // Determine risk color
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return '#22C55E';
      case 'medium':
        return '#EAB308';
      case 'high':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // Determine acceleration indicator
  const getAccelerationIndicator = () => {
    const accel = acceleration;
    
    if (accel > 0.5) {
      return { icon: '↑', color: '#22C55E', label: 'Accelerating' };
    } else if (accel < -0.5) {
      return { icon: '↓', color: '#EF4444', label: 'Decelerating' };
    } else {
      return { icon: '→', color: '#EAB308', label: 'Steady' };
    }
  };

  const badge = getRecommendationBadge();
  const accelIndicator = getAccelerationIndicator();
  const isHighRisk = riskLevel === 'high';
  const isPulsing = recommendation === 'BUY_NOW';

  return (
    <div
      style={{
        ...rowStyle,
        ...(isPulsing ? rowPulsingStyle : {}),
      }}
    >
      {/* Token Info */}
      <div style={tokenInfoContainerStyle}>
        <div style={tokenHeaderStyle}>
          <div>
            <div style={tokenSymbolStyle}>{symbol}</div>
            <div style={tokenNameStyle}>{name}</div>
          </div>

          {/* Recommendation Badge */}
          <div
            style={{
              ...recommendationBadgeStyle,
              background: badge.color,
              boxShadow: `0 0 15px ${badge.glow}`,
              animation: isPulsing ? 'pulse 1.5s infinite' : 'none',
            }}
          >
            {badge.label}
          </div>
        </div>

        {/* Bonding Progress Bar */}
        <div style={progressSectionStyle}>
          <div style={progressLabelRowStyle}>
            <span style={progressLabelStyle}>Bonding Progress</span>
            <span style={progressPercentStyle}>{progress.toFixed(2)}%</span>
          </div>
          <div style={progressBarContainerStyle}>
            <div
              style={{
                ...progressBarFillStyle,
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={metricsGridStyle}>
        {/* Velocity */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Velocity</div>
          <div style={metricValueStyle}>
            {velocity.toFixed(2)}%/min
          </div>
        </div>

        {/* Acceleration */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Acceleration</div>
          <div style={{
            ...metricValueStyle,
            color: accelIndicator.color,
          }}>
            {accelIndicator.icon} {acceleration.toFixed(2)}
          </div>
        </div>

        {/* ETA */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>ETA</div>
          <div style={metricValueStyle}>
            {etaMinutes !== null
              ? `${etaMinutes.toFixed(1)}m`
              : 'N/A'}
          </div>
        </div>

        {/* Confidence */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Confidence</div>
          <div style={metricValueStyle}>
            {(confidence * 100).toFixed(0)}%
          </div>
        </div>

        {/* Snipe Score */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Snipe Score</div>
          <div style={{
            ...metricValueStyle,
            color: snipeScore >= 70 ? '#22C55E' : snipeScore >= 50 ? '#EAB308' : '#EF4444',
            fontWeight: 700,
          }}>
            {snipeScore.toFixed(0)}
          </div>
        </div>

        {/* Risk Level */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Risk</div>
          <div style={{
            ...metricValueStyle,
            color: getRiskColor(),
            fontWeight: 700,
          }}>
            {riskLevel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={actionsContainerStyle}>
        {isHighRisk ? (
          <button style={disabledSnipeButtonStyle} disabled>
            <span style={{ fontSize: '16px' }}>🚫</span>
            <span>SNIPE DISABLED</span>
          </button>
        ) : (
          <SnipeButton tokenMint={mint} createdAt={undefined} />
        )}
      </div>

      {/* High Risk Warning */}
      {isHighRisk && (
        <div style={warningBannerStyle}>
          ⚠️ HIGH RISK - Snipe disabled for safety
        </div>
      )}
    </div>
  );
};

// =============================================
// STYLES
// =============================================

const containerStyle: React.CSSProperties = {
  padding: '24px',
  background: 'rgba(13, 17, 23, 0.8)',
  border: '2px solid rgba(155, 0, 255, 0.3)',
  borderRadius: '16px',
  boxShadow: '0 0 30px rgba(155, 0, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
  minHeight: '500px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '2px solid rgba(155, 0, 255, 0.2)',
};

const titleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconStyle: React.CSSProperties = {
  fontSize: '36px',
  filter: 'drop-shadow(0 0 12px rgba(155, 0, 255, 0.8))',
  animation: 'pulse 2s infinite',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 900,
  background: 'linear-gradient(135deg, #9B00FF, #FF3EBF, #00E4FF)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const subtextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '4px 0 0 0',
};

const statusContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  background: 'rgba(155, 0, 255, 0.1)',
  border: '1px solid rgba(155, 0, 255, 0.3)',
  borderRadius: '12px',
};

const statusDotStyle = (isActive: boolean): React.CSSProperties => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: isActive ? '#22C55E' : '#6B7280',
  boxShadow: isActive ? '0 0 10px rgba(34, 197, 94, 0.6)' : 'none',
  animation: isActive ? 'pulse 2s infinite' : 'none',
});

const statusTextStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const summaryStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

const statBoxStyle: React.CSSProperties = {
  padding: '16px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(155, 0, 255, 0.2)',
  borderRadius: '12px',
  textAlign: 'center',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '8px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#9B00FF',
  textShadow: '0 0 10px rgba(155, 0, 255, 0.5)',
};

const listContainerStyle: React.CSSProperties = {
  minHeight: '350px',
};

const scrollContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxHeight: '600px',
  overflowY: 'auto',
  paddingRight: '8px',
};

const rowStyle: React.CSSProperties = {
  position: 'relative',
  padding: '20px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '2px solid rgba(155, 0, 255, 0.2)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
};

const rowPulsingStyle: React.CSSProperties = {
  border: '2px solid rgba(34, 197, 94, 0.4)',
  boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
  animation: 'pulseGlow 2s infinite',
};

const tokenInfoContainerStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const tokenHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '12px',
};

const tokenSymbolStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#9B00FF',
  textShadow: '0 0 8px rgba(155, 0, 255, 0.5)',
};

const tokenNameStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#9CA3AF',
  marginTop: '4px',
};

const recommendationBadgeStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#FFF',
  borderRadius: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const progressSectionStyle: React.CSSProperties = {
  marginTop: '12px',
};

const progressLabelRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '6px',
};

const progressLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6B7280',
  textTransform: 'uppercase',
};

const progressPercentStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#9B00FF',
};

const progressBarContainerStyle: React.CSSProperties = {
  height: '8px',
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #9B00FF, #FF3EBF, #00E4FF)',
  borderRadius: '4px',
  transition: 'width 0.5s ease',
  boxShadow: '0 0 10px rgba(155, 0, 255, 0.6)',
};

const metricsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '12px',
  marginBottom: '16px',
};

const metricBoxStyle: React.CSSProperties = {
  padding: '12px',
  background: 'rgba(155, 0, 255, 0.05)',
  border: '1px solid rgba(155, 0, 255, 0.2)',
  borderRadius: '8px',
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#6B7280',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const metricValueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#E5E7EB',
  fontFamily: 'monospace',
};

const actionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
};

const disabledSnipeButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: 700,
  background: 'rgba(107, 116, 128, 0.2)',
  border: '2px solid rgba(107, 116, 128, 0.3)',
  borderRadius: '12px',
  color: '#6B7280',
  cursor: 'not-allowed',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  opacity: 0.5,
};

const warningBannerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-10px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '6px 16px',
  fontSize: '11px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
  color: '#FFF',
  borderRadius: '12px',
  boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
  whiteSpace: 'nowrap',
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: '64px',
  marginBottom: '16px',
  opacity: 0.5,
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#9CA3AF',
  marginBottom: '8px',
};

const emptySubtextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6B7280',
  textAlign: 'center',
};

// =============================================
// ANIMATIONS
// =============================================

// Inject animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
    }
  }
`;
document.head.appendChild(style);

// =============================================
// EXPORTS
// =============================================

export default CurveEdgeModule;
