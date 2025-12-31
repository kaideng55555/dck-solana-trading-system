/**
 * TokenInfoPanel Component (Trader Terminal - Info Panel)
 * 
 * Right-side information panel for detailed token data and quick actions
 * 
 * Features:
 * - Comprehensive token statistics
 * - Bonding curve progress visualization
 * - Risk assessment indicators
 * - Social links integration
 * - Quick action buttons (Buy/Sell/Snipe)
 * - DCK Neon graffiti styling
 * - Sound effects integration
 * - Animated interactions
 */

import React, { useState } from 'react';
import { useToken } from '../data/tokenDataStore';
import { useSwapStore, DEFAULT_TOKENS } from '../stores/swapStore';
import { useQuickSnipe } from '../hooks/useQuickSnipe';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface TokenInfoPanelProps {
  /** Token mint address */
  mint: string;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Format large numbers with K, M, B suffixes
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format price with appropriate decimals
 */
function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
}

/**
 * Format token age
 */
function formatAge(ageMinutes: number): { text: string; color: string } {
  const days = Math.floor(ageMinutes / (60 * 24));
  const hours = Math.floor((ageMinutes % (60 * 24)) / 60);
  const mins = Math.floor(ageMinutes % 60);
  
  let text = '';
  if (days > 0) text = `${days}d ${hours}h old`;
  else if (hours > 0) text = `${hours}h ${mins}m old`;
  else text = `${mins}m old`;
  
  // Color coding based on age
  let color = '#00E4FF'; // Fresh (< 1 hour)
  if (ageMinutes > 60 * 24) color = '#6B7280'; // > 1 day (gray)
  else if (ageMinutes > 60) color = '#FFD700'; // > 1 hour (yellow)
  
  return { text, color };
}

/**
 * Get bonding stage
 */
function getBondingStage(progress: number): { label: string; color: string } {
  if (progress >= 100) return { label: 'GRADUATED', color: '#00E4FF' };
  if (progress >= 90) return { label: 'LATE', color: '#FFA500' };
  if (progress >= 50) return { label: 'MID', color: '#FFD700' };
  return { label: 'NEW', color: '#9B00FF' };
}

/**
 * Get authority risk status
 */
function getAuthorityStatus(token: any): { label: string; color: string } {
  if (!token) return { label: 'UNKNOWN', color: '#6B7280' };
  
  if (token.isFullyRenounced) return { label: 'SAFE', color: '#00E4FF' };
  if (token.fakeRenounceDetected || token.authorityRiskScore > 70) {
    return { label: 'DANGER', color: '#FF3E3E' };
  }
  if (token.authorityRiskScore > 40) return { label: 'WARNING', color: '#FFD700' };
  
  return { label: 'SAFE', color: '#00E4FF' };
}

/**
 * Get liquidity status
 */
