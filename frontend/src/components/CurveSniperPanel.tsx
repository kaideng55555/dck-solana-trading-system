/**
 * CurveSniperPanel Component
 * 
 * Professional trading panel for curve edge sniping
 * Monitors bonding curve tokens approaching graduation
 * Provides auto-execution and manual snipe controls
 */

import React, { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { useCurveEdgeSniper } from '../sniper/hooks/useCurveEdgeSniper';
import { useCurveEdgeSnipe } from '../hooks/useCurveEdgeSnipe';
import { useQuickSnipe } from '../hooks/useQuickSnipe';
import type { SnipeOpportunity, SnipeExecution } from '../sniper/curveEdgeSniper';
import type { CurveEdgeOpportunity } from '../hooks/useCurveEdgeSnipe';
import { dckNeonTheme } from '../../styles/dckNeonTheme';

// =============================================
// TYPES
// =============================================

interface CurveSniperPanelProps {
  /** Solana connection */
  connection: Connection;
  
  /** Auto-start monitoring on mount */
  autoStart?: boolean;
}

// =============================================
// COMPONENT
// =============================================

export const CurveSniperPanel: React.FC<CurveSniperPanelProps> = ({
  connection,
  autoStart = false,
}) => {
  const {
    opportunities,
    activeExecutions,
    stats,
    isMonitoring,
    config,
    startMonitoring,
    stopMonitoring,
    executeSnipe,
    exitPosition,
    updateConfig,
    getTopOpportunities,
  } = useCurveEdgeSniper({ connection, autoStart });

  // New: Curve Edge Snipe hook for S2 implementation
  const curveEdge = useCurveEdgeSnipe();
  const { openQuickSnipe } = useQuickSnipe();

  const [activeTab, setActiveTab] = useState<'opportunities' | 'curve-edge' | 'positions' | 'stats'>('opportunities');
  const [showConfig, setShowConfig] = useState(false);

  // =============================================
  // RENDER
  // =============================================

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>
            <span style={styles.icon}>🎯</span>
            Curve Edge Sniper
          </h2>
          <div style={styles.status}>
            <span style={{
              ...styles.statusDot,
              background: isMonitoring 
                ? dckNeonTheme.colors.success 
                : dckNeonTheme.colors.textSecondary,
            }} />
            <span style={styles.statusText}>
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={styles.configButton}
            title="Configuration"
          >
            ⚙️
          </button>
          
          {isMonitoring ? (
            <button onClick={stopMonitoring} style={styles.stopButton}>
              🛑 Stop
            </button>
          ) : (
            <button onClick={startMonitoring} style={styles.startButton}>
              ▶️ Start
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div style={styles.configPanel}>
          <h3 style={styles.configTitle}>Configuration</h3>
          
          <div style={styles.configGrid}>
            <div style={styles.configItem}>
              <label style={styles.configLabel}>Min Progress (%)</label>
              <input
                type="number"
                value={config.minProgress}
                onChange={(e) => updateConfig({ minProgress: parseFloat(e.target.value) })}
                style={styles.configInput}
                min={90}
                max={99}
                step={1}
              />
            </div>

            <div style={styles.configItem}>
              <label style={styles.configLabel}>Max Progress (%)</label>
              <input
                type="number"
                value={config.maxProgress}
                onChange={(e) => updateConfig({ maxProgress: parseFloat(e.target.value) })}
                style={styles.configInput}
                min={95}
                max={99.9}
                step={0.1}
              />
            </div>

            <div style={styles.configItem}>
              <label style={styles.configLabel}>Snipe Amount (SOL)</label>
              <input
                type="number"
                value={config.snipeAmount}
                onChange={(e) => updateConfig({ snipeAmount: parseFloat(e.target.value) })}
                style={styles.configInput}
                min={0.01}
                max={100}
                step={0.1}
              />
            </div>

            <div style={styles.configItem}>
              <label style={styles.configLabel}>Stop Loss (%)</label>
              <input
                type="number"
                value={config.stopLoss}
                onChange={(e) => updateConfig({ stopLoss: parseFloat(e.target.value) })}
                style={styles.configInput}
                min={5}
                max={50}
                step={5}
              />
            </div>

            <div style={styles.configItem}>
              <label style={styles.configLabel}>Take Profit (%)</label>
              <input
                type="number"
                value={config.takeProfit}
                onChange={(e) => updateConfig({ takeProfit: parseFloat(e.target.value) })}
                style={styles.configInput}
                min={10}
                max={200}
                step={10}
              />
            </div>

            <div style={styles.configItem}>
              <label style={styles.configLabel}>Auto Execute</label>
              <input
                type="checkbox"
                checked={config.autoExecute}
                onChange={(e) => updateConfig({ autoExecute: e.target.checked })}
                style={styles.configCheckbox}
              />
            </div>

            <div style={styles.configItem}>
              <label style={styles.configLabel}>Use Jito MEV</label>
              <input
                type="checkbox"
                checked={config.useJito}
                onChange={(e) => updateConfig({ useJito: e.target.checked })}
                style={styles.configCheckbox}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Win Rate</span>
          <span style={styles.statValue}>
            {stats.winRate.toFixed(1)}%
          </span>
        </div>
        
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Total PnL</span>
          <span style={{
            ...styles.statValue,
            color: stats.totalPnL >= 0 ? dckNeonTheme.colors.success : dckNeonTheme.colors.danger,
          }}>
            {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(3)} SOL
          </span>
        </div>
        
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Active Positions</span>
          <span style={styles.statValue}>
            {stats.activePositions}
          </span>
        </div>
        
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Total Snipes</span>
          <span style={styles.statValue}>
            {stats.totalSnipes}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('opportunities')}
          style={{
            ...styles.tab,
            ...(activeTab === 'opportunities' ? styles.tabActive : {}),
          }}
        >
          🎯 Opportunities ({opportunities.length})
        </button>
        
        <button
          onClick={() => setActiveTab('curve-edge')}
          style={{
            ...styles.tab,
            ...(activeTab === 'curve-edge' ? styles.tabActive : {}),
          }}
        >
          ⚡ Curve Edge ({curveEdge.opportunities.length})
        </button>
        
        <button
          onClick={() => setActiveTab('positions')}
          style={{
            ...styles.tab,
            ...(activeTab === 'positions' ? styles.tabActive : {}),
          }}
        >
          📊 Positions ({activeExecutions.length})
        </button>
        
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            ...styles.tab,
            ...(activeTab === 'stats' ? styles.tabActive : {}),
          }}
        >
          📈 Stats
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'opportunities' && (
          <OpportunitiesTab
            opportunities={getTopOpportunities(10)}
            onSnipe={executeSnipe}
            autoExecute={config.autoExecute}
          />
        )}
        
        {activeTab === 'curve-edge' && (
          <CurveEdgeTab
            opportunities={curveEdge.opportunities}
            isMonitoring={curveEdge.isMonitoring}
            lastUpdated={curveEdge.lastUpdated}
            onStartMonitoring={curveEdge.startMonitoring}
            onStopMonitoring={curveEdge.stopMonitoring}
            onSnipe={(mint) => {
              openQuickSnipe(mint);
            }}
          />
        )}
        
        {activeTab === 'positions' && (
          <PositionsTab
            executions={activeExecutions}
            onExit={exitPosition}
          />
        )}
        
        {activeTab === 'stats' && (
          <StatsTab stats={stats} />
        )}
      </div>
    </div>
  );
};

