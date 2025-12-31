/**
 * QuickSnipeModule (S1)
 * 
 * Quick snipe module for fresh token opportunities
 * Fast execution with preset turbo settings
 * Monitors tokens < 10 minutes old with instant buy capability
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useGlobalTokenData } from '../../data/useGlobalTokenData';
import { useQuickSnipe } from '../../hooks/useQuickSnipe';
import { SnipeButton } from '../SnipeButton';
import { getTokenAgeMinutes } from '../../utils/tokenAge';
import type { Token } from '../../data/tokenTypes';

// =============================================
// TYPES
// =============================================

interface TokenRowProps {
  token: Token;
  onBuy: (mint: string) => void;
}

// =============================================
// COMPONENT
// =============================================

export const QuickSnipeModule: React.FC = () => {
  const { tokens, isLoading } = useGlobalTokenData();
  const { openQuickSnipe } = useQuickSnipe();
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for age timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter and sort tokens: NEW tokens only (< 10 min), sorted newest first
  const freshTokens = useMemo(() => {
    return tokens
      .filter((token: Token) => {
        const ageMinutes = getTokenAgeMinutes(token.createdAt);
        return ageMinutes !== null && ageMinutes < 10 && token.isAlive;
      })
      .sort((a: Token, b: Token) => b.createdAt - a.createdAt); // Newest first
  }, [tokens]);

  const handleBuy = (mint: string) => {
    openQuickSnipe(mint);
    console.log(`💰 BUY TRIGGERED: ${mint}`);
  };

  const handleQuickSnipe = (mint: string) => {
    setSelectedToken(mint);
    openQuickSnipe(mint);
    console.log(`⚡ QUICK SNIPE: ${mint}`);
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <span style={iconStyle}>⚡</span>
          <div>
            <h2 style={titleStyle}>QUICK SNIPE</h2>
            <p style={subtextStyle}>
              Instant buys for new pairs (ideal for &lt;10 min tokens)
            </p>
          </div>
        </div>
        
        {/* Stats Badge */}
        <div style={statsBadgeStyle}>
          <span style={statsLabelStyle}>Fresh Tokens</span>
          <span style={statsValueStyle}>{freshTokens.length}</span>
        </div>
      </div>

      {/* Big Snipe Button (if token selected) */}
      {selectedToken && (
        <div style={bigSnipeContainerStyle}>
          <div style={bigSnipeLabelStyle}>
            Selected: {freshTokens.find((t: Token) => t.mint === selectedToken)?.metadata.symbol}
          </div>
          <SnipeButton
            tokenMint={selectedToken}
            createdAt={freshTokens.find((t: Token) => t.mint === selectedToken)?.createdAt}
          />
        </div>
      )}

      {/* Token List */}
      <div style={listContainerStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <div style={spinnerStyle}>⚡</div>
            <p style={loadingTextStyle}>Loading fresh tokens...</p>
          </div>
        ) : freshTokens.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>🔍</div>
            <p style={emptyTextStyle}>No fresh tokens detected</p>
            <p style={emptySubtextStyle}>Waiting for new pairs...</p>
          </div>
        ) : (
          <div style={scrollContainerStyle}>
            {freshTokens.map((token: Token) => (
              <TokenRow
                key={token.mint}
                token={token}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================
// TOKEN ROW COMPONENT
// =============================================

const TokenRow: React.FC<TokenRowProps> = ({ token, onBuy }) => {
  const { openQuickSnipe } = useQuickSnipe();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const ageMinutes = getTokenAgeMinutes(token.createdAt);
  const ageSeconds = ageMinutes !== null ? ageMinutes * 60 : 0;
  const isVeryFresh = ageMinutes !== null && ageMinutes < 2;
  const showSnipeButton = ageMinutes !== null && ageMinutes < 10;

  // Format age as mm:ss
  const formatAge = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        ...rowStyle,
        ...(isVeryFresh ? rowFreshStyle : {}),
      }}
    >
      {/* Token Info */}
      <div style={tokenInfoStyle}>
        <div style={tokenSymbolStyle}>{token.metadata.symbol}</div>
        <div style={tokenNameStyle}>{token.metadata.name}</div>
      </div>

      {/* Price */}
      <div style={dataColumnStyle}>
        <div style={dataLabelStyle}>Price</div>
        <div style={dataValueStyle}>
          ${token.market.price.toFixed(8)}
        </div>
      </div>

      {/* Bonding Progress */}
      <div style={dataColumnStyle}>
        <div style={dataLabelStyle}>Bonding</div>
        <div style={progressContainerStyle}>
          <div style={progressBarStyle}>
            <div
              style={{
                ...progressFillStyle,
                width: `${token.bonding.bondingProgress}%`,
              }}
            />
          </div>
          <span style={progressTextStyle}>
            {token.bonding.bondingProgress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Age Timer */}
      <div style={dataColumnStyle}>
        <div style={dataLabelStyle}>Age</div>
        <div style={{
          ...ageTimerStyle,
          color: isVeryFresh ? '#22C55E' : '#00E4FF',
        }}>
          {formatAge(ageSeconds)}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={actionsStyle}>
        <button
          onClick={() => onBuy(token.mint)}
          style={buyButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          💰 BUY
        </button>

        {showSnipeButton && (
          <SnipeButton
            tokenMint={token.mint}
            createdAt={token.createdAt}
          />
        )}
      </div>

      {/* Fresh indicator */}
      {isVeryFresh && (
        <div style={freshBadgeStyle}>
          🔥 FRESH
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

const statsBadgeStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '12px 20px',
  background: 'rgba(0, 228, 255, 0.1)',
  border: '1px solid rgba(0, 228, 255, 0.3)',
  borderRadius: '12px',
};

const statsLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const statsValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#00E4FF',
  textShadow: '0 0 10px rgba(0, 228, 255, 0.6)',
};

const bigSnipeContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  marginBottom: '20px',
  background: 'rgba(255, 62, 191, 0.05)',
  border: '2px solid rgba(255, 62, 191, 0.3)',
  borderRadius: '12px',
  boxShadow: '0 0 20px rgba(255, 62, 191, 0.2)',
};

const bigSnipeLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#FF3EBF',
};

const listContainerStyle: React.CSSProperties = {
  minHeight: '350px',
};

const scrollContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxHeight: '600px',
  overflowY: 'auto',
  paddingRight: '8px',
};

const rowStyle: React.CSSProperties = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1.5fr 0.8fr 2fr',
  gap: '16px',
  alignItems: 'center',
  padding: '16px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(0, 228, 255, 0.2)',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
};

