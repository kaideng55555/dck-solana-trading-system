/**
 * LpSniperPanel (S4)
 * 
 * LP Event Sniper Panel
 * Monitors liquidity pool events and generates snipe opportunities
 */

import React, { useEffect } from 'react';
import { useLpEventSniper } from '../../hooks/useLpEventSniper';
import { SnipeButton } from '../SnipeButton';
import type { LPOpportunity, LPStatus } from '../../types/lpTypes';

// =============================================
// TYPES
// =============================================

interface LPRowProps {
  opportunity: LPOpportunity;
}

// =============================================
// COMPONENT
// =============================================

export const LpSniperPanel: React.FC = () => {
  const {
    lpOpportunities,
    isMonitoring,
    lastUpdated,
    startMonitoring,
    stopMonitoring,
  } = useLpEventSniper();

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // Calculate time since last update
  const [currentTime, setCurrentTime] = React.useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeSinceUpdate = Math.floor((currentTime - lastUpdated) / 1000);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={iconStyle}>💧</span>
          <div>
            <h2 style={titleStyle}>LP EVENT SNIPER</h2>
            <p style={subtextStyle}>
              Real-time liquidity pool monitoring and snipe opportunities
            </p>
          </div>
        </div>

        {/* Status */}
        <div style={statusContainerStyle}>
          <div style={statusDotStyle(isMonitoring)} />
          <span style={statusTextStyle}>
            {isMonitoring ? 'MONITORING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div style={summaryStyle}>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Opportunities</div>
          <div style={statValueStyle}>{lpOpportunities.length}</div>
        </div>

        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Last Update</div>
          <div style={statValueStyle}>{timeSinceUpdate}s ago</div>
        </div>

        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Safe LP</div>
          <div style={statValueStyle}>
            {lpOpportunities.filter((o) => o.isSafe).length}
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div style={listContainerStyle}>
        {lpOpportunities.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>💧</div>
            <p style={emptyTextStyle}>No LP opportunities detected</p>
            <p style={emptySubtextStyle}>
              Monitoring liquidity pool events...
            </p>
          </div>
        ) : (
          <div style={scrollContainerStyle}>
            {lpOpportunities.map((opportunity) => (
              <LPRow key={opportunity.mint} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================
// LP ROW COMPONENT
// =============================================

const LPRow: React.FC<LPRowProps> = ({ opportunity }) => {
  const {
    mint,
    symbol,
    name,
    lpAmount,
    lpChange1m,
    lpVelocity,
    lpStatus,
    lpScore,
    isSafe,
    recommendation,
    riskLevel,
  } = opportunity;

  // Get LP status color and label
  const getLPStatusBadge = () => {
    const badges: Record<LPStatus, { color: string; glow: string; label: string }> = {
      NEW_LP: { color: '#00E4FF', glow: 'rgba(0, 228, 255, 0.4)', label: '🆕 NEW LP' },
      RE_ADDED: { color: '#9B00FF', glow: 'rgba(155, 0, 255, 0.4)', label: '🔄 RE-ADDED' },
      SURGING: { color: '#22C55E', glow: 'rgba(34, 197, 94, 0.4)', label: '📈 SURGING' },
      LOCKED: { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)', label: '🔒 LOCKED' },
      BURNED: { color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)', label: '🔥 BURNED' },
      DRAINING: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', label: '📉 DRAINING' },
      RUGGED: { color: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)', label: '💀 RUGGED' },
      STABLE: { color: '#6B7280', glow: 'rgba(107, 116, 128, 0.4)', label: '➖ STABLE' },
    };
    return badges[lpStatus];
  };

  // Get recommendation badge
  const getRecommendationBadge = () => {
    switch (recommendation) {
      case 'BUY_NOW':
        return { color: '#22C55E', glow: 'rgba(34, 197, 94, 0.4)', label: 'BUY NOW' };
      case 'WAIT':
        return { color: '#EAB308', glow: 'rgba(234, 179, 8, 0.4)', label: 'WAIT' };
      case 'AVOID':
        return { color: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)', label: 'AVOID' };
    }
  };

  // Get risk color
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return '#22C55E';
      case 'medium':
        return '#EAB308';
      case 'high':
        return '#EF4444';
    }
  };

  const statusBadge = getLPStatusBadge();
  const recBadge = getRecommendationBadge();
  const isHighRisk = riskLevel === 'high';
  const shouldPulse = recommendation === 'BUY_NOW';

  return (
    <div
      style={{
        ...rowStyle,
        ...(shouldPulse ? rowPulsingStyle : {}),
        borderColor: statusBadge.glow,
      }}
    >
      {/* Token Info */}
      <div style={tokenInfoStyle}>
        <div style={tokenHeaderStyle}>
          <div>
            <div style={tokenSymbolStyle}>{symbol}</div>
            <div style={tokenNameStyle}>{name}</div>
          </div>

          {/* Recommendation Badge */}
          <div
            style={{
              ...recommendationBadgeStyle,
              background: recBadge.color,
              boxShadow: `0 0 15px ${recBadge.glow}`,
              animation: shouldPulse ? 'pulse 1.5s infinite' : 'none',
            }}
          >
            {recBadge.label}
          </div>
        </div>
      </div>

      {/* LP Metrics */}
      <div style={metricsGridStyle}>
        {/* LP Amount */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>LP Amount</div>
          <div style={metricValueStyle}>{lpAmount.toFixed(2)} SOL</div>
        </div>

        {/* LP Change */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>LP Change (1m)</div>
          <div
            style={{
              ...metricValueStyle,
              color: lpChange1m >= 0 ? '#22C55E' : '#EF4444',
            }}
          >
            {lpChange1m >= 0 ? '+' : ''}
            {lpChange1m.toFixed(2)} SOL
          </div>
        </div>

        {/* LP Velocity */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Velocity</div>
          <div
            style={{
              ...metricValueStyle,
              color: lpVelocity > 0 ? '#22C55E' : lpVelocity < 0 ? '#EF4444' : '#9CA3AF',
            }}
          >
            {lpVelocity.toFixed(1)}%/min
          </div>
        </div>

        {/* LP Score */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>LP Score</div>
          <div
            style={{
              ...metricValueStyle,
              color:
                lpScore.total >= 70
                  ? '#22C55E'
                  : lpScore.total >= 50
                  ? '#EAB308'
                  : '#EF4444',
              fontWeight: 700,
            }}
          >
            {lpScore.total.toFixed(0)}
          </div>
        </div>

        {/* Risk Level */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Risk</div>
          <div
            style={{
              ...metricValueStyle,
              color: getRiskColor(),
              fontWeight: 700,
            }}
          >
            {riskLevel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Badges Row */}
      <div style={badgesRowStyle}>
        {/* LP Status Badge */}
        <div
          style={{
            ...badgeStyle,
            background: statusBadge.color,
            boxShadow: `0 0 10px ${statusBadge.glow}`,
          }}
        >
          {statusBadge.label}
        </div>

        {/* Safe Badge */}
        {isSafe && (
          <div
            style={{
              ...badgeStyle,
              background: '#22C55E',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)',
            }}
          >
            🛡️ SAFE
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        {isHighRisk || recommendation === 'AVOID' ? (
          <button style={disabledButtonStyle} disabled>
            <span>🚫</span>
            <span>SNIPE DISABLED</span>
          </button>
        ) : (
          <SnipeButton tokenMint={mint} createdAt={undefined} />
        )}
      </div>

      {/* High Risk Warning */}
      {isHighRisk && (
        <div style={warningBannerStyle}>
          ⚠️ HIGH RISK - LP not safe
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
  border: '2px solid rgba(0, 228, 255, 0.3)',
  borderRadius: '16px',
  boxShadow: '0 0 30px rgba(0, 228, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
  minHeight: '500px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '2px solid rgba(0, 228, 255, 0.2)',
};

const titleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconStyle: React.CSSProperties = {
  fontSize: '36px',
  filter: 'drop-shadow(0 0 12px rgba(0, 228, 255, 0.8))',
  animation: 'pulse 2s infinite',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 900,
  background: 'linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF)',
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
  background: 'rgba(0, 228, 255, 0.1)',
  border: '1px solid rgba(0, 228, 255, 0.3)',
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
  border: '1px solid rgba(0, 228, 255, 0.2)',
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
  color: '#00E4FF',
  textShadow: '0 0 10px rgba(0, 228, 255, 0.5)',
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
  border: '2px solid rgba(0, 228, 255, 0.2)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
};

const rowPulsingStyle: React.CSSProperties = {
  border: '2px solid rgba(34, 197, 94, 0.4)',
  boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
  animation: 'pulseGlow 2s infinite',
};

const tokenInfoStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const tokenHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const tokenSymbolStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#00E4FF',
  textShadow: '0 0 8px rgba(0, 228, 255, 0.5)',
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

const metricsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '12px',
  marginBottom: '16px',
};

const metricBoxStyle: React.CSSProperties = {
  padding: '12px',
  background: 'rgba(0, 228, 255, 0.05)',
  border: '1px solid rgba(0, 228, 255, 0.2)',
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

const badgesRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'wrap',
};

const badgeStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#FFF',
  borderRadius: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
};

const disabledButtonStyle: React.CSSProperties = {
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

export default LpSniperPanel;
