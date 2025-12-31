/**
 * SwapModal Component
 * 
 * Centered neon modal containing SwapWidget
 */

import React, { useEffect } from 'react';
import { Connection } from '@solana/web3.js';
import SwapWidget from './SwapWidget';
import { dckNeonTheme } from '../../styles/dckNeonTheme';
import type { SwapResult } from '../swap';

// =============================================
// TYPES
// =============================================

interface SwapModalProps {
  /** Whether modal is open */
  open: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Default input token mint */
  defaultInputToken?: string;
  
  /** Default output token mint */
  defaultOutputToken?: string;
  
  /** Solana connection */
  connection?: Connection;
  
  /** Optional callback when swap completes */
  onSwapComplete?: (result: SwapResult) => void;
}

// =============================================
// COMPONENT
// =============================================

export const SwapModal: React.FC<SwapModalProps> = ({
  open,
  onClose,
  defaultInputToken,
  defaultOutputToken,
  onSwapComplete,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleSwapComplete = (result: SwapResult) => {
    console.log('✅ Swap completed in modal:', result.signature);
    
    // Call optional callback
    if (onSwapComplete) {
      onSwapComplete(result);
    }

    // Auto-close modal after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} style={styles.closeButton} aria-label="Close modal">
          ✕
        </button>

        {/* SwapWidget */}
        <div style={styles.content}>
          <SwapWidget
            defaultInputToken={defaultInputToken}
            defaultOutputToken={defaultOutputToken}
            onSwapComplete={handleSwapComplete}
          />
        </div>
      </div>
    </div>
  );
};

// =============================================
// STYLES
// =============================================

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.3s ease-out',
  },

  modalContainer: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '520px',
    animation: 'slideUp 0.3s ease-out',
  },

  closeButton: {
    position: 'absolute' as const,
    top: -50,
    right: 0,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.6)',
    border: `2px solid ${dckNeonTheme.colors.neonCyan}`,
    color: dckNeonTheme.colors.neonCyan,
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: `0 0 20px ${dckNeonTheme.colors.neonCyan}40`,
  },

  content: {
    width: '100%',
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  
  // Only append if not already added
  if (!document.getElementById('swap-modal-styles')) {
    style.id = 'swap-modal-styles';
    document.head.appendChild(style);
  }
}

export default SwapModal;