const rowFreshStyle: React.CSSProperties = {
  background: 'rgba(34, 197, 94, 0.05)',
  border: '2px solid rgba(34, 197, 94, 0.3)',
  boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
};

const tokenInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const tokenSymbolStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#00E4FF',
};

const tokenNameStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9CA3AF',
};

const dataColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const dataLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#6B7280',
  textTransform: 'uppercase',
};

const dataValueStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#E5E7EB',
  fontFamily: 'monospace',
};

const progressContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const progressBarStyle: React.CSSProperties = {
  flex: 1,
  height: '6px',
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const progressFillStyle: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #00E4FF, #FF3EBF)',
  borderRadius: '3px',
  transition: 'width 0.3s ease',
};

const progressTextStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#00E4FF',
  minWidth: '45px',
};

const ageTimerStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  fontFamily: 'monospace',
  textShadow: '0 0 8px currentColor',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
};

const buyButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: 700,
  background: 'rgba(0, 228, 255, 0.15)',
  border: '2px solid rgba(0, 228, 255, 0.4)',
  borderRadius: '8px',
  color: '#00E4FF',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
};

const freshBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  padding: '4px 12px',
  fontSize: '10px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #22C55E, #10B981)',
  color: '#FFF',
  borderRadius: '12px',
  boxShadow: '0 0 15px rgba(34, 197, 94, 0.6)',
  animation: 'pulse 1.5s infinite',
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
};

const spinnerStyle: React.CSSProperties = {
  fontSize: '48px',
  animation: 'spin 2s linear infinite',
};

const loadingTextStyle: React.CSSProperties = {
  marginTop: '16px',
  fontSize: '14px',
  color: '#9CA3AF',
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
};

// =============================================
// EXPORTS
// =============================================

export default QuickSnipeModule;
