/**
 * SwapWidget Component
 * 
 * Full-featured neon-themed swap UI with Jupiter + Jito integration
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  useSwapEngine,
  TOKEN_MINTS,
  DEFAULT_SLIPPAGE,
  DEFAULT_PRIORITY_FEE,
  DEFAULT_JITO_TIP,
  type SwapRequest,
  type SwapResult,
} from '../swap';
import { useTokenDataStore } from '../data/tokenDataStore';
import { useSwapStore } from '../stores/swapStore';
import { dckNeonTheme } from '../../styles/dckNeonTheme';

// =============================================
// TYPES
// =============================================

interface SwapWidgetProps {
  /** Optional callback when swap completes successfully */
  onSwapComplete?: (result: SwapResult) => void;
  
  /** Optional default input token */
  defaultInputToken?: string;
  
  /** Optional default output token */
  defaultOutputToken?: string;
  
  /** RPC connection (optional, will use default if not provided) */
  connection?: Connection;
}

type PriorityLevel = 'low' | 'medium' | 'high' | 'turbo';
type SlippagePreset = 0.1 | 0.5 | 1.0 | 'custom';

// =============================================
// CONSTANTS
// =============================================

const RPC_ENDPOINT = import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com';

const SLIPPAGE_PRESETS = [
  { label: '0.1%', value: 0.1, bps: 10 },
  { label: '0.5%', value: 0.5, bps: 50 },
  { label: '1%', value: 1.0, bps: 100 },
] as const;

const PRIORITY_LEVELS: Record<PriorityLevel, { label: string; fee: number; color: string }> = {
  low: { label: 'Low', fee: DEFAULT_PRIORITY_FEE.LOW, color: dckNeonTheme.colors.neonCyan },
  medium: { label: 'Medium', fee: DEFAULT_PRIORITY_FEE.MEDIUM, color: dckNeonTheme.colors.neonBlue },
  high: { label: 'High', fee: DEFAULT_PRIORITY_FEE.HIGH, color: dckNeonTheme.colors.neonPurple },
  turbo: { label: 'Turbo', fee: DEFAULT_PRIORITY_FEE.TURBO, color: dckNeonTheme.colors.neonPink },
};

// =============================================
// MAIN COMPONENT
// =============================================

