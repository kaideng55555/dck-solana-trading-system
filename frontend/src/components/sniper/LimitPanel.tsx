/**
 * LimitPanel (S5)
 * 
 * Smart Limit Trading Panel
 * Create automated BUY/SELL rules with conditions
 */

import React, { useState, useEffect } from 'react';
import { useLimitTrader } from '../../hooks/useLimitTrader';
import type {
  LimitRule,
  LimitAction,
  TriggerType,
  LimitCondition,
  LimitExecution,
} from '../../types/limitTypes';

// =============================================
// COMPONENT
// =============================================

export const LimitPanel: React.FC = () => {
  const {
    rules,
    executions,
    isMonitoring,
    lastUpdated,
    addRule,
    removeRule,
    toggleRule,
    startMonitoring,
    stopMonitoring,
    forceTrigger,
  } = useLimitTrader();

  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeRules = rules.filter((r) => r.status === 'ACTIVE');
  const triggeredRules = rules.filter((r) => r.status === 'TRIGGERED');

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={iconStyle}>🎯</span>
          <div>
            <h2 style={titleStyle}>SMART LIMITS</h2>
            <p style={subtextStyle}>
              Automated buy/sell rules with price, MC, LP, and velocity triggers
            </p>
          </div>
        </div>

        {/* Monitoring Controls */}
        <div style={controlsStyle}>
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            style={isMonitoring ? stopButtonStyle : startButtonStyle}
          >
            {isMonitoring ? '🛑 STOP' : '▶️ START'}
          </button>

          <div style={statusContainerStyle}>
            <div style={statusDotStyle(isMonitoring)} />
            <span style={statusTextStyle}>
              {isMonitoring ? 'MONITORING' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={summaryStyle}>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Total Rules</div>
          <div style={statValueStyle}>{rules.length}</div>
        </div>

        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Active</div>
          <div style={{ ...statValueStyle, color: '#22C55E' }}>
            {activeRules.length}
          </div>
        </div>

        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Triggered</div>
          <div style={{ ...statValueStyle, color: '#EF4444' }}>
            {triggeredRules.length}
          </div>
        </div>

        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Executions</div>
          <div style={statValueStyle}>{executions.length}</div>
        </div>
      </div>

      {/* New Rule Button */}
      <div style={actionBarStyle}>
        <button
          onClick={() => setShowRuleBuilder(!showRuleBuilder)}
          style={newRuleButtonStyle}
        >
          <span>➕</span>
          <span>NEW RULE</span>
        </button>
      </div>

      {/* Rule Builder */}
      {showRuleBuilder && (
        <RuleBuilder
          onClose={() => setShowRuleBuilder(false)}
          onSave={(rule) => {
            addRule(rule);
            setShowRuleBuilder(false);
          }}
        />
      )}

      {/* Rules List */}
      <div style={sectionTitleStyle}>Active Rules</div>
      <div style={rulesContainerStyle}>
        {rules.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>🎯</div>
            <p style={emptyTextStyle}>No limit rules created</p>
            <p style={emptySubtextStyle}>
              Click "NEW RULE" to create your first automated trade
            </p>
          </div>
        ) : (
          <div style={scrollContainerStyle}>
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                currentTime={currentTime}
                onToggle={(enabled) => toggleRule(rule.id, enabled)}
                onRemove={() => removeRule(rule.id)}
                onForceTrigger={() => forceTrigger(rule.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Execution Log */}
      {executions.length > 0 && (
        <>
          <div style={sectionTitleStyle}>Recent Executions</div>
          <div style={logContainerStyle}>
            {executions.slice(-10).reverse().map((exec) => (
              <ExecutionRow key={exec.id} execution={exec} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// =============================================
// RULE BUILDER COMPONENT
// =============================================

interface RuleBuilderProps {
  onClose: () => void;
  onSave: (rule: LimitRule) => void;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [action, setAction] = useState<LimitAction>('BUY');
  const [amount, setAmount] = useState(1);
  const [tokenMint, setTokenMint] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('PRICE_BELOW');
  const [triggerValue, setTriggerValue] = useState(0);
  const [requireLpLocked, setRequireLpLocked] = useState(false);
  const [requireAuthorityRenounced, setRequireAuthorityRenounced] = useState(false);
  const [requireSafeBonding, setRequireSafeBonding] = useState(true);

  const handleSave = () => {
    const condition: LimitCondition = {
      tokenMint,
      trigger: triggerType,
      value: triggerValue,
    };

    const rule: LimitRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || `${action} ${triggerType}`,
      action,
      amount,
      condition,
      requireLpLocked,
      requireAuthorityRenounced,
      requireSafeBonding,
      enabled: true,
      status: 'ACTIVE',
      createdAt: Date.now(),
      triggerCount: 0,
    };

    onSave(rule);
  };

  return (
    <div style={builderContainerStyle}>
      <div style={builderHeaderStyle}>
        <h3 style={builderTitleStyle}>Create New Rule</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          ✕
        </button>
      </div>

      <div style={builderContentStyle}>
        {/* Rule Name */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Rule Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Buy SOL Dip"
            style={inputStyle}
          />
        </div>

        {/* Token Mint */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Token Mint Address</label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Enter Solana token mint address"
            style={inputStyle}
          />
        </div>

        {/* Action */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Action</label>
          <div style={segmentedControlStyle}>
            <button
              onClick={() => setAction('BUY')}
              style={{
                ...segmentButtonStyle,
                ...(action === 'BUY' ? segmentActiveStyle : {}),
              }}
            >
              📈 BUY
            </button>
            <button
              onClick={() => setAction('SELL')}
              style={{
                ...segmentButtonStyle,
                ...(action === 'SELL' ? segmentActiveStyle : {}),
              }}
            >
              📉 SELL
            </button>
          </div>
        </div>

        {/* Trigger Type */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Trigger Condition</label>
          <select
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
            style={selectStyle}
          >
            <option value="PRICE_BELOW">Price Below</option>
            <option value="PRICE_ABOVE">Price Above</option>
            <option value="MC_BELOW">Market Cap Below</option>
            <option value="MC_ABOVE">Market Cap Above</option>
            <option value="PERCENT_UP">Price Up %</option>
            <option value="PERCENT_DOWN">Price Down %</option>
            <option value="LP_INCREASE">LP Increase</option>
            <option value="LP_DECREASE">LP Decrease</option>
            <option value="VELOCITY_UP">Velocity Up</option>
            <option value="VELOCITY_DOWN">Velocity Down</option>
          </select>
        </div>

        {/* Trigger Value */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Threshold {getTriggerUnit(triggerType)}
          </label>
          <input
            type="number"
            value={triggerValue}
            onChange={(e) => setTriggerValue(parseFloat(e.target.value))}
            step={getTriggerStep(triggerType)}
            style={inputStyle}
          />
        </div>

        {/* Amount */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Amount ({action === 'BUY' ? 'SOL' : '%'})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            step={action === 'BUY' ? 0.1 : 1}
            style={inputStyle}
          />
        </div>

        {/* Safety Toggles */}
        <div style={safetyContainerStyle}>
          <div style={safetyHeaderStyle}>Safety Requirements</div>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={requireLpLocked}
              onChange={(e) => setRequireLpLocked(e.target.checked)}
              style={checkboxStyle}
            />
            <span>Require LP Locked 🔒</span>
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={requireAuthorityRenounced}
              onChange={(e) => setRequireAuthorityRenounced(e.target.checked)}
              style={checkboxStyle}
            />
            <span>Require Authority Renounced ✅</span>
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={requireSafeBonding}
              onChange={(e) => setRequireSafeBonding(e.target.checked)}
              style={checkboxStyle}
            />
            <span>Require Bonding {'<'} 99% 📊</span>
          </label>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} style={saveButtonStyle}>
          💾 CREATE RULE
        </button>
      </div>
    </div>
  );
};

// Helper functions for trigger units
function getTriggerUnit(trigger: TriggerType): string {
  switch (trigger) {
    case 'PRICE_BELOW':
    case 'PRICE_ABOVE':
      return '($)';
    case 'MC_BELOW':
    case 'MC_ABOVE':
      return '($)';
    case 'PERCENT_UP':
    case 'PERCENT_DOWN':
      return '(%)';
    case 'LP_INCREASE':
    case 'LP_DECREASE':
      return '(SOL)';
    case 'VELOCITY_UP':
    case 'VELOCITY_DOWN':
      return '(score)';
    default:
      return '';
  }
}

function getTriggerStep(trigger: TriggerType): number {
  switch (trigger) {
    case 'PRICE_BELOW':
    case 'PRICE_ABOVE':
      return 0.00000001;
    case 'MC_BELOW':
    case 'MC_ABOVE':
      return 1000;
    case 'PERCENT_UP':
    case 'PERCENT_DOWN':
      return 1;
    case 'LP_INCREASE':
    case 'LP_DECREASE':
      return 0.1;
    case 'VELOCITY_UP':
    case 'VELOCITY_DOWN':
      return 1;
    default:
      return 1;
  }
}

// =============================================
// RULE CARD COMPONENT
// =============================================

interface RuleCardProps {
  rule: LimitRule;
  currentTime: number;
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
  onForceTrigger: () => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  currentTime,
  onToggle,
  onRemove,
  onForceTrigger,
}) => {
  const isTriggered = rule.status === 'TRIGGERED';
  const isActive = rule.status === 'ACTIVE' && rule.enabled;

  const timeSinceCheck = rule.lastChecked
    ? Math.floor((currentTime - rule.lastChecked) / 1000)
    : null;

  return (
    <div
      style={{
        ...ruleCardStyle,
        ...(isTriggered ? triggeredCardStyle : {}),
        ...(isActive ? activeCardStyle : {}),
      }}
    >
      {/* Header */}
      <div style={cardHeaderStyle}>
        <div>
          <div style={ruleNameStyle}>{rule.name}</div>
          <div style={ruleMetaStyle}>
            {rule.action === 'BUY' ? '📈' : '📉'} {rule.action} {rule.amount}{' '}
            {rule.action === 'BUY' ? 'SOL' : '%'}
          </div>
        </div>

        {/* Status Badge */}
        <div
          style={{
            ...statusBadgeStyle,
            background: isTriggered
              ? '#EF4444'
              : isActive
              ? '#22C55E'
              : '#6B7280',
          }}
        >
          {rule.status}
        </div>
      </div>

      {/* Condition */}
      <div style={conditionBoxStyle}>
        <div style={conditionLabelStyle}>Trigger:</div>
        <div style={conditionValueStyle}>
          {rule.condition.trigger.replace(/_/g, ' ')} {rule.condition.value}
        </div>
      </div>

      {/* Safety Badges */}
      {(rule.requireLpLocked ||
        rule.requireAuthorityRenounced ||
        rule.requireSafeBonding) && (
        <div style={safetyBadgesStyle}>
          {rule.requireLpLocked && <span style={safetyBadgeStyle}>🔒 LP</span>}
          {rule.requireAuthorityRenounced && (
            <span style={safetyBadgeStyle}>✅ RENOUNCED</span>
          )}
          {rule.requireSafeBonding && (
            <span style={safetyBadgeStyle}>📊 SAFE CURVE</span>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={ruleStatsStyle}>
        <div>
          Triggers: <strong>{rule.triggerCount}</strong>
        </div>
        {timeSinceCheck !== null && (
          <div>
            Last check: <strong>{timeSinceCheck}s ago</strong>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={cardActionsStyle}>
        <button
          onClick={onForceTrigger}
          style={forceTriggerButtonStyle}
          disabled={!rule.enabled}
        >
          ⚡ FORCE
        </button>

        <button
          onClick={() => onToggle(!rule.enabled)}
          style={
            rule.enabled ? disableButtonStyle : enableButtonStyle
          }
        >
          {rule.enabled ? '⏸️ PAUSE' : '▶️ ENABLE'}
        </button>

        <button onClick={onRemove} style={removeButtonStyle}>
          🗑️
        </button>
      </div>
    </div>
  );
};

// =============================================
// EXECUTION ROW COMPONENT
// =============================================

interface ExecutionRowProps {
  execution: LimitExecution;
}

const ExecutionRow: React.FC<ExecutionRowProps> = ({ execution }) => {
  const statusColor =
    execution.status === 'SUCCESS'
      ? '#22C55E'
      : execution.status === 'FAILED'
      ? '#EF4444'
      : '#EAB308';

  return (
    <div style={executionRowStyle}>
      <div style={executionMainStyle}>
        <span style={{ fontSize: '16px' }}>
          {execution.action === 'BUY' ? '📈' : '📉'}
        </span>
        <div>
          <div style={executionTokenStyle}>{execution.tokenSymbol}</div>
          <div style={executionDetailsStyle}>
            {execution.action} {execution.amount}{' '}
            {execution.action === 'BUY' ? 'SOL' : '%'} @ $
            {execution.executionPrice.toFixed(8)}
          </div>
        </div>
      </div>

      <div style={{ ...executionStatusStyle, color: statusColor }}>
        {execution.status}
      </div>
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
  boxShadow:
    '0 0 30px rgba(155, 0, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
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

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const startButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
  border: 'none',
  borderRadius: '12px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
  transition: 'all 0.2s',
};

const stopButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
  border: 'none',
  borderRadius: '12px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
  transition: 'all 0.2s',
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

const actionBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: '24px',
};

const newRuleButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #FF3EBF, #9B00FF)',
  border: 'none',
  borderRadius: '12px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(255, 62, 191, 0.4)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#9B00FF',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '16px',
  textShadow: '0 0 8px rgba(155, 0, 255, 0.5)',
};

const rulesContainerStyle: React.CSSProperties = {
  minHeight: '200px',
  marginBottom: '32px',
};

const scrollContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxHeight: '500px',
  overflowY: 'auto',
  paddingRight: '8px',
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
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

const builderContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
  padding: '20px',
  background: 'rgba(0, 0, 0, 0.6)',
  border: '2px solid rgba(255, 62, 191, 0.4)',
  borderRadius: '16px',
  boxShadow: '0 0 30px rgba(255, 62, 191, 0.3)',
};

const builderHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const builderTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#FF3EBF',
  margin: 0,
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  color: '#9CA3AF',
  cursor: 'pointer',
  padding: '4px 8px',
};

const builderContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#E5E7EB',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(155, 0, 255, 0.3)',
  borderRadius: '8px',
  color: '#E5E7EB',
  fontFamily: 'monospace',
};

const selectStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(155, 0, 255, 0.3)',
  borderRadius: '8px',
  color: '#E5E7EB',
  cursor: 'pointer',
};

const segmentedControlStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const segmentButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  fontSize: '14px',
  fontWeight: 600,
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(155, 0, 255, 0.3)',
  borderRadius: '8px',
  color: '#9CA3AF',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const segmentActiveStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #FF3EBF, #9B00FF)',
  borderColor: '#FF3EBF',
  color: '#FFF',
  boxShadow: '0 0 15px rgba(255, 62, 191, 0.4)',
};

const safetyContainerStyle: React.CSSProperties = {
  padding: '16px',
  background: 'rgba(155, 0, 255, 0.1)',
  border: '1px solid rgba(155, 0, 255, 0.2)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const safetyHeaderStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#9B00FF',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '13px',
  color: '#E5E7EB',
  cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  cursor: 'pointer',
};

const saveButtonStyle: React.CSSProperties = {
  padding: '14px 24px',
  fontSize: '15px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
  border: 'none',
  borderRadius: '12px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
  marginTop: '8px',
};

const ruleCardStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '2px solid rgba(155, 0, 255, 0.2)',
  borderRadius: '16px',
  transition: 'all 0.3s',
};

const triggeredCardStyle: React.CSSProperties = {
  border: '2px solid rgba(239, 68, 68, 0.6)',
  boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
};

const activeCardStyle: React.CSSProperties = {
  border: '2px solid rgba(34, 197, 94, 0.4)',
  boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const ruleNameStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#9B00FF',
  marginBottom: '4px',
};

const ruleMetaStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#9CA3AF',
};

const statusBadgeStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#FFF',
  borderRadius: '8px',
  textTransform: 'uppercase',
};

const conditionBoxStyle: React.CSSProperties = {
  padding: '12px',
  background: 'rgba(155, 0, 255, 0.05)',
  border: '1px solid rgba(155, 0, 255, 0.2)',
  borderRadius: '8px',
  marginBottom: '12px',
};

const conditionLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#6B7280',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const conditionValueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#E5E7EB',
  fontFamily: 'monospace',
};

const safetyBadgesStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
  flexWrap: 'wrap',
};

const safetyBadgeStyle: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: '10px',
  fontWeight: 700,
  background: 'rgba(34, 197, 94, 0.2)',
  border: '1px solid rgba(34, 197, 94, 0.4)',
  borderRadius: '6px',
  color: '#22C55E',
};

const ruleStatsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: '#9CA3AF',
  marginBottom: '16px',
};

const cardActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const forceTriggerButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  fontSize: '12px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #FF3EBF, #9B00FF)',
  border: 'none',
  borderRadius: '8px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 15px rgba(255, 62, 191, 0.3)',
};

const enableButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  fontSize: '12px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
  border: 'none',
  borderRadius: '8px',
  color: '#FFF',
  cursor: 'pointer',
};

const disableButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  fontSize: '12px',
  fontWeight: 700,
  background: 'rgba(107, 116, 128, 0.3)',
  border: '1px solid rgba(107, 116, 128, 0.5)',
  borderRadius: '8px',
  color: '#9CA3AF',
  cursor: 'pointer',
};

const removeButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '14px',
  background: 'rgba(239, 68, 68, 0.2)',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  borderRadius: '8px',
  color: '#EF4444',
  cursor: 'pointer',
};

const logContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '300px',
  overflowY: 'auto',
};

const executionRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(155, 0, 255, 0.2)',
  borderRadius: '12px',
};

const executionMainStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const executionTokenStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#E5E7EB',
};

const executionDetailsStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9CA3AF',
  fontFamily: 'monospace',
};

const executionStatusStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
};

// Inject animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;
document.head.appendChild(style);

// =============================================
// EXPORTS
// =============================================

export default LimitPanel;
