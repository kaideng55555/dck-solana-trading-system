/**
 * SnipeButton Component (S1 Module)
 * 
 * Lightning-fast snipe button for fresh tokens
 * Features:
 * - Neon gradient (#FF3EBF → #9B00FF → #00E4FF)
 * - Pulsing border for fresh tokens (< 2 min old)
 * - Graffiti drip shadow effect
 * - Preset turbo configuration (10% slippage, Jito enabled)
 */

import React, { useState } from 'react';
import { useQuickSnipe } from '../hooks/useQuickSnipe';
import { isFreshToken } from '../utils/tokenAge';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface SnipeButtonProps {
  /** Token mint address to snipe */
  tokenMint: string;
  
  /** Token creation timestamp (for fresh detection) */
  createdAt?: number;
}

// =============================================
// COMPONENT
// =============================================

export const SnipeButton: React.FC<SnipeButtonProps> = ({
  tokenMint,
  createdAt,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const { openQuickSnipe } = useQuickSnipe();
  const { play } = useSFX();

  // Check if token is fresh (< 2 min old) for pulsing border
  const shouldPulse = createdAt ? isFreshToken(createdAt) : false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent handlers

    // Play shotgun sound
    play('shotgun');

    // Active state (scale 0.97)
    setIsActive(true);
    setTimeout(() => setIsActive(false), 150);

    // Execute quick snipe
    openQuickSnipe(tokenMint);
    
    console.log(`⚡ QUICK SNIPE TRIGGERED: ${tokenMint}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // White flash on hover (80ms)
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 80);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#FFFFFF',
    background: 'linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
    border: shouldPulse ? '2px solid #00E4FF' : '2px solid transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: isHovered
      ? '0 0 30px rgba(255,62,191,0.6), 0 0 20px rgba(155,0,255,0.4), 0 0 10px rgba(0,228,255,0.5)'
      : '0 0 20px rgba(255,62,191,0.4), 0 0 10px rgba(155,0,255,0.3)',
    transform: isActive ? 'scale(0.97)' : isHovered ? 'scale(1.02)' : 'scale(1)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
    overflow: 'hidden',
    animation: shouldPulse ? 'pulseBorder 2s ease-in-out infinite' : 'none',
  };

  const flashStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.3)',
    opacity: showFlash ? 1 : 0,
    transition: 'opacity 80ms linear',
    pointerEvents: 'none',
    borderRadius: '10px',
  };

  return (
    <>
      <style>
        {`
          @keyframes pulseBorder {
            0%, 100% {
              border-color: #00E4FF;
              box-shadow: 0 0 20px rgba(255,62,191,0.4), 0 0 10px rgba(155,0,255,0.3), 0 0 15px rgba(0,228,255,0.6);
            }
            50% {
              border-color: #FF3EBF;
              box-shadow: 0 0 30px rgba(255,62,191,0.8), 0 0 15px rgba(155,0,255,0.5), 0 0 20px rgba(0,228,255,0.4);
            }
          }
        `}
      </style>
      
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={buttonStyle}
        title="Quick snipe with turbo settings (10% slippage, Jito enabled)"
      >
        {/* White flash overlay */}
        <div style={flashStyle} />
        
        {/* Icon */}
        <span style={{ fontSize: '16px', position: 'relative', zIndex: 1 }}>⚡</span>
        
        {/* Label */}
        <span style={{ position: 'relative', zIndex: 1 }}>SNIPE</span>
      </button>
    </>
  );
};

// =============================================
// EXPORTS
// =============================================

export default SnipeButton;
