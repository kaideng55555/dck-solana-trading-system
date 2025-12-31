/**
 * ExplorerDesktop Page
 * 
 * 3-column desktop layout for token exploration
 * Columns:
 * - Left: New Pairs (fresh tokens with SnipeButton)
 * - Middle: About to Graduate (bonding curve tokens with CurveEdge tags)
 * - Right: Graduated (fully launched tokens with Buy/Sell)
 * 
 * Features:
 * - Graffiti neon headers (pink → purple → cyan)
 * - Spray-paint drip effects
 * - Independent scrolling columns
 * - Desktop-only (hidden < 1024px)
 * - Age timers, velocity indicators, market cap sorting
 */

import React, { useMemo, useState, useEffect } from 'react';
import CoinCardExplorer from '../components/cards/CoinCardExplorer';
import { SnipeButton } from '../components/SnipeButton';
import { useFreshTokens, useCurveEdgeTokens, useGraduatedTokens, useLastUpdated } from '../feed/useLiveTokens';

// =============================================
// TYPES
// =============================================

interface ColumnProps {
  title: string;
  emoji: string;
  tokens: any[];
  columnType: 'new' | 'graduating' | 'graduated';
  gradientColors: string;
  glowColor: string;
}

// =============================================
// HELPERS
// =============================================

/**
 * Format age in seconds to human-readable string
 */
function formatAge(ageSeconds: number): string {
  if (ageSeconds < 60) return `${Math.floor(ageSeconds)}s`;
  if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)}m`;
  if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)}h`;
  return `${Math.floor(ageSeconds / 86400)}d`;
}

/**
 * Get age color (red = fresh, green = old)
 */
function getAgeColor(ageSeconds: number): string {
  if (ageSeconds < 120) return '#FF3EBF'; // < 2min = hot pink
  if (ageSeconds < 300) return '#FF8C00'; // < 5min = orange
  return '#00FF8C'; // > 5min = green
}

/**
 * Format market cap
 */