export const SwapWidget: React.FC<SwapWidgetProps> = ({
  onSwapComplete,
  defaultInputToken = TOKEN_MINTS.SOL,
  defaultOutputToken = TOKEN_MINTS.USDC,
  connection: externalConnection,
}) => {
  const wallet = useWallet();
  const tokenStore = useTokenDataStore();
  const swapMode = useSwapStore((s) => s.mode);
  
  // Connection setup
  const connection = useMemo(
    () => externalConnection || new Connection(RPC_ENDPOINT, 'confirmed'),
    [externalConnection]
  );

  // Swap engine hook
  const {
    fetchRoutes,
    executeSwap,
    bestRoute,
    routes,
    error,
    isLoadingRoutes,
    isExecutingSwap,
    canExecuteSwap,
    reset,
  } = useSwapEngine({ connection, wallet });

  // State
  const [inputToken, setInputToken] = useState(defaultInputToken);
  const [outputToken, setOutputToken] = useState(defaultOutputToken);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippagePreset, setSlippagePreset] = useState<SlippagePreset>(0.5);
  const [customSlippage, setCustomSlippage] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('medium');
  const [useJito, setUseJito] = useState(true);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // S1 Integration: Detect Snipe Mode
  const isSnipeMode = useMemo(() => {
    // Check if this is a quick snipe: SOL → any non-stablecoin token
    return inputToken === TOKEN_MINTS.SOL && 
           outputToken !== TOKEN_MINTS.USDC && 
           outputToken !== TOKEN_MINTS.USDT;
  }, [inputToken, outputToken]);

  // S1 Integration: Apply snipe presets when swapMode is 'snipe'
  useEffect(() => {
    if (swapMode === 'snipe') {
      setSlippagePreset('custom');
      setCustomSlippage('10'); // 10% slippage
      setPriorityLevel('turbo');
      setUseJito(true);
      console.log('⚡ SNIPE MODE ACTIVE - Presets applied');
    }
  }, [swapMode]);

  // Computed values
  const currentSlippageBps = useMemo(() => {
    if (slippagePreset === 'custom') {
      const custom = parseFloat(customSlippage);
      return isNaN(custom) ? 50 : Math.floor(custom * 100);
    }
    return SLIPPAGE_PRESETS.find(p => p.value === slippagePreset)?.bps || 50;
  }, [slippagePreset, customSlippage]);

  const currentPriorityFee = PRIORITY_LEVELS[priorityLevel].fee;

  const isInputValid = useMemo(() => {
    const amount = parseFloat(inputAmount);
    return !isNaN(amount) && amount > 0;
  }, [inputAmount]);

  const hasSufficientBalance = useMemo(() => {
    if (walletBalance === null || !isInputValid) return true;
    const amount = parseFloat(inputAmount);
    return amount <= walletBalance;
  }, [walletBalance, inputAmount, isInputValid]);

  const priceImpactColor = useMemo(() => {
    if (!bestRoute) return dckNeonTheme.colors.textSecondary;
    const impact = bestRoute.priceImpact;
    if (impact < 1) return dckNeonTheme.colors.success;
    if (impact < 3) return dckNeonTheme.colors.neonYellow;
    return dckNeonTheme.colors.danger;
  }, [bestRoute]);

  // =============================================
  // EFFECTS
  // =============================================

  // Fetch wallet balance
  useEffect(() => {
    if (!wallet.publicKey || inputToken !== TOKEN_MINTS.SOL) {
      setWalletBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(wallet.publicKey!);
        setWalletBalance(balance / 1e9); // Convert lamports to SOL
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [wallet.publicKey, connection, inputToken]);

  // Auto-fetch routes on input change
  useEffect(() => {
    if (!isInputValid) {
      setOutputAmount('');
      return;
    }

    const timeoutId = setTimeout(() => {
      handleFetchRoutes();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [inputAmount, inputToken, outputToken, currentSlippageBps, isInputValid]);

  // Update output amount when route changes
  useEffect(() => {
    if (bestRoute) {
      // Convert from smallest units to token units (assuming 9 decimals for simplicity)
      const outputInTokens = parseFloat(bestRoute.outAmount) / 1e9;
      setOutputAmount(outputInTokens.toFixed(6));
    } else {
      setOutputAmount('');
    }
  }, [bestRoute]);

  // =============================================
  // HANDLERS
  // =============================================

  const handleFetchRoutes = async () => {
    if (!isInputValid) return;

    try {
      const amountInLamports = Math.floor(parseFloat(inputAmount) * 1e9);

      const request: SwapRequest = {
        inputMint: inputToken,
        outputMint: outputToken,
        amountIn: amountInLamports,
        slippage: currentSlippageBps,
        priorityFee: currentPriorityFee,
        useJito,
        jitoTipAmount: useJito ? DEFAULT_JITO_TIP[priorityLevel.toUpperCase() as keyof typeof DEFAULT_JITO_TIP] : undefined,
      };

      await fetchRoutes(request);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  };

  const handleExecuteSwap = async () => {
    if (!canExecuteSwap || !bestRoute) return;

    try {
      const result = await executeSwap();
      
      console.log('✅ Swap successful:', result.signature);
      
      // Reset form
      setInputAmount('');
      setOutputAmount('');
      reset();

      // Callback
      if (onSwapComplete) {
        onSwapComplete(result);
      }

      // Show success notification (you can replace with your toast system)
      alert(`Swap successful! TX: ${result.signature.slice(0, 8)}...`);
    } catch (err) {
      console.error('Swap failed:', err);
      // Error is already in the error state
    }
  };

  const handleSwapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount(outputAmount);
    setOutputAmount('');
  };

  const handleMaxInput = () => {
    if (walletBalance !== null && inputToken === TOKEN_MINTS.SOL) {
      // Reserve 0.01 SOL for fees
      const maxAmount = Math.max(0, walletBalance - 0.01);
      setInputAmount(maxAmount.toFixed(6));
    }
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>⚡ Swap Tokens</h2>
        <p style={styles.subtitle}>Powered by Jupiter + Jito</p>
      </div>

      {/* S1 Integration: Snipe Mode Banner */}
      {swapMode === 'snipe' && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(255, 62, 191, 0.2), rgba(155, 0, 255, 0.2), rgba(0, 228, 255, 0.2))',
          border: '2px solid #FF3EBF',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(255, 62, 191, 0.3)',
          animation: 'pulseSnipeBanner 2s infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                color: '#FF3EBF',
                textShadow: '0 0 10px rgba(255, 62, 191, 0.6)',
              }}>
                SNIPE MODE ACTIVE
              </div>
              <div style={{ fontSize: '11px', color: '#00E4FF', marginTop: '2px' }}>
                Turbo priority • 10% slippage • Jito enabled
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Token */}
      <div style={styles.tokenSection}>
        <div style={styles.tokenHeader}>
          <label style={styles.label}>You Pay</label>
          {walletBalance !== null && inputToken === TOKEN_MINTS.SOL && (
            <span style={styles.balance}>
              Balance: {walletBalance.toFixed(4)} SOL
              <button onClick={handleMaxInput} style={styles.maxButton}>
                MAX
              </button>
            </span>
          )}
        </div>
        <div style={styles.inputRow}>
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0.0"
            style={styles.amountInput}
            disabled={isExecutingSwap}
          />
          <select
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            style={styles.tokenSelect}
            disabled={isExecutingSwap}
          >
            <option value={TOKEN_MINTS.SOL}>SOL</option>
            <option value={TOKEN_MINTS.USDC}>USDC</option>
            <option value={TOKEN_MINTS.USDT}>USDT</option>
          </select>
        </div>
      </div>

      {/* Swap Direction Button */}
      <div style={styles.swapButtonContainer}>
        <button
          onClick={handleSwapTokens}
          style={styles.swapButton}
          disabled={isExecutingSwap}
        >
          🔄
        </button>
      </div>

      {/* Output Token */}
      <div style={styles.tokenSection}>
        <div style={styles.tokenHeader}>
          <label style={styles.label}>You Receive</label>
          {bestRoute && (
            <span style={styles.balance}>
              ~{outputAmount} tokens
            </span>
          )}
        </div>
        <div style={styles.inputRow}>
          <input
            type="text"
            value={outputAmount}
            placeholder="0.0"
            style={{ ...styles.amountInput, cursor: 'not-allowed' }}
            disabled
          />
          <select
            value={outputToken}
            onChange={(e) => setOutputToken(e.target.value)}
            style={styles.tokenSelect}
            disabled={isExecutingSwap}
          >
            <option value={TOKEN_MINTS.SOL}>SOL</option>
            <option value={TOKEN_MINTS.USDC}>USDC</option>
            <option value={TOKEN_MINTS.USDT}>USDT</option>
          </select>
        </div>
      </div>

      {/* Settings */}
      <div style={styles.settingsSection}>
        {/* Slippage */}
        <div style={styles.settingRow}>
          <label style={styles.settingLabel}>Slippage Tolerance</label>
          <div style={styles.presetButtons}>
            {SLIPPAGE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSlippagePreset(preset.value)}
                style={{
                  ...styles.presetButton,
                  ...(slippagePreset === preset.value ? styles.presetButtonActive : {}),
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setSlippagePreset('custom')}
              style={{
                ...styles.presetButton,
                ...(slippagePreset === 'custom' ? styles.presetButtonActive : {}),
              }}
            >
              Custom
            </button>
          </div>
          {slippagePreset === 'custom' && (
            <input
              type="number"
              value={customSlippage}
              onChange={(e) => setCustomSlippage(e.target.value)}
              placeholder="Enter %"
              style={styles.customInput}
              step="0.1"
              min="0"
              max="50"
            />
          )}
        </div>

        {/* Priority Fee */}
        <div style={styles.settingRow}>
          <label style={styles.settingLabel}>Priority Fee</label>
          <div style={styles.presetButtons}>
            {(Object.keys(PRIORITY_LEVELS) as PriorityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setPriorityLevel(level)}
                style={{
                  ...styles.presetButton,
                  ...(priorityLevel === level ? {
                    ...styles.presetButtonActive,
                    borderColor: PRIORITY_LEVELS[level].color,
                  } : {}),
                }}
              >
                {PRIORITY_LEVELS[level].label}
              </button>
            ))}
          </div>
        </div>

        {/* Jito Toggle */}
        <div style={styles.settingRow}>
          <label style={styles.settingLabel}>
            <input
              type="checkbox"
              checked={useJito}
              onChange={(e) => setUseJito(e.target.checked)}
              style={styles.checkbox}
            />
              <span style={{ marginLeft: '8px' }}>
                🛡️ Jito MEV Protection
              <span style={styles.jitoTip}>
                {useJito && ` (Tip: ${DEFAULT_JITO_TIP[priorityLevel.toUpperCase() as keyof typeof DEFAULT_JITO_TIP]} SOL)`}
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Route Summary */}
      {bestRoute && (
        <div style={styles.routeBox}>
          <div
            style={styles.routeHeader}
            onClick={() => setShowRouteDetails(!showRouteDetails)}
          >
            <span style={styles.routeTitle}>📊 Route Summary</span>
            <span style={styles.routeToggle}>
              {showRouteDetails ? '▼' : '▶'}
            </span>
          </div>
          
          <div style={styles.routeRow}>
            <span style={styles.routeLabel}>Best Route:</span>
            <span style={styles.routeValue}>
              {bestRoute.marketInfos.map(m => m.label).join(' → ')}
            </span>
          </div>

          <div style={styles.routeRow}>
            <span style={styles.routeLabel}>Price Impact:</span>
            <span style={{ ...styles.routeValue, color: priceImpactColor }}>
              {bestRoute.priceImpact.toFixed(2)}%
              {bestRoute.priceImpact > 3 && ' ⚠️'}
            </span>
          </div>

          {showRouteDetails && (
            <>
              <div style={styles.routeRow}>
                <span style={styles.routeLabel}>Estimated Output:</span>
                <span style={styles.routeValue}>
                  {(parseFloat(bestRoute.outAmount) / 1e9).toFixed(6)}
                </span>
              </div>

              <div style={styles.routeRow}>
                <span style={styles.routeLabel}>Transaction Fee:</span>
                <span style={styles.routeValue}>
                  ~{(currentPriorityFee / 1e9).toFixed(6)} SOL
                </span>
              </div>

              {useJito && (
                <div style={styles.routeRow}>
                  <span style={styles.routeLabel}>Jito Tip:</span>
                  <span style={styles.routeValue}>
                    {DEFAULT_JITO_TIP[priorityLevel.toUpperCase() as keyof typeof DEFAULT_JITO_TIP]} SOL
                  </span>
                </div>
              )}

              <div style={styles.routeRow}>
                <span style={styles.routeLabel}>Available Routes:</span>
                <span style={styles.routeValue}>{routes.length}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorMessage}>{error.message}</span>
        </div>
      )}

      {/* Warnings */}
      {!hasSufficientBalance && isInputValid && (
        <div style={styles.warningBox}>
          <span style={styles.warningIcon}>⚠️</span>
          <span style={styles.warningMessage}>Insufficient balance</span>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecuteSwap}
        disabled={!canExecuteSwap || !hasSufficientBalance || !isInputValid || isExecutingSwap}
        style={{
          ...styles.executeButton,
          ...(canExecuteSwap && hasSufficientBalance && isInputValid && !isExecutingSwap
            ? styles.executeButtonActive
            : styles.executeButtonDisabled),
        }}
      >
        {!wallet.connected ? (
          'Connect Wallet'
        ) : isLoadingRoutes ? (
          <>
            <span style={styles.spinner}>⏳</span> Finding best route...
          </>
        ) : isExecutingSwap ? (
          <>
            <span style={styles.spinner}>🔄</span> Executing swap...
          </>
        ) : !isInputValid ? (
          'Enter amount'
        ) : !hasSufficientBalance ? (
          'Insufficient balance'
        ) : !bestRoute ? (
          'Get quote first'
        ) : (
          '⚡ Execute Swap'
        )}
      </button>

      {/* Loading Overlay */}
      {isLoadingRoutes && !bestRoute && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}>🔄</div>
          <div style={styles.loadingText}>Fetching best routes...</div>
        </div>
      )}
    </div>
  );
};