function getLiquidityStatus(token: any): { label: string; color: string } {
  if (!token) return { label: 'UNKNOWN', color: '#6B7280' };
  
  if (token.rugLikely || token.honeypotRisk) {
    return { label: 'CRITICAL', color: '#FF3E3E' };
  }
  if (token.earlyRugWarning || token.liquidityHealth < 50) {
    return { label: 'LOW', color: '#FFD700' };
  }
  if (token.liquidityHealth >= 70 && token.lpLocked) {
    return { label: 'HEALTHY', color: '#00E4FF' };
  }
  
  return { label: 'MEDIUM', color: '#FFD700' };
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

/**
 * Truncate mint address
 */
function truncateMint(mint: string): string {
  return `${mint.slice(0, 6)}...${mint.slice(-4)}`;
}

// =============================================
// COMPONENT
// =============================================

export const TokenInfoPanel: React.FC<TokenInfoPanelProps> = ({ mint }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  const token = useToken(mint);
  const openSwap = useSwapStore((state) => state.openSwap);
  const { openQuickSnipe } = useQuickSnipe();
  const { play } = useSFX();

  // Inject CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInPanel {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes bondingPulse {
        0%, 100% { box-shadow: 0 0 15px rgba(255,62,62,0.6); }
        50% { box-shadow: 0 0 30px rgba(255,62,62,0.9); }
      }
      
      @keyframes dangerFlicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes sprayHover {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.05) rotate(2deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      @keyframes dripEffect {
        from { transform: translateY(0); opacity: 0.8; }
        to { transform: translateY(4px); opacity: 0; }
      }
      
      .info-button {
        transition: all 0.2s ease;
      }
      
      .info-button:hover {
        transform: scale(1.05);
        animation: sprayHover 0.6s ease-in-out;
      }
      
      .info-button:active {
        transform: scale(0.98);
      }
      
      .neon-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .neon-scrollbar::-webkit-scrollbar-track {
        background: #161621;
        border-radius: 4px;
      }
      
      .neon-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #00E4FF 0%, #9B00FF 100%);
        border-radius: 4px;
      }
      
      .neon-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #00F5FF 0%, #B000FF 100%);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // =============================================
  // HANDLERS
  // =============================================

  const handleBuy = () => {
    play('buy');
    openSwap(DEFAULT_TOKENS.SOL, mint, 'default');
    console.log(`🟢 BUY: ${mint}`);
  };

  const handleSell = () => {
    play('sell');
    openSwap(mint, DEFAULT_TOKENS.SOL, 'default');
    console.log(`🔴 SELL: ${mint}`);
  };

  const handleSnipe = () => {
    play('shotgun');
    openQuickSnipe(mint);
    console.log(`⚡ SNIPE: ${mint}`);
  };

  const handleCopyMint = async () => {
    await copyToClipboard(mint);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // =============================================
  // RENDER DATA
  // =============================================

  if (!token) {
    return (
      <div
        style={{
          width: isMobile ? '100%' : 350,
          height: isMobile ? 'auto' : '100%',
          background: '#0B0B0F',
          border: '2px solid #2A2A3A',
          borderRadius: '12px',
          padding: isMobile ? '12px' : '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280',
          fontSize: '14px',
          animation: 'fadeInPanel 0.5s ease-out',
        }}
      >
        Loading token data...
      </div>
    );
  }

  const ageData = formatAge(token.ageMinutes);
  const bondingStage = getBondingStage(token.bonding.bondingProgress);
  const authorityStatus = getAuthorityStatus(token);
  const liquidityStatus = getLiquidityStatus(token);
  
  const bondingProgress = token.bonding.bondingProgress || 0;
  const shouldPulseBonding = bondingProgress >= 99;
  const shouldGlowBonding = bondingProgress >= 96;

  // =============================================
  // RENDER
  // =============================================

  return (
    <div
      className="neon-scrollbar"
      style={{
        width: isMobile ? '100%' : 350,
        height: isMobile ? 'auto' : '100%',
        background: 'linear-gradient(180deg, #0B0B0F 0%, #161621 100%)',
        border: '2px solid transparent',
        borderRadius: '12px',
        backgroundClip: 'padding-box',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInPanel 0.5s ease-out',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Gradient border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
          borderRadius: '12px',
          zIndex: -1,
          padding: '2px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #0B0B0F 0%, #161621 100%)',
            borderRadius: '10px',
          }}
        />
      </div>

      {/* Scrollable content */}
      <div
        className="dck-glow-scrollbar"
        style={{
          height: '100%',
          overflowY: isMobile ? 'visible' : 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '12px' : '16px',
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            {token.metadata.image && (
              <img
                src={token.metadata.image}
                alt={token.metadata.symbol}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '2px solid #00E4FF',
                  boxShadow: '0 0 12px rgba(0,245,255,0.5)',
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                {token.metadata.name}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#00E4FF',
                  textShadow: '0 0 8px rgba(0,245,255,0.6)',
                }}
              >
                ${token.metadata.symbol}
              </div>
            </div>
          </div>

          {/* Mint Address */}
          <div
            onClick={handleCopyMint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#161621',
              border: '1px solid #2A2A3A',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#B8BCC8', fontFamily: 'monospace', flex: 1 }}>
              {truncateMint(mint)}
            </span>
            <span style={{ fontSize: '16px' }}>
              {copySuccess ? '✅' : '📋'}
            </span>
          </div>

          {/* Age */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: ageData.color,
              textShadow: `0 0 8px ${ageData.color}`,
            }}
          >
            🕐 {ageData.text}
          </div>
        </div>

        {/* Key Stats Section */}
        <SectionHeader title="📊 KEY STATS" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <StatBox label="Price" value={formatPrice(token.market.price)} highlight />
          <StatBox label="Market Cap" value={formatLargeNumber(token.market.marketCap)} />
          <StatBox label="Liquidity" value={formatLargeNumber(token.market.liquidity)} />
          <StatBox label="Volume 24h" value={formatLargeNumber(token.market.volume24h)} />
          {token.market.holders && (
            <StatBox label="Holders" value={token.market.holders.toLocaleString()} />
          )}
        </div>

        {/* Bonding Curve Section */}
        <SectionHeader title="🔥 BONDING CURVE" />
        <div
          className={bondingProgress >= 95 ? 'dck-bonding-flicker' : ''}
          style={{
            padding: '16px',
            background: '#161621',
            border: shouldGlowBonding ? '2px solid #FFA500' : '1px solid #2A2A3A',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: shouldPulseBonding 
              ? '0 0 20px rgba(255,62,62,0.6)' 
              : shouldGlowBonding 
              ? '0 0 15px rgba(255,165,0,0.5)' 
              : 'none',
            animation: shouldPulseBonding ? 'bondingPulse 2s infinite' : 'none',
          }}
        >
          {/* Progress Bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#B8BCC8' }}>Progress</span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: bondingStage.color,
                  textShadow: `0 0 8px ${bondingStage.color}`,
                }}
              >
                {bondingProgress.toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: isMobile ? '10px' : '8px',
                background: '#0B0B0F',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #2A2A3A',
              }}
            >
              <div
                style={{
                  width: `${Math.min(bondingProgress, 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${bondingStage.color} 0%, ${bondingStage.color}CC 100%)`,
                  boxShadow: `0 0 10px ${bondingStage.color}`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Velocity & Stage */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {token.bonding.velocityScore !== undefined && (
              <div
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#0B0B0F',
                  border: '1px solid #2A2A3A',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}>
                  Velocity
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#00E4FF',
                    textShadow: '0 0 6px rgba(0,245,255,0.6)',
                  }}
                >
                  {token.bonding.velocityScore.toFixed(0)}%
                </div>
              </div>
            )}
            <div
              style={{
                flex: 1,
                padding: '8px',
                background: '#0B0B0F',
                border: `1px solid ${bondingStage.color}`,
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}>
                Stage
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: bondingStage.color,
                  textShadow: `0 0 6px ${bondingStage.color}`,
                }}
              >
                {bondingStage.label}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Section */}
        <SectionHeader title="🛡️ RISK ASSESSMENT" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <RiskBox label="Authority" status={authorityStatus} />
          <RiskBox label="Liquidity" status={liquidityStatus} />
          <RiskBox
            label="LP Lock"
            status={{
              label: token.lpLocked ? 'LOCKED' : 'UNLOCKED',
              color: token.lpLocked ? '#00E4FF' : '#FF3E3E',
            }}
          />
        </div>

        {/* Social Links Section */}
        {(token.socials.website || token.socials.twitter || token.socials.telegram || token.socials.discord) && (
          <>
            <SectionHeader title="🌐 SOCIAL LINKS" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {token.socials.website && (
                <SocialButton
                  label="Website"
                  icon="🌐"
                  color="#00E4FF"
                  onClick={() => handleSocialClick(token.socials.website!)}
                />
              )}
              {token.socials.twitter && (
                <SocialButton
                  label="Twitter"
                  icon="🐦"
                  color="#1DA1F2"
                  onClick={() => handleSocialClick(token.socials.twitter!)}
                />
              )}
              {token.socials.telegram && (
                <SocialButton
                  label="Telegram"
                  icon="✈️"
                  color="#0088CC"
                  onClick={() => handleSocialClick(token.socials.telegram!)}
                />
              )}
              {token.socials.discord && (
                <SocialButton
                  label="Discord"
                  icon="💬"
                  color="#5865F2"
                  onClick={() => handleSocialClick(token.socials.discord!)}
                />
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '10px' : '8px' }}>
          <button
            className="info-button"
            onClick={handleBuy}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00E4FF 0%, #00C3E6 100%)',
              border: '2px solid #00E4FF',
              color: '#000000',
              fontSize: isMobile ? '15px' : '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isMobile ? 'none' : '0 0 20px rgba(0,245,255,0.5)',
              letterSpacing: '0.5px',
            }}
          >
            🟢 BUY {token.metadata.symbol}
          </button>

          <button
            className="info-button"
            onClick={handleSell}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF3EBF 0%, #E62A9F 100%)',
              border: '2px solid #FF3EBF',
              color: '#FFFFFF',
              fontSize: isMobile ? '15px' : '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isMobile ? 'none' : '0 0 20px rgba(255,62,191,0.5)',
              letterSpacing: '0.5px',
            }}
          >
            🔴 SELL {token.metadata.symbol}
          </button>

          <button
            className="info-button"
            onClick={handleSnipe}
            style={{
              width: '100%',
              padding: isMobile ? '14px' : '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #9B00FF 0%, #7A00CC 100%)',
              border: '2px solid #9B00FF',
              color: '#FFFFFF',
              fontSize: isMobile ? '15px' : '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isMobile ? 'none' : '0 0 20px rgba(155,0,255,0.5)',
              letterSpacing: '0.5px',
              gridColumn: isMobile ? '1' : '1 / -1',
            }}
          >
            ⚡ SNIPE {token.metadata.symbol}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// SUB-COMPONENTS
