/**
 * AnalyticsPanel Component
 * 
 * 3-column analytics panel for trader terminal
 * Columns:
 * - A: Sniper Status (S1-S6 modules)
 * - B: Bonding Curve Intelligence
 * - C: Liquidity + Risk Center
 */

import React from 'react';

// =============================================
// TYPES
// =============================================

interface AnalyticsPanelProps {
  tokenMint: string;
  sniperStatus: {
    quickSnipe: boolean;
    curveEdge: boolean;
    hotBuyBot: boolean;
    lpEventSniper: boolean;
    autoTrade: boolean;
    watchdog: boolean;
  };
  bondingData: {
    progress: number;
    velocity: number;
    acceleration: number;
    eta: number;
    confidence: number;
    recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR' | 'AVOID';
  };
  liquidityData: {
    lpHealth: number;
    rugRisk: number;
    authorityRisk: boolean;
    recentEvents: Array<{ type: string; amount: number; time: number }>;
    whaleBuys: number;
    holderDistribution: string;
    jitoProtection: boolean;
  };
}

// =============================================
// COMPONENT
// =============================================

export function AnalyticsPanel({
  tokenMint,
  sniperStatus,
  bondingData,
  liquidityData,
}: AnalyticsPanelProps) {
  const { progress, velocity, acceleration, eta, confidence, recommendation } = bondingData;
  const { lpHealth, rugRisk, authorityRisk, recentEvents, whaleBuys, holderDistribution, jitoProtection } =
    liquidityData;

  function getRecommendationColor(rec: string): string {
    switch (rec) {
      case 'BUY_NOW':
        return 'rgba(0,255,140,0.8)';
      case 'WAIT':
        return 'rgba(255,191,0,0.8)';
      case 'MONITOR':
        return 'rgba(0,228,255,0.8)';
      case 'AVOID':
        return 'rgba(255,62,62,0.8)';
      default:
        return 'rgba(128,128,128,0.8)';
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes pulseActive {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          .analytics-column::-webkit-scrollbar {
            width: 6px;
          }

          .analytics-column::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
          }

          .analytics-column::-webkit-scrollbar-thumb {
            background: rgba(0,228,255,0.5);
            border-radius: 3px;
          }

          .analytics-column::-webkit-scrollbar-thumb:hover {
            background: rgba(0,228,255,0.7);
          }
        `}
      </style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          height: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(10,10,20,0.95), rgba(20,10,30,0.95))',
          borderTop: '2px solid rgba(0,228,255,0.4)',
        }}
      >
        {/* ===== COLUMN A: SNIPER STATUS ===== */}
        <div
          className="analytics-column"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            background: 'rgba(255,62,191,0.08)',
            border: '2px solid rgba(255,62,191,0.3)',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(255,62,191,0.2)',
            overflowY: 'auto',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              color: '#FF3EBF',
              textShadow: '0 0 10px rgba(255,62,191,0.8)',
              borderBottom: '2px solid rgba(255,62,191,0.4)',
              paddingBottom: '8px',
            }}
          >
            🎯 SNIPER STATUS
          </h3>

          {/* S1: Quick Snipe */}
          <div
            style={{
              padding: '10px 12px',
              background: sniperStatus.quickSnipe ? 'rgba(0,255,140,0.15)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${sniperStatus.quickSnipe ? 'rgba(0,255,140,0.6)' : 'rgba(128,128,128,0.3)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: sniperStatus.quickSnipe ? 'pulseActive 2s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: '18px' }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>S1: Quick Snipe</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {sniperStatus.quickSnipe ? 'ACTIVE' : 'IDLE'}
              </div>
            </div>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: sniperStatus.quickSnipe ? '#00FF8C' : '#666',
                boxShadow: sniperStatus.quickSnipe ? '0 0 10px rgba(0,255,140,0.8)' : 'none',
              }}
            />
          </div>

          {/* S2: Curve Edge */}
          <div
            style={{
              padding: '10px 12px',
              background: sniperStatus.curveEdge ? 'rgba(255,191,0,0.15)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${sniperStatus.curveEdge ? 'rgba(255,191,0,0.6)' : 'rgba(128,128,128,0.3)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: sniperStatus.curveEdge ? 'pulseActive 2s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: '18px' }}>🎯</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>S2: Curve Edge</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {sniperStatus.curveEdge ? 'MONITORING' : 'IDLE'}
              </div>
            </div>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: sniperStatus.curveEdge ? '#FFD700' : '#666',
                boxShadow: sniperStatus.curveEdge ? '0 0 10px rgba(255,215,0,0.8)' : 'none',
              }}
            />
          </div>

          {/* S3: Hot Buy Bot */}
          <div
            style={{
              padding: '10px 12px',
              background: sniperStatus.hotBuyBot ? 'rgba(255,140,0,0.15)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${sniperStatus.hotBuyBot ? 'rgba(255,140,0,0.6)' : 'rgba(128,128,128,0.3)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: sniperStatus.hotBuyBot ? 'pulseActive 2s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: '18px' }}>🔥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>S3: Hot Buy Bot</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {sniperStatus.hotBuyBot ? 'ACTIVE' : 'IDLE'}
              </div>
            </div>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: sniperStatus.hotBuyBot ? '#FF8C00' : '#666',
                boxShadow: sniperStatus.hotBuyBot ? '0 0 10px rgba(255,140,0,0.8)' : 'none',
              }}
            />
          </div>

          {/* S4: LP Event Sniper */}
          <div
            style={{
              padding: '10px 12px',
              background: sniperStatus.lpEventSniper ? 'rgba(0,228,255,0.15)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${sniperStatus.lpEventSniper ? 'rgba(0,228,255,0.6)' : 'rgba(128,128,128,0.3)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: sniperStatus.lpEventSniper ? 'pulseActive 2s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: '18px' }}>💧</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>S4: LP Event Sniper</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {sniperStatus.lpEventSniper ? 'MONITORING' : 'IDLE'}
              </div>
            </div>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: sniperStatus.lpEventSniper ? '#00E4FF' : '#666',
                boxShadow: sniperStatus.lpEventSniper ? '0 0 10px rgba(0,228,255,0.8)' : 'none',
              }}
            />
          </div>

          {/* S5: Auto Trade */}
          <div
            style={{
              padding: '10px 12px',
              background: sniperStatus.autoTrade ? 'rgba(155,0,255,0.15)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${sniperStatus.autoTrade ? 'rgba(155,0,255,0.6)' : 'rgba(128,128,128,0.3)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: sniperStatus.autoTrade ? 'pulseActive 2s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: '18px' }}>🎯</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>S5: Auto Trade</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {sniperStatus.autoTrade ? 'ACTIVE' : 'IDLE'}
              </div>
            </div>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: sniperStatus.autoTrade ? '#9B00FF' : '#666',
                boxShadow: sniperStatus.autoTrade ? '0 0 10px rgba(155,0,255,0.8)' : 'none',
              }}
            />
          </div>

          {/* S6: Watchdog */}
          <div
            style={{
              padding: '10px 12px',
              background: sniperStatus.watchdog ? 'rgba(0,255,140,0.15)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${sniperStatus.watchdog ? 'rgba(0,255,140,0.6)' : 'rgba(128,128,128,0.3)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: sniperStatus.watchdog ? 'pulseActive 2s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: '18px' }}>🐕</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>S6: Watchdog</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {sniperStatus.watchdog ? 'AI MONITORING' : 'IDLE'}
              </div>
            </div>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: sniperStatus.watchdog ? '#00FF8C' : '#666',
                boxShadow: sniperStatus.watchdog ? '0 0 10px rgba(0,255,140,0.8)' : 'none',
              }}
            />
          </div>
        </div>

        {/* ===== COLUMN B: BONDING CURVE INTELLIGENCE ===== */}
        <div
          className="analytics-column"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            background: 'rgba(155,0,255,0.08)',
            border: '2px solid rgba(155,0,255,0.3)',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(155,0,255,0.2)',
            overflowY: 'auto',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              color: '#9B00FF',
              textShadow: '0 0 10px rgba(155,0,255,0.8)',
              borderBottom: '2px solid rgba(155,0,255,0.4)',
              paddingBottom: '8px',
            }}
          >
            📉 BONDING INTELLIGENCE
          </h3>

          {/* Progress */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  flex: 1,
                  height: '20px',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(155,0,255,0.3)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${
                      progress >= 90 ? '#00FF8C' : progress >= 70 ? '#FFD700' : '#FF8C00'
                    }, ${progress >= 90 ? '#00E4FF' : progress >= 70 ? '#FFB700' : '#FF6C00'})`,
                    transition: 'width 0.5s ease',
                    boxShadow: `0 0 10px ${progress >= 90 ? 'rgba(0,255,140,0.8)' : 'rgba(255,140,0,0.8)'}`,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: progress >= 90 ? '#00FF8C' : progress >= 70 ? '#FFD700' : '#FF8C00',
                  textShadow: '0 0 10px currentColor',
                  minWidth: '60px',
                  textAlign: 'right',
                }}
              >
                {progress.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Velocity */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Velocity</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: velocity > 50 ? '#00FF8C' : velocity > 0 ? '#FFD700' : '#FF3E3E',
                textShadow: '0 0 10px currentColor',
              }}
            >
              {velocity > 0 ? '+' : ''}{velocity.toFixed(1)}
            </div>
          </div>

          {/* Acceleration */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Acceleration</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: acceleration > 0 ? '#00FF8C' : '#FF3E3E',
                textShadow: '0 0 10px currentColor',
              }}
            >
              {acceleration > 0 ? '+' : ''}{acceleration.toFixed(2)}
            </div>
          </div>

          {/* ETA */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>ETA to Graduation</div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#00E4FF',
                textShadow: '0 0 10px rgba(0,228,255,0.8)',
              }}
            >
              {eta < 60 ? `${Math.floor(eta)}m` : `${Math.floor(eta / 60)}h ${Math.floor(eta % 60)}m`}
            </div>
          </div>

          {/* Confidence */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Confidence</div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: confidence >= 80 ? '#00FF8C' : confidence >= 50 ? '#FFD700' : '#FF3E3E',
                textShadow: '0 0 10px currentColor',
              }}
            >
              {confidence}%
            </div>
          </div>

          {/* Recommendation */}
          <div
            style={{
              marginTop: '8px',
              padding: '14px',
              background: `linear-gradient(135deg, ${getRecommendationColor(recommendation)}, ${getRecommendationColor(
                recommendation
              ).replace('0.8', '0.6')})`,
              borderRadius: '10px',
              border: `2px solid ${getRecommendationColor(recommendation)}`,
              textAlign: 'center',
              boxShadow: `0 0 20px ${getRecommendationColor(recommendation)}`,
              animation: recommendation === 'BUY_NOW' ? 'pulseActive 1.5s ease-in-out infinite' : 'none',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Recommendation</div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 900,
                letterSpacing: '1px',
                color: '#000',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
            >
              {recommendation.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* ===== COLUMN C: LIQUIDITY + RISK CENTER ===== */}
        <div
          className="analytics-column"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            background: 'rgba(0,228,255,0.08)',
            border: '2px solid rgba(0,228,255,0.3)',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0,228,255,0.2)',
            overflowY: 'auto',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              color: '#00E4FF',
              textShadow: '0 0 10px rgba(0,228,255,0.8)',
              borderBottom: '2px solid rgba(0,228,255,0.4)',
              paddingBottom: '8px',
            }}
          >
            🛡️ LIQUIDITY + RISK
          </h3>

          {/* LP Health */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>LP Health</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: lpHealth >= 80 ? '#00FF8C' : lpHealth >= 50 ? '#FFD700' : '#FF3E3E',
                textShadow: '0 0 10px currentColor',
              }}
            >
              {lpHealth}%
            </div>
          </div>

          {/* Rug Risk */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Rug Risk</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: rugRisk < 30 ? '#00FF8C' : rugRisk < 60 ? '#FFD700' : '#FF3E3E',
                textShadow: '0 0 10px currentColor',
              }}
            >
              {rugRisk}%
            </div>
          </div>

          {/* Authority Risk Badge */}
          {authorityRisk && (
            <div
              style={{
                padding: '10px 12px',
                background: 'rgba(255,62,62,0.2)',
                border: '2px solid rgba(255,62,62,0.6)',
                borderRadius: '8px',
                textAlign: 'center',
                animation: 'pulseActive 1.5s ease-in-out infinite',
              }}
            >
              <span style={{ fontSize: '20px', marginRight: '8px' }}>⚠️</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF3E3E', textShadow: '0 0 10px rgba(255,62,62,0.8)' }}>
                AUTHORITY RISK
              </span>
            </div>
          )}

          {/* Recent LP Events */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>Recent LP Events</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    background: 'rgba(0,0,0,0.3)',
                    borderLeft: `3px solid ${event.type === 'ADD' ? 'rgba(0,255,140,0.8)' : 'rgba(255,62,62,0.8)'}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>{event.type} LP</div>
                  <div style={{ opacity: 0.7 }}>
                    {event.amount.toFixed(2)} SOL • {Math.floor((Date.now() - event.time) / 60000)}m ago
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Whale Buys */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Whale Buys (24h)</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: whaleBuys > 5 ? '#00FF8C' : whaleBuys > 0 ? '#FFD700' : '#666',
                textShadow: '0 0 10px currentColor',
              }}
            >
              🐋 {whaleBuys}
            </div>
          </div>

          {/* Holder Distribution */}
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Holder Distribution</div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{holderDistribution}</div>
          </div>

          {/* Jito Protection */}
          {jitoProtection && (
            <div
              style={{
                padding: '10px 12px',
                background: 'rgba(0,255,140,0.2)',
                border: '2px solid rgba(0,255,140,0.6)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '16px', marginRight: '8px' }}>⚡</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#00FF8C', textShadow: '0 0 10px rgba(0,255,140,0.8)' }}>
                JITO MEV PROTECTED
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AnalyticsPanel;