// =============================================
// STYLES
// =============================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '24px',
    background: 'linear-gradient(135deg, rgba(12, 20, 30, 0.95), rgba(20, 30, 48, 0.95))',
    borderRadius: '24px',
    border: `2px solid ${dckNeonTheme.colors.neonCyan}`,
    boxShadow: `0 0 40px ${dckNeonTheme.colors.neonCyan}40`,
    position: 'relative' as const,
  },

  header: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },

  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    background: `linear-gradient(90deg, ${dckNeonTheme.colors.neonCyan}, ${dckNeonTheme.colors.neonPurple})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0',
    textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
  },

  subtitle: {
    fontSize: '12px',
    color: dckNeonTheme.colors.textSecondary,
    margin: 0,
  },

  tokenSection: {
    marginBottom: '16px',
    padding: '16px',
    background: 'rgba(0, 245, 255, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(0, 245, 255, 0.2)',
  },

  tokenHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },

  label: {
    fontSize: '14px',
    color: dckNeonTheme.colors.textSecondary,
    fontWeight: '500',
  },

  balance: {
    fontSize: '12px',
    color: dckNeonTheme.colors.neonCyan,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  maxButton: {
    background: 'none',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}`,
    color: dckNeonTheme.colors.neonCyan,
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  inputRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  amountInput: {
    flex: 1,
    background: 'rgba(0, 0, 0, 0.4)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}40`,
    borderRadius: '12px',
    padding: '16px',
    fontSize: '24px',
    color: dckNeonTheme.colors.textPrimary,
    outline: 'none',
    transition: 'all 0.2s',
  },

  tokenSelect: {
    background: 'rgba(0, 0, 0, 0.6)',
    border: `1px solid ${dckNeonTheme.colors.neonPurple}`,
    borderRadius: '12px',
    padding: '16px 12px',
    fontSize: '16px',
    color: dckNeonTheme.colors.textPrimary,
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '100px',
  },

  swapButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '-8px 0',
    position: 'relative' as const,
    zIndex: 10,
  },

  swapButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.neonCyan}, ${dckNeonTheme.colors.neonPurple})`,
    border: '3px solid rgba(12, 20, 30, 0.95)',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: `0 0 20px ${dckNeonTheme.colors.neonCyan}60`,
  },

  settingsSection: {
    marginTop: '24px',
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  settingRow: {
    marginBottom: '16px',
  },

  settingLabel: {
    display: 'block',
    fontSize: '14px',
    color: dckNeonTheme.colors.textSecondary,
    marginBottom: '8px',
    fontWeight: '500',
  },

  presetButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },

  presetButton: {
    flex: 1,
    minWidth: '60px',
    padding: '8px 12px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: dckNeonTheme.colors.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  presetButtonActive: {
    background: dckNeonTheme.colors.neonCyan + '20',
    borderColor: dckNeonTheme.colors.neonCyan,
    color: dckNeonTheme.colors.neonCyan,
    boxShadow: `0 0 12px ${dckNeonTheme.colors.neonCyan}40`,
  },

  customInput: {
    width: '100%',
    marginTop: '8px',
    padding: '8px 12px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}40`,
    borderRadius: '8px',
    color: dckNeonTheme.colors.textPrimary,
    fontSize: '14px',
    outline: 'none',
  },

  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: dckNeonTheme.colors.neonCyan,
  },

  jitoTip: {
    fontSize: '11px',
    color: dckNeonTheme.colors.success,
    marginLeft: '4px',
  },

  routeBox: {
    marginTop: '20px',
    padding: '16px',
    background: 'rgba(0, 245, 255, 0.08)',
    borderRadius: '16px',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}60`,
  },

  routeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },

  routeTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: dckNeonTheme.colors.neonCyan,
  },

  routeToggle: {
    fontSize: '12px',
    color: dckNeonTheme.colors.textSecondary,
  },

  routeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '13px',
  },

  routeLabel: {
    color: dckNeonTheme.colors.textSecondary,
  },

  routeValue: {
    color: dckNeonTheme.colors.textPrimary,
    fontWeight: '500',
  },

  errorBox: {
    marginTop: '16px',
    padding: '12px 16px',
    background: 'rgba(255, 77, 77, 0.1)',
    border: `1px solid ${dckNeonTheme.colors.danger}`,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  errorIcon: {
    fontSize: '20px',
  },

  errorMessage: {
    fontSize: '13px',
    color: dckNeonTheme.colors.danger,
  },

  warningBox: {
    marginTop: '16px',
    padding: '12px 16px',
    background: 'rgba(255, 215, 0, 0.1)',
    border: `1px solid ${dckNeonTheme.colors.neonYellow}`,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  warningIcon: {
    fontSize: '20px',
  },

  warningMessage: {
    fontSize: '13px',
    color: dckNeonTheme.colors.neonYellow,
  },

  executeButton: {
    width: '100%',
    marginTop: '20px',
    padding: '18px',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

  executeButtonActive: {
    background: `linear-gradient(135deg, ${dckNeonTheme.colors.neonCyan}, ${dckNeonTheme.colors.neonPurple})`,
    color: '#fff',
    boxShadow: `0 0 30px ${dckNeonTheme.colors.neonCyan}60`,
  },

  executeButtonDisabled: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: dckNeonTheme.colors.textSecondary,
    cursor: 'not-allowed',
  },

  spinner: {
    animation: 'spin 1s linear infinite',
  },

  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(12, 20, 30, 0.9)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  loadingSpinner: {
    fontSize: '48px',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    marginTop: '16px',
    color: dckNeonTheme.colors.neonCyan,
    fontSize: '14px',
  },
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default SwapWidget;