// =============================================

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <div style={{ marginBottom: '12px', position: 'relative' }}>
    <div
      style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#00E4FF',
        textShadow: '0 0 10px rgba(0,245,255,0.8)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}
    >
      {title}
    </div>
    {/* Graffiti drip effect */}
    <div
      style={{
        position: 'absolute',
        bottom: -6,
        left: 0,
        width: '60px',
        height: '2px',
        background: 'linear-gradient(90deg, #00E4FF 0%, transparent 100%)',
        animation: 'dripEffect 2s ease-in-out infinite',
      }}
    />
  </div>
);

interface StatBoxProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, highlight }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: highlight ? '12px' : '10px 12px',
      background: highlight ? '#161621' : '#0B0B0F',
      border: highlight ? '2px solid #00E4FF' : '1px solid #2A2A3A',
      borderRadius: '8px',
      boxShadow: highlight ? '0 0 15px rgba(0,245,255,0.3)' : 'none',
    }}
  >
    <span style={{ fontSize: '12px', color: '#B8BCC8' }}>{label}</span>
    <span
      style={{
        fontSize: highlight ? '16px' : '14px',
        fontWeight: 700,
        color: highlight ? '#00E4FF' : '#FFFFFF',
        textShadow: highlight ? '0 0 8px rgba(0,245,255,0.6)' : 'none',
      }}
    >
      {value}
    </span>
  </div>
);

interface RiskBoxProps {
  label: string;
  status: { label: string; color: string };
}

const RiskBox: React.FC<RiskBoxProps> = ({ label, status }) => {
  const isDanger = status.label === 'DANGER' || status.label === 'CRITICAL';
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        background: '#161621',
        border: `1px solid ${status.color}`,
        borderRadius: '8px',
        animation: isDanger ? 'dangerFlicker 2s infinite' : 'none',
        boxShadow: `0 0 10px ${status.color}33`,
      }}
    >
      <span style={{ fontSize: '12px', color: '#B8BCC8' }}>{label}</span>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: status.color,
          textShadow: `0 0 8px ${status.color}`,
          padding: '4px 8px',
          background: `${status.color}22`,
          borderRadius: '4px',
        }}
      >
        {status.label}
      </span>
    </div>
  );
};

interface SocialButtonProps {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ label, icon, color, onClick }) => (
  <button
    className="info-button"
    onClick={onClick}
    style={{
      padding: '8px 14px',
      borderRadius: '8px',
      background: `${color}22`,
      border: `1px solid ${color}`,
      color: color,
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: `0 0 10px ${color}33`,
    }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

export default TokenInfoPanel;
