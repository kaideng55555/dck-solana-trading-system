/**
 * TerminalTradeBox Component
 * 
 * Trade execution module for terminal bottom panel
 * Features:
 * - Amount input
 * - Slippage selector
 * - Priority fee selector
 * - Jito toggle
 * - BUY/SELL buttons with neon glow
 * - Executes via useSwapEngine()
 */

import React, { useState, useEffect } from 'react';
import { Token } from '../../data/tokenTypes';
import { useSwapStore } from '../../stores/swapStore';

// =============================================
// TYPES
// =============================================

interface TerminalTradeBoxProps {
  token: Token | undefined;
  mint: string;
}

// =============================================
// COMPONENT
// =============================================

const TerminalTradeBox: React.FC<TerminalTradeBoxProps> = ({ token, mint }) => {
  const [amount, setAmount] = useState('1.0');
  const [slippage, setSlippage] = useState('10');
  const [priorityFee, setPriorityFee] = useState('0.001');
  const [jitoEnabled, setJitoEnabled] = useState(true);
  const [estimatedOutput, setEstimatedOutput] = useState('0.00');
  
  const { openSwap } = useSwapStore();
  const SOL_MINT = 'So11111111111111111111111111111111111111112';

  // Calculate estimated output
  useEffect(() => {
    if (token && amount) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum)) {
        const estimate = (amountNum / token.market.price).toFixed(2);
        setEstimatedOutput(estimate);
      }
    }
  }, [amount, token]);

  const handleBuy = () => {
    if (!token) return;
    
    // Open swap with SOL → Token
    openSwap(SOL_MINT, mint, 'default');
    
    console.log('🟢 BUY ORDER:', {
      amount,
      slippage,
      priorityFee,
      jitoEnabled,
      token: token.metadata.symbol,
    });
  };

  const handleSell = () => {
    if (!token) return;
    
    // Open swap with Token → SOL
    openSwap(mint, SOL_MINT, 'default');
    
    console.log('🔴 SELL ORDER:', {
      amount,
      slippage,
      priorityFee,
      jitoEnabled,
      token: token.metadata.symbol,
    });
  };

  const handleMaxAmount = () => {
    // TODO: Get actual wallet balance
    setAmount('10.0');
  };

  const slippagePresets = ['5', '10', '15', '20'];
  const priorityFeePresets = ['0.0001', '0.001', '0.01', '0.1'];

  return (
    <div style={styles.container}>
      {/* Left Section: Amount Input */}
      <div style={styles.leftSection}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>AMOUNT (SOL)</label>
          <div style={styles.inputRow}>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              placeholder="0.00"
            />
            <button onClick={handleMaxAmount} style={styles.maxButton}>
              MAX
            </button>
          </div>
          {token && (
            <div style={styles.estimateText}>
              ≈ {estimatedOutput} {token.metadata.symbol}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section: Settings */}
      <div style={styles.middleSection}>
        {/* Slippage */}
        <div style={styles.settingGroup}>
          <label style={styles.label}>SLIPPAGE (%)</label>
          <div style={styles.presetRow}>
            {slippagePresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setSlippage(preset)}
                style={{
                  ...styles.presetButton,
                  ...(slippage === preset ? styles.presetButtonActive : {}),
                }}
              >
                {preset}%
              </button>
            ))}
            <input
              type="text"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              style={styles.customInput}
              placeholder="Custom"
            />
          </div>
        </div>

        {/* Priority Fee */}
        <div style={styles.settingGroup}>
          <label style={styles.label}>PRIORITY FEE (SOL)</label>
          <div style={styles.presetRow}>
            {priorityFeePresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setPriorityFee(preset)}
                style={{
                  ...styles.presetButton,
                  ...(priorityFee === preset ? styles.presetButtonActive : {}),
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Jito Toggle */}
        <div style={styles.settingGroup}>
          <label style={styles.jitoLabel}>
            <input
              type="checkbox"
              checked={jitoEnabled}
              onChange={(e) => setJitoEnabled(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>⚡ JITO ENABLED</span>
            <span style={{ marginLeft: '8px', fontSize: '10px', color: '#FFD700' }}>
              (MEV Protection)
            </span>
          </label>
        </div>
      </div>

      {/* Right Section: Action Buttons */}
      <div style={styles.rightSection}>
        <button onClick={handleBuy} style={styles.buyButton}>
          <span style={{ fontSize: '20px' }}>🟢</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>BUY</span>
        </button>
        <button onClick={handleSell} style={styles.sellButton}>
          <span style={{ fontSize: '20px' }}>🔴</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>SELL</span>
        </button>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes neonPulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(0,255,136,0.4);
            }
            50% {
              box-shadow: 0 0 40px rgba(0,255,136,0.8);
            }
          }
          
          @keyframes neonPulseSell {
            0%, 100% {
              box-shadow: 0 0 20px rgba(255,62,191,0.4);
            }
            50% {
              box-shadow: 0 0 40px rgba(255,62,191,0.8);
            }
          }
        `}
      </style>
    </div>
  );
};

// =============================================
// STYLES
// =============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: '24px',
    alignItems: 'center',
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#8899AA',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,228,255,0.3)',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    outline: 'none',
  },
  maxButton: {
    padding: '12px 16px',
    background: 'rgba(0,228,255,0.2)',
    border: '1px solid #00E4FF',
    borderRadius: '8px',
    color: '#00E4FF',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  estimateText: {
    fontSize: '12px',
    color: '#8899AA',
    marginTop: '4px',
  },
  middleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  settingGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  presetRow: {
    display: 'flex',
    gap: '6px',
  },
  presetButton: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#8899AA',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  presetButtonActive: {
    background: 'rgba(155,0,255,0.3)',
    border: '1px solid #9B00FF',
    color: '#FFFFFF',
    boxShadow: '0 0 12px rgba(155,0,255,0.6)',
  },
  customInput: {
    flex: 1,
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '12px',
    outline: 'none',
  },
  jitoLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  rightSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  buyButton: {
    padding: '16px',
    background: 'linear-gradient(135deg, #00FF88 0%, #00E4FF 100%)',
    border: '3px solid #00FF88',
    borderRadius: '12px',
    color: '#000000',
    fontSize: '18px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    animation: 'neonPulse 2s ease-in-out infinite',
  },
  sellButton: {
    padding: '16px',
    background: 'linear-gradient(135deg, #FF3EBF 0%, #FF4444 100%)',
    border: '3px solid #FF3EBF',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    animation: 'neonPulseSell 2s ease-in-out infinite',
  },
};

// =============================================
// EXPORTS
// =============================================

export default TerminalTradeBox;