function formatMarketCap(mc: number): string {
  if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(2)}M`;
  if (mc >= 1_000) return `$${(mc / 1_000).toFixed(1)}K`;
  return `$${mc.toFixed(0)}`;
}

// =============================================
// COLUMN COMPONENT
// =============================================

const ExplorerColumn: React.FC<ColumnProps> = ({
  title,
  emoji,
  tokens,
  columnType,
  gradientColors,
  glowColor,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every second for age timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
      }}
    >
      {/* Graffiti Header */}
      <div
        style={{
          padding: '18px 20px',
          background: `linear-gradient(135deg, ${gradientColors})`,
          borderRadius: '14px 14px 0 0',
          borderBottom: `4px solid ${glowColor}`,
          boxShadow: `0 0 25px ${glowColor}, 0 4px 20px rgba(0,0,0,0.5), inset 0 -2px 10px rgba(0,0,0,0.3)`,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Top gradient line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
            filter: 'blur(1.5px)',
          }}
        />

        {/* Spray drip effects */}
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            left: '20%',
            width: '3px',
            height: '12px',
            background: glowColor,
            borderRadius: '0 0 2px 2px',
            filter: `drop-shadow(0 0 4px ${glowColor})`,
            animation: 'dripPulse 2s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            width: '2px',
            height: '10px',
            background: glowColor,
            borderRadius: '0 0 2px 2px',
            filter: `drop-shadow(0 0 4px ${glowColor})`,
            animation: 'dripPulse 2.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: '75%',
            width: '4px',
            height: '14px',
            background: glowColor,
            borderRadius: '0 0 2px 2px',
            filter: `drop-shadow(0 0 4px ${glowColor})`,
            animation: 'dripPulse 3s ease-in-out infinite',
          }}
        />

        <h2
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'Impact, Anton, Arial Black, sans-serif',
            color: '#fff',
            textShadow: `0 0 12px ${glowColor}, 0 0 24px rgba(255,62,191,0.6), 2px 2px 4px rgba(0,0,0,0.8)`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '28px' }}>{emoji}</span>
          {title}
        </h2>

        <div
          style={{
            marginTop: '8px',
            fontSize: '13px',
            opacity: 0.85,
            fontWeight: 700,
            textShadow: '0 0 8px rgba(0,0,0,0.8)',
          }}
        >
          {tokens.length} token{tokens.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Scrollable Body */}
      <div
        className="explorer-column-scroll dck-glow-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '10px 16px',
          background: 'rgba(10,10,20,0.8)',
          borderRadius: '0 0 14px 14px',
          border: `1px solid ${glowColor}`,
          borderTop: 'none',
          boxShadow: `inset 0 4px 15px rgba(0,0,0,0.5), 0 0 15px ${glowColor}`,
        }}
      >
        {tokens.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '14px',
              fontStyle: 'italic',
            }}
          >
            No tokens yet...
          </div>
        ) : (
          tokens.map((token) => {
            const ageSeconds = token.metadata?.createdAt 
              ? (currentTime - token.metadata.createdAt) / 1000 
              : 0;
            const ageColor = getAgeColor(ageSeconds);
            const progress = token.bonding?.bondingProgress || 0;
            const velocity = token.bonding?.velocityScore || 0;
            const marketCap = token.market?.marketCap || 0;

            return (
              <div
                key={token.mint}
                style={{
                  marginBottom: '14px',
                  transition: 'all 0.15s ease-out',
                }}
                className="explorer-card-wrapper"
                data-column={columnType}
              >
                <CoinCardExplorer
                  coin={{
                    address: token.mint,
                    name: token.metadata?.name || 'Unknown',
                    symbol: token.metadata?.symbol || '???',
                    logo: token.metadata?.image || '',
                    age: token.metadata?.createdAt ? (Date.now() - token.metadata.createdAt) / 1000 : 0,
                    marketCap: token.market?.marketCap || 0,
                    volume24h: token.market?.volume24h || 0,
                    price: token.market?.price || 0,
                    bondingProgress: token.bonding?.bondingProgress || 0,
                    lpBurned: token.lpBurned,
                    mintAuthDisabled: !token.authorities?.mintAuthority,
                    freezeDisabled: !token.authorities?.freezeAuthority,
                  }}
                />

                {/* Column-specific metadata */}
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {columnType === 'new' && (
                    <>
                      <span style={{ opacity: 0.7 }}>Age:</span>
                      <span
                        style={{
                          color: ageColor,
                          fontWeight: 700,
                          textShadow: `0 0 8px ${ageColor}`,
                        }}
                      >
                        {formatAge(ageSeconds)}
                      </span>
                    </>
                  )}

                  {columnType === 'graduating' && (
                    <>
                      <span style={{ opacity: 0.7 }}>Progress:</span>
                      <span
                        style={{
                          color: '#FF8C00',
                          fontWeight: 700,
                          textShadow: '0 0 8px rgba(255,140,0,0.8)',
                        }}
                      >
                        {progress.toFixed(1)}%
                      </span>
                      {velocity > 0 && (
                        <>
                          <span style={{ opacity: 0.5, marginLeft: '10px' }}>•</span>
                          <span style={{ opacity: 0.7, marginLeft: '10px' }}>Velocity:</span>
                          <span
                            style={{
                              color: velocity > 50 ? '#00FF8C' : '#FFD700',
                              fontWeight: 700,
                            }}
                          >
                            {velocity.toFixed(0)}
                          </span>
                        </>
                      )}
                    </>
                  )}

                  {columnType === 'graduated' && (
                    <>
                      <span style={{ opacity: 0.7 }}>Market Cap:</span>
                      <span
                        style={{
                          color: '#00E4FF',
                          fontWeight: 700,
                          textShadow: '0 0 8px rgba(0,228,255,0.8)',
                        }}
                      >
                        {formatMarketCap(marketCap)}
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                  }}
                >
                  {columnType === 'new' && (
                    <SnipeButton
                      tokenMint={token.mint}
                      createdAt={token.metadata?.createdAt}
                    />
                  )}

                  {columnType === 'graduating' && (
                    <div
                      style={{
                        padding: '10px 18px',
                        background: 'linear-gradient(135deg, rgba(255,191,0,0.7), rgba(255,140,0,0.6))',
                        borderRadius: '10px',
                        border: '2px solid rgba(255,191,0,0.8)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#000',
                        textShadow: '0 0 10px rgba(255,191,0,0.9), 1px 1px 2px rgba(0,0,0,0.5)',
                        boxShadow: '0 0 20px rgba(255,191,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>🎯</span>
                      <span>CURVE EDGE</span>
                      <span
                        style={{
                          fontSize: '12px',
                          opacity: 0.9,
                          background: 'rgba(0,0,0,0.3)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {columnType === 'graduated' && (
                    <>
                      <button
                        onClick={() => {
                          console.log(`🟢 BUY: ${token.mint}`);
                          // TODO: Open buy modal
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, rgba(0,255,140,0.8), rgba(0,228,255,0.7))',
                          borderRadius: '10px',
                          border: '2px solid rgba(0,255,140,0.8)',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#000',
                          cursor: 'pointer',
                          boxShadow: '0 0 18px rgba(0,255,140,0.5)',
                          transition: 'all 0.15s ease-out',
                          textShadow: '0 0 8px rgba(0,255,140,1), 1px 1px 2px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,140,0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 0 18px rgba(0,255,140,0.5)';
                        }}
                      >
                        🟢 BUY
                      </button>

                      <button
                        onClick={() => {
                          console.log(`🔴 SELL: ${token.mint}`);
                          // TODO: Open sell modal
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, rgba(255,62,62,0.8), rgba(255,62,191,0.7))',
                          borderRadius: '10px',
                          border: '2px solid rgba(255,62,62,0.8)',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#000',
                          cursor: 'pointer',
                          boxShadow: '0 0 18px rgba(255,62,62,0.5)',
                          transition: 'all 0.15s ease-out',
                          textShadow: '0 0 8px rgba(255,62,62,1), 1px 1px 2px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 0 30px rgba(255,62,62,0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 0 18px rgba(255,62,62,0.5)';
                        }}
                      >
                        🔴 SELL
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// =============================================
// MAIN COMPONENT
// =============================================

export function ExplorerDesktop() {
  // Real-time live feed hooks (auto-updating)
  const newPairs = useFreshTokens(); // < 2 minutes old
  const graduating = useCurveEdgeTokens(); // >= 96% bonding progress
  const graduated = useGraduatedTokens(); // 100% bonding (graduated)
  const lastUpdated = useLastUpdated();

  // Force component refresh when feed updates
  const [, setRefreshKey] = useState(0);
  useEffect(() => {
    setRefreshKey((k) => k + 1);
  }, [lastUpdated]);

  return (
    <>
      <style>
        {`
          /* Desktop-only visibility (hidden < 1024px) */
          @media (max-width: 1023px) {
            .explorer-desktop-wrapper {
              display: none !important;
            }
          }

          /* Custom scrollbars with cyan glow */
          .explorer-column-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(0,228,255,0.7) rgba(0,0,0,0.3);
          }

          .explorer-column-scroll::-webkit-scrollbar {
            width: 8px;
          }

          .explorer-column-scroll::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
          }

          .explorer-column-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,228,255,0.7);
            border-radius: 4px;
            box-shadow: 0 0 8px rgba(0,228,255,0.8);
          }

          .explorer-column-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(0,228,255,0.9);
            box-shadow: 0 0 12px rgba(0,228,255,1);
          }

          /* Card hover glow (column-specific) */
          .explorer-card-wrapper[data-column="new"]:hover {
            transform: scale(1.02);
            filter: drop-shadow(0 0 15px rgba(0,228,255,0.6));
          }

          .explorer-card-wrapper[data-column="graduating"]:hover {
            transform: scale(1.02);
            filter: drop-shadow(0 0 15px rgba(255,140,0,0.6));
          }

          .explorer-card-wrapper[data-column="graduated"]:hover {
            transform: scale(1.02);
            filter: drop-shadow(0 0 15px rgba(0,228,255,0.6));
          }

          /* Drip pulse animation */
          @keyframes dripPulse {
            0%, 100% {
              opacity: 0.6;
              transform: scaleY(1);
            }
            50% {
              opacity: 1;
              transform: scaleY(1.2);
            }
          }
        `}
      </style>

      <div
        className="explorer-desktop-wrapper hidden xl:grid"
        style={{
          width: '100%',
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '18px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(10,10,20,1), rgba(20,10,30,1), rgba(10,20,30,1))',
          overflow: 'hidden',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Column 1: New Pairs */}
        <ExplorerColumn
          title="New Pairs"
          emoji="🆕"
          tokens={newPairs}
          columnType="new"
          gradientColors="rgba(0,228,255,0.25), rgba(155,0,255,0.2)"
          glowColor="rgba(0,228,255,0.6)"
        />

        {/* Column 2: About to Graduate */}
        <ExplorerColumn
          title="About to Graduate"
          emoji="🎓"
          tokens={graduating}
          columnType="graduating"
          gradientColors="rgba(255,191,0,0.25), rgba(255,140,0,0.2)"
          glowColor="rgba(255,140,0,0.6)"
        />

        {/* Column 3: Graduated */}
        <ExplorerColumn
          title="Graduated"
          emoji="🚀"
          tokens={graduated}
          columnType="graduated"
          gradientColors="rgba(0,255,140,0.25), rgba(0,228,255,0.2)"
          glowColor="rgba(0,255,140,0.6)"
        />
      </div>
    </>
  );
}

// =============================================
// EXPORTS
// =============================================

export default ExplorerDesktop;