// =============================================
// SUB-COMPONENTS
// =============================================

interface OpportunitiesTabProps {
  opportunities: SnipeOpportunity[];
  onSnipe: (opp: SnipeOpportunity) => void;
  autoExecute: boolean;
}

const OpportunitiesTab: React.FC<OpportunitiesTabProps> = ({ opportunities, onSnipe, autoExecute }) => {
  if (opportunities.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>🔍</span>
        <p style={styles.emptyText}>No opportunities detected</p>
        <p style={styles.emptySubtext}>Waiting for tokens approaching graduation...</p>
      </div>
    );
  }

  return (
    <div style={styles.table}>
      {opportunities.map((opp) => (
        <div key={opp.tokenMint} style={styles.opportunityCard}>
          <div style={styles.opportunityHeader}>
            <div>
              <span style={styles.opportunitySymbol}>{opp.symbol}</span>
              <span style={styles.opportunityName}>{opp.name}</span>
            </div>
            <ActionBadge action={opp.action} />
          </div>

          <div style={styles.opportunityStats}>
            <div style={styles.opportunityStat}>
              <span style={styles.opportunityStatLabel}>Progress</span>
              <span style={styles.opportunityStatValue}>
                {opp.bondingProgress.toFixed(2)}%
              </span>
            </div>
            
            <div style={styles.opportunityStat}>
              <span style={styles.opportunityStatLabel}>Velocity</span>
              <span style={styles.opportunityStatValue}>
                {opp.velocity.toFixed(0)}
              </span>
            </div>
            
            <div style={styles.opportunityStat}>
              <span style={styles.opportunityStatLabel}>Risk</span>
              <span style={{
                ...styles.opportunityStatValue,
                color: opp.risk < 30 ? dckNeonTheme.colors.success : 
                       opp.risk < 60 ? dckNeonTheme.colors.warning :
                       dckNeonTheme.colors.danger,
              }}>
                {opp.risk.toFixed(0)}
              </span>
            </div>
            
            <div style={styles.opportunityStat}>
              <span style={styles.opportunityStatLabel}>ETA</span>
              <span style={styles.opportunityStatValue}>
                {formatTime(opp.estimatedGradTime)}
              </span>
            </div>
          </div>

          {!autoExecute && opp.action === 'SNIPE_NOW' && (
            <button
              onClick={() => onSnipe(opp)}
              style={styles.snipeButton}
            >
              🎯 SNIPE NOW
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// =============================================
// CURVE EDGE TAB (S2 Implementation)
// =============================================

interface CurveEdgeTabProps {
  opportunities: CurveEdgeOpportunity[];
  isMonitoring: boolean;
  lastUpdated: number;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onSnipe: (mint: string) => void;
}

const CurveEdgeTab: React.FC<CurveEdgeTabProps> = ({
  opportunities,
  isMonitoring,
  lastUpdated,
  onStartMonitoring,
  onStopMonitoring,
  onSnipe,
}) => {
  // Show monitoring controls if not started
  if (!isMonitoring) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>⚡</span>
        <p style={styles.emptyText}>Curve Edge Monitoring Inactive</p>
        <p style={styles.emptySubtext}>Start monitoring to detect high-velocity tokens approaching graduation</p>
        <button
          onClick={onStartMonitoring}
          style={{
            ...styles.snipeButton,
            maxWidth: '300px',
            marginTop: '16px',
          }}
        >
          ▶️ Start Monitoring
        </button>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>🔍</span>
        <p style={styles.emptyText}>No curve edge opportunities</p>
        <p style={styles.emptySubtext}>
          Scanning for tokens 90-100% with high velocity...
        </p>
        <button
          onClick={onStopMonitoring}
          style={{
            ...styles.exitButton,
            maxWidth: '200px',
            marginTop: '16px',
          }}
        >
          🛑 Stop Monitoring
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with last updated */}
      <div style={styles.curveEdgeHeader}>
        <span style={styles.curveEdgeTitle}>
          Top Opportunities (sorted by snipe score)
        </span>
        <div style={styles.curveEdgeStatus}>
          <span style={styles.statusDot} />
          <span style={styles.statusText}>
            Updated {Math.floor((Date.now() - lastUpdated) / 1000)}s ago
          </span>
          <button
            onClick={onStopMonitoring}
            style={styles.curveEdgeStopBtn}
          >
            🛑
          </button>
        </div>
      </div>

      {/* Opportunity List */}
      <div style={styles.curveEdgeList}>
        {opportunities.map((opp) => (
          <CurveEdgeRow
            key={opp.mint}
            opportunity={opp}
            onSnipe={onSnipe}
          />
        ))}
      </div>
    </div>
  );
};

// =============================================
// CURVE EDGE ROW COMPONENT
// =============================================

interface CurveEdgeRowProps {
  opportunity: CurveEdgeOpportunity;
  onSnipe: (mint: string) => void;
}

const CurveEdgeRow: React.FC<CurveEdgeRowProps> = ({ opportunity, onSnipe }) => {
  const isBuyNow = opportunity.recommendation === 'BUY_NOW';
  const isHighRisk = opportunity.riskLevel === 'high';
  
  // Get acceleration indicator
  const getAccelerationIndicator = (acc: number) => {
    if (acc > 0.1) return { icon: '↑', color: dckNeonTheme.colors.success };
    if (acc < -0.1) return { icon: '↓', color: dckNeonTheme.colors.danger };
    return { icon: '→', color: dckNeonTheme.colors.warning };
  };
  
  const accIndicator = getAccelerationIndicator(opportunity.acceleration);

  return (
    <div
      style={{
        ...styles.curveEdgeRow,
        ...(isBuyNow ? styles.curveEdgeRowHighlight : {}),
        ...(isHighRisk ? styles.curveEdgeRowGrayed : {}),
      }}
    >
      {/* Token Info */}
      <div style={styles.curveEdgeTokenInfo}>
        <div>
          <span style={styles.curveEdgeSymbol}>{opportunity.symbol}</span>
          <span style={styles.curveEdgeName}>{opportunity.name}</span>
        </div>
        <div style={styles.curveEdgeMint}>
          {opportunity.mint.slice(0, 6)}...{opportunity.mint.slice(-4)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.curveEdgeProgress}>
        <div style={styles.curveEdgeProgressLabel}>
          <span>Progress</span>
          <span style={styles.curveEdgeProgressValue}>
            {opportunity.progress.toFixed(2)}%
          </span>
        </div>
        <div style={styles.curveEdgeProgressBar}>
          <div
            style={{
              ...styles.curveEdgeProgressFill,
              width: `${opportunity.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Velocity */}
      <div style={styles.curveEdgeMetric}>
        <span style={styles.curveEdgeMetricLabel}>Velocity</span>
        <span style={styles.curveEdgeMetricValue}>
          {opportunity.velocity.toFixed(2)}%/min
        </span>
      </div>

      {/* Acceleration */}
      <div style={styles.curveEdgeMetric}>
        <span style={styles.curveEdgeMetricLabel}>Accel</span>
        <span style={{ ...styles.curveEdgeMetricValue, color: accIndicator.color }}>
          {accIndicator.icon} {Math.abs(opportunity.acceleration).toFixed(2)}
        </span>
      </div>

      {/* Confidence Badge */}
      <div style={styles.curveEdgeBadge}>
        <span style={styles.curveEdgeBadgeLabel}>Confidence</span>
        <span
          style={{
            ...styles.curveEdgeBadgeValue,
            color:
              opportunity.confidence > 70
                ? dckNeonTheme.colors.success
                : opportunity.confidence > 50
                ? dckNeonTheme.colors.warning
                : dckNeonTheme.colors.danger,
          }}
        >
          {opportunity.confidence}%
        </span>
      </div>

      {/* ETA Badge */}
      <div style={styles.curveEdgeBadge}>
        <span style={styles.curveEdgeBadgeLabel}>ETA</span>
        <span style={styles.curveEdgeBadgeValue}>
          {opportunity.etaMinutes !== null
            ? `${opportunity.etaMinutes}m`
            : '∞'}
        </span>
      </div>

      {/* Risk Badge */}
      <div style={styles.curveEdgeBadge}>
        <span style={styles.curveEdgeBadgeLabel}>Risk</span>
        <span
          style={{
            ...styles.curveEdgeBadgeValue,
            color:
              opportunity.riskLevel === 'low'
                ? dckNeonTheme.colors.success
                : opportunity.riskLevel === 'medium'
                ? dckNeonTheme.colors.warning
                : dckNeonTheme.colors.danger,
          }}
        >
          {opportunity.riskLevel.toUpperCase()}
        </span>
      </div>

      {/* Recommendation */}
      <div style={styles.curveEdgeRecommendation}>
        <RecommendationBadge recommendation={opportunity.recommendation} />
      </div>

      {/* Snipe Button */}
      <button
        onClick={() => onSnipe(opportunity.mint)}
        disabled={isHighRisk}
        style={{
          ...styles.curveEdgeSnipeBtn,
          ...(isBuyNow ? styles.curveEdgeSnipeBtnHighlight : {}),
          ...(isHighRisk ? styles.curveEdgeSnipeBtnDisabled : {}),
        }}
      >
        ⚡ SNIPE NOW
      </button>
    </div>
  );
};

// =============================================
// RECOMMENDATION BADGE
// =============================================

const RecommendationBadge: React.FC<{ recommendation: CurveEdgeOpportunity['recommendation'] }> = ({
  recommendation,
}) => {
  const getBadgeStyle = (rec: typeof recommendation) => {
    switch (rec) {
      case 'BUY_NOW':
        return {
          bg: 'rgba(34,197,94,0.2)',
          border: '#22C55E',
          text: '#22C55E',
          label: '🟢 BUY NOW',
        };
      case 'WAIT':
        return {
          bg: 'rgba(251,191,36,0.2)',
          border: '#FBBF24',
          text: '#FBBF24',
          label: '🟡 WAIT',
        };
      case 'MONITOR':
        return {
          bg: 'rgba(59,130,246,0.2)',
          border: '#3B82F6',
          text: '#3B82F6',
          label: '🔵 MONITOR',
        };
      case 'AVOID':
        return {
          bg: 'rgba(239,68,68,0.2)',
          border: '#EF4444',
          text: '#EF4444',
          label: '🔴 AVOID',
        };
    }
  };

  const badgeStyle = getBadgeStyle(recommendation);

  return (
    <span
      style={{
        padding: '4px 12px',
        fontSize: '11px',
        fontWeight: 700,
        background: badgeStyle.bg,
        border: `1px solid ${badgeStyle.border}`,
        borderRadius: '6px',
        color: badgeStyle.text,
      }}
    >
      {badgeStyle.label}
    </span>
  );
};

interface PositionsTabProps {
  executions: SnipeExecution[];
  onExit: (id: string) => void;
}

const PositionsTab: React.FC<PositionsTabProps> = ({ executions, onExit }) => {
  if (executions.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>📊</span>
        <p style={styles.emptyText}>No active positions</p>
      </div>
    );
  }

  return (
    <div style={styles.table}>
      {executions.map((exec) => (
        <div key={exec.id} style={styles.positionCard}>
          <div style={styles.positionHeader}>
            <span style={styles.positionSymbol}>{exec.symbol}</span>
            <span style={{
              ...styles.positionPnl,
              color: exec.pnlPercent >= 0 ? dckNeonTheme.colors.success : dckNeonTheme.colors.danger,
            }}>
              {exec.pnlPercent >= 0 ? '+' : ''}{exec.pnlPercent.toFixed(2)}%
            </span>
          </div>

          <div style={styles.positionStats}>
            <div style={styles.positionStat}>
              <span style={styles.positionStatLabel}>Entry</span>
              <span style={styles.positionStatValue}>
                ${exec.entryPrice.toFixed(8)}
              </span>
            </div>
            
            <div style={styles.positionStat}>
              <span style={styles.positionStatLabel}>Current</span>
              <span style={styles.positionStatValue}>
                ${exec.currentPrice.toFixed(8)}
              </span>
            </div>
            
            <div style={styles.positionStat}>
              <span style={styles.positionStatLabel}>PnL</span>
              <span style={{
                ...styles.positionStatValue,
                color: exec.pnl >= 0 ? dckNeonTheme.colors.success : dckNeonTheme.colors.danger,
              }}>
                {exec.pnl >= 0 ? '+' : ''}{exec.pnl.toFixed(4)} SOL
              </span>
            </div>
            
            <div style={styles.positionStat}>
              <span style={styles.positionStatLabel}>Duration</span>
              <span style={styles.positionStatValue}>
                {formatDuration(Date.now() - exec.entryTime)}
              </span>
            </div>
          </div>

          <button
            onClick={() => onExit(exec.id)}
            style={styles.exitButton}
          >
            📤 Exit Position
          </button>
        </div>
      ))}
    </div>
  );
};

interface StatsTabProps {
  stats: import('../sniper/curveEdgeSniper').CurveEdgeStats;
}

const StatsTab: React.FC<StatsTabProps> = ({ stats }) => {
  return (
    <div style={styles.statsGrid}>
      <div style={styles.statCard}>
        <span style={styles.statCardLabel}>Total Snipes</span>
        <span style={styles.statCardValue}>{stats.totalSnipes}</span>
      </div>
      
      <div style={styles.statCard}>
        <span style={styles.statCardLabel}>Win Rate</span>
        <span style={styles.statCardValue}>{stats.winRate.toFixed(1)}%</span>
      </div>
      
      <div style={styles.statCard}>
        <span style={styles.statCardLabel}>Total PnL</span>
        <span style={{
          ...styles.statCardValue,
          color: stats.totalPnL >= 0 ? dckNeonTheme.colors.success : dckNeonTheme.colors.danger,
        }}>
          {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(3)} SOL
        </span>
      </div>
      
      <div style={styles.statCard}>
        <span style={styles.statCardLabel}>Avg Profit</span>
        <span style={{
          ...styles.statCardValue,
          color: stats.avgProfit >= 0 ? dckNeonTheme.colors.success : dckNeonTheme.colors.danger,
        }}>
          {stats.avgProfit >= 0 ? '+' : ''}{stats.avgProfit.toFixed(4)} SOL
        </span>
      </div>
      
      <div style={styles.statCard}>
        <span style={styles.statCardLabel}>Largest Win</span>
        <span style={{ ...styles.statCardValue, color: dckNeonTheme.colors.success }}>
          +{stats.largestWin.toFixed(4)} SOL
        </span>
      </div>
      
      <div style={styles.statCard}>
        <span style={styles.statCardLabel}>Largest Loss</span>
        <span style={{ ...styles.statCardValue, color: dckNeonTheme.colors.danger }}>
          {stats.largestLoss.toFixed(4)} SOL
        </span>
      </div>
    </div>
  );
};

const ActionBadge: React.FC<{ action: SnipeOpportunity['action'] }> = ({ action }) => {
  const colors = {
    SNIPE_NOW: { bg: 'rgba(34,197,94,0.2)', border: '#22C55E', text: '#22C55E' },
    MONITOR: { bg: 'rgba(251,191,36,0.2)', border: '#FBBF24', text: '#FBBF24' },
    WAIT: { bg: 'rgba(107,114,128,0.2)', border: '#6B7280', text: '#6B7280' },
    TOO_LATE: { bg: 'rgba(239,68,68,0.2)', border: '#EF4444', text: '#EF4444' },
  }[action];

  return (
    <span style={{
      padding: '4px 12px',
      fontSize: '11px',
      fontWeight: 700,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      color: colors.text,
    }}>
      {action.replace('_', ' ')}
    </span>
  );
};

// =============================================
// HELPERS
// =============================================

function formatTime(seconds: number): string {
  if (seconds === Infinity) return '∞';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// =============================================
// STYLES
// =============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    background: 'rgba(13, 17, 23, 0.8)',
    border: `2px solid ${dckNeonTheme.colors.neonCyan}40`,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: `0 0 30px ${dckNeonTheme.colors.neonCyan}20`,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  headerRight: {
    display: 'flex',
    gap: '12px',
  },

  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
    textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  icon: {
    fontSize: '28px',
  },

  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
  },

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },

  statusText: {
    fontSize: '12px',
    color: dckNeonTheme.colors.textSecondary,
  },

  configButton: {
    padding: '8px 16px',
    background: 'rgba(138,43,226,0.2)',
    border: `2px solid ${dckNeonTheme.colors.neonPurple}40`,
    borderRadius: '8px',
    color: dckNeonTheme.colors.neonPurple,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  startButton: {
    padding: '8px 20px',
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.success}30, ${dckNeonTheme.colors.success}10)`,
    border: `2px solid ${dckNeonTheme.colors.success}`,
    borderRadius: '8px',
    color: dckNeonTheme.colors.success,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  stopButton: {
    padding: '8px 20px',
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.danger}30, ${dckNeonTheme.colors.danger}10)`,
    border: `2px solid ${dckNeonTheme.colors.danger}`,
    borderRadius: '8px',
    color: dckNeonTheme.colors.danger,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  configPanel: {
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },

  configTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
    marginBottom: '16px',
  },

  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },

  configItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },

  configLabel: {
    fontSize: '12px',
    color: dckNeonTheme.colors.textSecondary,
    fontWeight: 600,
  },

  configInput: {
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.4)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}30`,
    borderRadius: '6px',
    color: dckNeonTheme.colors.textMain,
    fontSize: '14px',
  },

  configCheckbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },

  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  statItem: {
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  statLabel: {
    fontSize: '11px',
    color: dckNeonTheme.colors.textSecondary,
    textTransform: 'uppercase' as const,
  },

  statValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
  },

  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
  },

  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: dckNeonTheme.colors.textSecondary,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  tabActive: {
    color: dckNeonTheme.colors.neonCyan,
    borderBottomColor: dckNeonTheme.colors.neonCyan,
  },

  content: {
    minHeight: '400px',
  },

  table: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },

  opportunityCard: {
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
    borderRadius: '12px',
    padding: '16px',
  },

  opportunityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },

  opportunitySymbol: {
    fontSize: '18px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
    marginRight: '12px',
  },

  opportunityName: {
    fontSize: '14px',
    color: dckNeonTheme.colors.textSecondary,
  },

  opportunityStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '12px',
  },

  opportunityStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  opportunityStatLabel: {
    fontSize: '11px',
    color: dckNeonTheme.colors.textSecondary,
  },

  opportunityStatValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: dckNeonTheme.colors.textMain,
  },

  snipeButton: {
    width: '100%',
    padding: '12px',
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.success}30, ${dckNeonTheme.colors.success}10)`,
    border: `2px solid ${dckNeonTheme.colors.success}`,
    borderRadius: '8px',
    color: dckNeonTheme.colors.success,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  positionCard: {
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
    borderRadius: '12px',
    padding: '16px',
  },

  positionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },

  positionSymbol: {
    fontSize: '18px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
  },

  positionPnl: {
    fontSize: '20px',
    fontWeight: 700,
  },

  positionStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '12px',
  },

  positionStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  positionStatLabel: {
    fontSize: '11px',
    color: dckNeonTheme.colors.textSecondary,
  },

  positionStatValue: {
    fontSize: '14px',
    fontWeight: 700,
    color: dckNeonTheme.colors.textMain,
  },

  exitButton: {
    width: '100%',
    padding: '12px',
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.danger}30, ${dckNeonTheme.colors.danger}10)`,
    border: `2px solid ${dckNeonTheme.colors.danger}`,
    borderRadius: '8px',
    color: dckNeonTheme.colors.danger,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },

  statCard: {
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    textAlign: 'center' as const,
  },

  statCardLabel: {
    fontSize: '12px',
    color: dckNeonTheme.colors.textSecondary,
    textTransform: 'uppercase' as const,
  },

  statCardValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },

  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },

  emptyText: {
    fontSize: '18px',
    fontWeight: 600,
    color: dckNeonTheme.colors.textSecondary,
    marginBottom: '8px',
  },

  emptySubtext: {
    fontSize: '14px',
    color: dckNeonTheme.colors.textSecondary,
  },

  // =============================================
  // CURVE EDGE TAB STYLES
  // =============================================

  curveEdgeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
  },

  curveEdgeTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: dckNeonTheme.colors.neonCyan,
    textTransform: 'uppercase' as const,
  },

  curveEdgeStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  curveEdgeStopBtn: {
    padding: '4px 8px',
    background: 'rgba(239,68,68,0.2)',
    border: `1px solid ${dckNeonTheme.colors.danger}`,
    borderRadius: '6px',
    color: dckNeonTheme.colors.danger,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  curveEdgeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },

  curveEdgeRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 0.8fr 0.6fr 0.6fr 1fr 1fr',
    gap: '12px',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}20`,
    borderRadius: '8px',
    padding: '12px',
    transition: 'all 0.2s',
  },

  curveEdgeRowHighlight: {
    background: 'rgba(34,197,94,0.05)',
    border: `2px solid ${dckNeonTheme.colors.success}60`,
    boxShadow: `0 0 20px ${dckNeonTheme.colors.success}30`,
    animation: 'pulse 2s infinite',
  },

  curveEdgeRowGrayed: {
    opacity: 0.5,
    filter: 'grayscale(50%)',
  },

  curveEdgeTokenInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  curveEdgeSymbol: {
    fontSize: '14px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
    marginRight: '8px',
  },

  curveEdgeName: {
    fontSize: '12px',
    color: dckNeonTheme.colors.textSecondary,
  },

  curveEdgeMint: {
    fontSize: '10px',
    color: dckNeonTheme.colors.textSecondary,
    fontFamily: 'monospace',
  },

  curveEdgeProgress: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  curveEdgeProgressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: dckNeonTheme.colors.textSecondary,
  },

  curveEdgeProgressValue: {
    fontSize: '11px',
    fontWeight: 700,
    color: dckNeonTheme.colors.neonCyan,
  },

  curveEdgeProgressBar: {
    width: '100%',
    height: '6px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '3px',
    overflow: 'hidden',
  },

  curveEdgeProgressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${dckNeonTheme.colors.neonCyan}, ${dckNeonTheme.colors.neonPink})`,
    borderRadius: '3px',
    boxShadow: `0 0 10px ${dckNeonTheme.colors.neonCyan}60`,
    transition: 'width 0.3s ease',
  },

  curveEdgeMetric: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },

  curveEdgeMetricLabel: {
    fontSize: '9px',
    color: dckNeonTheme.colors.textSecondary,
    textTransform: 'uppercase' as const,
  },

  curveEdgeMetricValue: {
    fontSize: '12px',
    fontWeight: 700,
    color: dckNeonTheme.colors.textMain,
  },

  curveEdgeBadge: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    textAlign: 'center' as const,
  },

  curveEdgeBadgeLabel: {
    fontSize: '9px',
    color: dckNeonTheme.colors.textSecondary,
    textTransform: 'uppercase' as const,
  },

  curveEdgeBadgeValue: {
    fontSize: '11px',
    fontWeight: 700,
  },

  curveEdgeRecommendation: {
    display: 'flex',
    justifyContent: 'center',
  },

  curveEdgeSnipeBtn: {
    padding: '8px 12px',
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.neonPink}30, ${dckNeonTheme.colors.neonPurple}30)`,
    border: `2px solid ${dckNeonTheme.colors.neonPink}60`,
    borderRadius: '6px',
    color: dckNeonTheme.colors.neonPink,
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },

  curveEdgeSnipeBtnHighlight: {
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.success}40, ${dckNeonTheme.colors.success}20)`,
    border: `2px solid ${dckNeonTheme.colors.success}`,
    color: dckNeonTheme.colors.success,
    boxShadow: `0 0 15px ${dckNeonTheme.colors.success}40`,
  },

  curveEdgeSnipeBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};

// =============================================
// EXPORTS
// =============================================

export default CurveSniperPanel;
