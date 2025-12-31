/**
 * SwapWidget Usage Example
 * 
 * How to integrate the SwapWidget into your app
 */

import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import SwapWidget from '../components/SwapWidget';
import type { SwapResult } from '../swap';

// =============================================
// BASIC USAGE
// =============================================

export function BasicSwapPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Token Swap</h1>
      <SwapWidget />
    </div>
  );
}

// =============================================
// WITH CALLBACK
// =============================================

export function SwapPageWithCallback() {
  const handleSwapComplete = (result: SwapResult) => {
    console.log('Swap completed!', result);
    
    // Show notification
    alert(`Swap successful! TX: ${result.signature}`);
    
    // Log to analytics
    // analytics.track('swap_completed', { ... });
    
    // Refresh token balances
    // refreshBalances();
  };

  return (
    <div style={{ padding: '40px' }}>
      <SwapWidget onSwapComplete={handleSwapComplete} />
    </div>
  );
}

// =============================================
// WITH DEFAULT TOKENS
// =============================================

export function SwapPageWithDefaults() {
  return (
    <div style={{ padding: '40px' }}>
      <SwapWidget
        defaultInputToken="So11111111111111111111111111111111111111112" // SOL
        defaultOutputToken="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // USDC
        onSwapComplete={(result) => {
          console.log('Swapped SOL → USDC:', result);
        }}
      />
    </div>
  );
}

// =============================================
// FULL PAGE EXAMPLE
// =============================================

export function SwapDashboard() {
  const [swapHistory, setSwapHistory] = React.useState<SwapResult[]>([]);

  const handleSwapComplete = (result: SwapResult) => {
    setSwapHistory((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10
  };

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🎨 DCK Token Swap</h1>
        <WalletMultiButton />
      </header>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Swap Widget */}
        <div style={styles.swapSection}>
          <SwapWidget onSwapComplete={handleSwapComplete} />
        </div>

        {/* Swap History */}
        {swapHistory.length > 0 && (
          <div style={styles.historySection}>
            <h2 style={styles.historyTitle}>Recent Swaps</h2>
            {swapHistory.map((swap, index) => (
              <div key={index} style={styles.historyItem}>
                <div style={styles.historyDetails}>
                  <span>TX: {swap.signature.slice(0, 8)}...</span>
                  <span>Impact: {swap.priceImpact.toFixed(2)}%</span>
                  <span>Fees: {swap.fees.totalFees.toFixed(4)} SOL</span>
                </div>
                <a
                  href={`https://solscan.io/tx/${swap.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.viewLink}
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// EMBEDDED IN MODAL
// =============================================

export function SwapModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>
          ✕
        </button>
        <SwapWidget
          onSwapComplete={(result) => {
            console.log('Swap in modal:', result);
            setTimeout(onClose, 2000); // Auto-close after 2s
          }}
        />
      </div>
    </div>
  );
}

// =============================================
// STYLES
// =============================================

const styles = {
  dashboard: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1e3a 100%)',
    padding: '20px',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    padding: '20px',
  },

  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #00f5ff, #b066ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },

  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  swapSection: {
    display: 'flex',
    alignItems: 'flex-start',
  },

  historySection: {
    background: 'rgba(12, 20, 30, 0.6)',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid rgba(0, 245, 255, 0.3)',
  },

  historyTitle: {
    fontSize: '20px',
    color: '#00f5ff',
    marginBottom: '16px',
  },

  historyItem: {
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  historyDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    fontSize: '12px',
    color: '#ccc',
  },

  viewLink: {
    color: '#00f5ff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
  },

  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  modalContent: {
    position: 'relative' as const,
    maxWidth: '90%',
  },

  closeButton: {
    position: 'absolute' as const,
    top: -40,
    right: 0,
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px 16px',
  },
};

export default SwapDashboard;
