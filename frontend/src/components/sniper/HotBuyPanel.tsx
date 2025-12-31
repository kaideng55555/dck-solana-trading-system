/**
 * HotBuyPanel (S3)
 * 
 * Automated trading bot panel with rule-based execution
 * Features rule builder, monitoring controls, and event log
 */

import React, { useState } from 'react';
import { useHotBuyBot } from '../../hooks/useHotBuyBot';
import type { HotBuyRule, HotBuyRuleType } from '../../types/hotBuyTypes';

// =============================================
// COMPONENT
// =============================================

export const HotBuyPanel: React.FC = () => {
  const {
    rules,
    history,
    isRunning,
    stats,
    addRule,
    removeRule,
    start,
    stop,
    clearHistory,
  } = useHotBuyBot();

  // Rule builder state
  const [ruleType, setRuleType] = useState<HotBuyRuleType>('marketCapBelow');
  const [threshold, setThreshold] = useState<number>(10000);
  const [buyAmount, setBuyAmount] = useState<number>(0.1);
  const [slippage, setSlippage] = useState<number>(10);
  const [cooldown, setCooldown] = useState<number>(60);
  const [maxTradesPerMinute, setMaxTradesPerMinute] = useState<number>(3);
  const [jitoEnabled, setJitoEnabled] = useState<boolean>(true);
  
  // Safety settings
  const [lpSafe, setLpSafe] = useState<boolean>(true);
  const [authoritySafe, setAuthoritySafe] = useState<boolean>(true);
  const [rugSafe, setRugSafe] = useState<boolean>(true);
  const [minConfidence, setMinConfidence] = useState<number>(40);
  const [minAge, setMinAge] = useState<number>(60);
  const [maxPriceImpact, setMaxPriceImpact] = useState<number>(10);

  /**
   * Handle add rule
   */
  const handleAddRule = () => {
    const newRule: HotBuyRule = {
      id: `rule-${Date.now()}`,
      type: ruleType,
      threshold,
      cooldown,
      maxTradesPerMinute,
      buyAmount,
      slippage,
      priorityFee: 'turbo',
      jitoEnabled,
      safety: {
        lpSafe,
        authoritySafe,
        rugSafe,
        minConfidence,
        minAge,
        maxPriceImpact,
      },
      enabled: true,
      createdAt: Date.now(),
    };

    addRule(newRule);
    console.log('✅ Rule added:', newRule);
  };

  /**
   * Get rule type label
   */
  const getRuleTypeLabel = (type: HotBuyRuleType): string => {
    const labels: Record<HotBuyRuleType, string> = {
      marketCapBelow: 'Market Cap Below',
      marketCapAbove: 'Market Cap Above',
      priceBelow: 'Price Below',
      priceAbove: 'Price Above',
      velocityAbove: 'Velocity Above',
      accelerationAbove: 'Acceleration Above',
      etaBelow: 'ETA Below',
      volumeSpike: 'Volume Spike',
      bigBuyerDetected: 'Big Buyer Detected',
    };
    return labels[type];
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={iconStyle}>⚡</span>
          <div>
            <h2 style={titleStyle}>HOT BUY BOT</h2>
            <p style={subtextStyle}>
              Automated rule-based trading with safety controls
            </p>
          </div>
        </div>

        {/* Bot Controls */}
        <div style={controlsStyle}>
          <div style={statusContainerStyle}>
            <div style={statusDotStyle(isRunning)} />
            <span style={statusTextStyle}>
              {isRunning ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>

          {isRunning ? (
            <button onClick={stop} style={stopButtonStyle}>
              🛑 STOP BOT
            </button>
          ) : (
            <button onClick={start} style={startButtonStyle}>
              ▶️ START BOT
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={statsStyle}>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Total Trades</div>
          <div style={statValueStyle}>{stats.totalTrades}</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Successful</div>
          <div style={{ ...statValueStyle, color: '#22C55E' }}>
            {stats.successfulTrades}
          </div>
        </div>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Failed</div>
          <div style={{ ...statValueStyle, color: '#EF4444' }}>
            {stats.failedTrades}
          </div>
        </div>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Active Rules</div>
          <div style={statValueStyle}>{rules.length}</div>
        </div>
      </div>

      {/* Rule Builder */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>➕ Add New Rule</h3>

        <div style={builderContainerStyle}>
          {/* Rule Type & Threshold */}
          <div style={builderRowStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Rule Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as HotBuyRuleType)}
                style={selectStyle}
              >
                <option value="marketCapBelow">Market Cap Below</option>
                <option value="marketCapAbove">Market Cap Above</option>
                <option value="priceBelow">Price Below</option>
                <option value="priceAbove">Price Above</option>
                <option value="velocityAbove">Velocity Above</option>
                <option value="accelerationAbove">Acceleration Above</option>
                <option value="etaBelow">ETA Below (minutes)</option>
                <option value="volumeSpike">Volume Spike (multiplier)</option>
                <option value="bigBuyerDetected">Big Buyer (SOL)</option>
              </select>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Threshold</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                style={inputStyle}
                step={ruleType.includes('price') ? '0.0001' : '1'}
              />
            </div>
          </div>

          {/* Buy Settings */}
          <div style={builderRowStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Buy Amount (SOL)</label>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(Number(e.target.value))}
                style={inputStyle}
                step="0.01"
                min="0.01"
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Slippage (%)</label>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                style={inputStyle}
                step="1"
                min="1"
                max="50"
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Cooldown (s)</label>
              <input
                type="number"
                value={cooldown}
                onChange={(e) => setCooldown(Number(e.target.value))}
                style={inputStyle}
                step="10"
                min="10"
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Max/Min</label>
              <input
                type="number"
                value={maxTradesPerMinute}
                onChange={(e) => setMaxTradesPerMinute(Number(e.target.value))}
                style={inputStyle}
                step="1"
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Safety Settings */}
          <div style={safetyContainerStyle}>
            <div style={safetyHeaderStyle}>🛡️ Safety Filters</div>
            <div style={safetyGridStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={lpSafe}
                  onChange={(e) => setLpSafe(e.target.checked)}
                  style={checkboxStyle}
                />
                LP Safe (≥5 SOL)
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={authoritySafe}
                  onChange={(e) => setAuthoritySafe(e.target.checked)}
                  style={checkboxStyle}
                />
                Authority Safe
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={rugSafe}
                  onChange={(e) => setRugSafe(e.target.checked)}
                  style={checkboxStyle}
                />
                Rug Check
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={jitoEnabled}
                  onChange={(e) => setJitoEnabled(e.target.checked)}
                  style={checkboxStyle}
                />
                Jito MEV
              </label>
            </div>

            <div style={builderRowStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Min Confidence (%)</label>
                <input
                  type="number"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  style={inputStyle}
                  step="5"
                  min="0"
                  max="100"
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Min Age (s)</label>
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  style={inputStyle}
                  step="10"
                  min="0"
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Max Impact (%)</label>
                <input
                  type="number"
                  value={maxPriceImpact}
                  onChange={(e) => setMaxPriceImpact(Number(e.target.value))}
                  style={inputStyle}
                  step="1"
                  min="1"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Add Button */}
          <button onClick={handleAddRule} style={addButtonStyle}>
            ➕ ADD RULE
          </button>
        </div>
      </div>

      {/* Active Rules */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>📋 Active Rules ({rules.length})</h3>

        {rules.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyTextStyle}>No rules configured</p>
            <p style={emptySubtextStyle}>Add rules above to start automated trading</p>
          </div>
        ) : (
          <div style={rulesListStyle}>
            {rules.map((rule) => (
              <div key={rule.id} style={ruleCardStyle}>
                <div style={ruleHeaderStyle}>
                  <span style={ruleTypeStyle}>{getRuleTypeLabel(rule.type)}</span>
                  <button
                    onClick={() => removeRule(rule.id)}
                    style={removeButtonStyle}
                  >
                    🗑️
                  </button>
                </div>

                <div style={ruleDetailsStyle}>
                  <div style={ruleDetailStyle}>
                    <span style={ruleDetailLabelStyle}>Threshold:</span>
                    <span style={ruleDetailValueStyle}>{rule.threshold}</span>
                  </div>
                  <div style={ruleDetailStyle}>
                    <span style={ruleDetailLabelStyle}>Amount:</span>
                    <span style={ruleDetailValueStyle}>{rule.buyAmount} SOL</span>
                  </div>
                  <div style={ruleDetailStyle}>
                    <span style={ruleDetailLabelStyle}>Slippage:</span>
                    <span style={ruleDetailValueStyle}>{rule.slippage}%</span>
                  </div>
                  <div style={ruleDetailStyle}>
                    <span style={ruleDetailLabelStyle}>Cooldown:</span>
                    <span style={ruleDetailValueStyle}>{rule.cooldown}s</span>
                  </div>
                </div>

                <div style={ruleSafetyStyle}>
                  {rule.safety.lpSafe && <span style={safetyBadgeStyle}>🛡️ LP</span>}
                  {rule.safety.authoritySafe && <span style={safetyBadgeStyle}>🛡️ Auth</span>}
                  {rule.safety.rugSafe && <span style={safetyBadgeStyle}>🛡️ Rug</span>}
                  {rule.jitoEnabled && <span style={safetyBadgeStyle}>⚡ Jito</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Log */}
      <div style={sectionStyle}>
        <div style={logHeaderStyle}>
          <h3 style={sectionTitleStyle}>📝 Event Log ({history.length})</h3>
          {history.length > 0 && (
            <button onClick={clearHistory} style={clearButtonStyle}>
              🗑️ Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyTextStyle}>No events yet</p>
            <p style={emptySubtextStyle}>Events will appear here when bot executes trades</p>
          </div>
        ) : (
          <div style={logContainerStyle}>
            {history.slice(0, 10).map((event) => (
              <div key={event.id} style={eventCardStyle(event.status)}>
                <div style={eventTopStyle}>
                  <span style={eventSymbolStyle}>{event.tokenSymbol}</span>
                  <span style={eventStatusStyle(event.status)}>
                    {event.status.toUpperCase()}
                  </span>
                </div>

                <div style={eventDetailsStyle}>
                  <div style={eventDetailStyle}>
                    <span style={eventDetailLabelStyle}>Rule:</span>
                    <span style={eventDetailValueStyle}>
                      {getRuleTypeLabel(event.triggerType)}
                    </span>
                  </div>
                  <div style={eventDetailStyle}>
                    <span style={eventDetailLabelStyle}>Price:</span>
                    <span style={eventDetailValueStyle}>
                      ${event.price.toFixed(8)}
                    </span>
                  </div>
                  <div style={eventDetailStyle}>
                    <span style={eventDetailLabelStyle}>Amount:</span>
                    <span style={eventDetailValueStyle}>
                      {event.buyAmount} SOL
                    </span>
                  </div>
                  <div style={eventDetailStyle}>
                    <span style={eventDetailLabelStyle}>Time:</span>
                    <span style={eventDetailValueStyle}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {event.signature && (
                  <div style={eventSignatureStyle}>
                    Tx: {event.signature.slice(0, 8)}...
                  </div>
                )}

                {event.error && (
                  <div style={eventErrorStyle}>
                    Error: {event.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
  border: '2px solid rgba(255, 62, 191, 0.3)',
  borderRadius: '16px',
  boxShadow: '0 0 30px rgba(255, 62, 191, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
  minHeight: '500px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '2px solid rgba(255, 62, 191, 0.2)',
};

const titleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconStyle: React.CSSProperties = {
  fontSize: '36px',
  filter: 'drop-shadow(0 0 12px rgba(255, 62, 191, 0.8))',
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

const statusContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  background: 'rgba(255, 62, 191, 0.1)',
  border: '1px solid rgba(255, 62, 191, 0.3)',
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

const startButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '13px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #22C55E, #10B981)',
  border: '2px solid rgba(34, 197, 94, 0.4)',
  borderRadius: '12px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)',
  transition: 'all 0.2s ease',
};

const stopButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '13px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
  border: '2px solid rgba(239, 68, 68, 0.4)',
  borderRadius: '12px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
  transition: 'all 0.2s ease',
};

const statsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '12px',
  marginBottom: '24px',
};

const statBoxStyle: React.CSSProperties = {
  padding: '12px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 62, 191, 0.2)',
  borderRadius: '12px',
  textAlign: 'center',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#6B7280',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#FF3EBF',
  textShadow: '0 0 10px rgba(255, 62, 191, 0.5)',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#FF3EBF',
  marginBottom: '12px',
};

const builderContainerStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 62, 191, 0.2)',
  borderRadius: '12px',
};

const builderRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px',
  marginBottom: '12px',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 62, 191, 0.3)',
  borderRadius: '8px',
  color: '#E5E7EB',
  fontFamily: 'monospace',
};

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 62, 191, 0.3)',
  borderRadius: '8px',
  color: '#E5E7EB',
  cursor: 'pointer',
};

const safetyContainerStyle: React.CSSProperties = {
  padding: '16px',
  background: 'rgba(255, 62, 191, 0.05)',
  border: '1px solid rgba(255, 62, 191, 0.2)',
  borderRadius: '8px',
  marginBottom: '12px',
};

const safetyHeaderStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#FF3EBF',
  marginBottom: '12px',
};

const safetyGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px',
  marginBottom: '12px',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: '#E5E7EB',
  cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
  cursor: 'pointer',
};

const addButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  fontSize: '14px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #FF3EBF, #9B00FF)',
  border: '2px solid rgba(255, 62, 191, 0.4)',
  borderRadius: '12px',
  color: '#FFF',
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(255, 62, 191, 0.3)',
  transition: 'all 0.2s ease',
};

const emptyStateStyle: React.CSSProperties = {
  padding: '40px',
  textAlign: 'center',
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#9CA3AF',
  marginBottom: '8px',
};

const emptySubtextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B7280',
};

const rulesListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const ruleCardStyle: React.CSSProperties = {
  padding: '16px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '2px solid rgba(255, 62, 191, 0.2)',
  borderRadius: '12px',
};

const ruleHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const ruleTypeStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#FF3EBF',
};

const removeButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '12px',
  background: 'rgba(239, 68, 68, 0.2)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#EF4444',
};

const ruleDetailsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '8px',
  marginBottom: '12px',
};

const ruleDetailStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
};

const ruleDetailLabelStyle: React.CSSProperties = {
  color: '#9CA3AF',
};

const ruleDetailValueStyle: React.CSSProperties = {
  color: '#E5E7EB',
  fontWeight: 600,
  fontFamily: 'monospace',
};

const ruleSafetyStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const safetyBadgeStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '10px',
  fontWeight: 700,
  background: 'rgba(34, 197, 94, 0.2)',
  border: '1px solid rgba(34, 197, 94, 0.3)',
  borderRadius: '6px',
  color: '#22C55E',
};

const logHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const clearButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '11px',
  fontWeight: 700,
  background: 'rgba(107, 116, 128, 0.2)',
  border: '1px solid rgba(107, 116, 128, 0.3)',
  borderRadius: '8px',
  color: '#9CA3AF',
  cursor: 'pointer',
};

const logContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '400px',
  overflowY: 'auto',
};

const eventCardStyle = (status: string): React.CSSProperties => ({
  padding: '12px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: `1px solid ${
    status === 'success'
      ? 'rgba(34, 197, 94, 0.3)'
      : status === 'failed'
      ? 'rgba(239, 68, 68, 0.3)'
      : 'rgba(234, 179, 8, 0.3)'
  }`,
  borderRadius: '8px',
});

const eventTopStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const eventSymbolStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#FF3EBF',
};

const eventStatusStyle = (status: string): React.CSSProperties => ({
  padding: '2px 8px',
  fontSize: '10px',
  fontWeight: 700,
  background:
    status === 'success'
      ? 'rgba(34, 197, 94, 0.2)'
      : status === 'failed'
      ? 'rgba(239, 68, 68, 0.2)'
      : 'rgba(234, 179, 8, 0.2)',
  color:
    status === 'success' ? '#22C55E' : status === 'failed' ? '#EF4444' : '#EAB308',
  borderRadius: '6px',
  textTransform: 'uppercase',
});

const eventDetailsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '6px',
  fontSize: '11px',
};

const eventDetailStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
};

const eventDetailLabelStyle: React.CSSProperties = {
  color: '#9CA3AF',
};

const eventDetailValueStyle: React.CSSProperties = {
  color: '#E5E7EB',
  fontFamily: 'monospace',
};

const eventSignatureStyle: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '10px',
  color: '#6B7280',
  fontFamily: 'monospace',
};

const eventErrorStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '6px',
  fontSize: '10px',
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#EF4444',
  borderRadius: '4px',
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

export default HotBuyPanel;
