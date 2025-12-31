/**
 * TraderTerminal Page (D16-D - Complete Assembly)
 * 
 * Professional 3-column trading terminal with DCK neon graffiti styling
 * 
 * Layout:
 * ┌────────────────┬─────────────────────┬─────────────────┐
 * │ OrderFlowTape  │   TerminalChart     │ TokenInfoPanel  │
 * │ (left 300px)   │   Panel (flex-1)    │ (right 350px)   │
 * └────────────────┴─────────────────────┴─────────────────┘
 * 
 * Features:
 * - Real-time order flow tape
 * - Professional trading chart with lightweight-charts
 * - Comprehensive token info panel
 * - Mobile responsive (collapses to single column)
 * - DCK neon graffiti theme
 * - Sound effects integration
 * - Live token data
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderFlowTape } from '../terminal/OrderFlowTape';
import { TerminalChartPanel } from '../terminal/TerminalChartPanel';
import { TokenInfoPanel } from '../terminal/TokenInfoPanel';
import { useToken } from '../data/tokenDataStore';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface RouteParams {
  mint: string;
  [key: string]: string | undefined;
}

// =============================================
// COMPONENT
// =============================================

export const TraderTerminal: React.FC = () => {
  const { mint } = useParams<RouteParams>();
  const navigate = useNavigate();
  const token = useToken(mint || '');
  const { play } = useSFX();
  
  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'chart' | 'info' | 'flow'>('chart');
  
  // Touch gesture support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left - next tab
      if (mobileTab === 'chart') setMobileTab('info');
      else if (mobileTab === 'info') setMobileTab('flow');
    }
    
    if (isRightSwipe) {
      // Swipe right - previous tab
      if (mobileTab === 'flow') setMobileTab('info');
      else if (mobileTab === 'info') setMobileTab('chart');
    }
  };

  // Inject CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes terminalFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes cornerSpray {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.3; }
      }
      
      @keyframes borderGlow {
        0%, 100% { box-shadow: 0 -2px 20px rgba(0,245,255,0.3); }
        50% { box-shadow: 0 -2px 40px rgba(155,0,255,0.5); }
      }
      
      @keyframes tabGlow {
        0%, 100% { box-shadow: 0 0 15px rgba(0,245,255,0.4); }
        50% { box-shadow: 0 0 25px rgba(155,0,255,0.6); }
      }
      
      @keyframes sprayActive {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 0.5; }
        100% { transform: scale(1); opacity: 0.3; }
      }
      
      /* Mobile scrollbar */
      @media (max-width: 1024px) {
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #161621;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00E4FF 0%, #9B00FF 100%);
          border-radius: 2px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Play UI open sound on mount (optional - removed as uiOpen not in SFXName)
  useEffect(() => {
    // UI sound removed - not in SFXName type
  }, [play]);

  // Redirect if no mint provided
  useEffect(() => {
    if (!mint) {
      navigate('/');
    }
  }, [mint, navigate]);

  // =============================================
  // LOADING STATE
  // =============================================

  if (!token) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#08080A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: '48px',
            animation: 'pulse 2s infinite',
          }}
        >
          📡
        </div>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#00E4FF',
            textShadow: '0 0 20px rgba(0,245,255,0.8)',
            animation: 'pulse 2s infinite',
          }}
        >
          Loading token data...
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#6B7280',
            fontFamily: 'monospace',
          }}
        >
          {mint?.slice(0, 8)}...{mint?.slice(-6)}
        </div>
      </div>
    );
  }

  // =============================================
  // MOBILE CHECK
  // =============================================

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  // =============================================
  // RENDER
  // =============================================

  if (!token) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(10,10,20,1), rgba(20,10,30,1))',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
              filter: 'drop-shadow(0 0 15px rgba(255,62,62,0.8))',
            }}
          >
            ❌
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '2px',
              color: '#FF3E3E',
              textShadow: '0 0 15px rgba(255,62,62,0.8)',
              marginBottom: '16px',
            }}
          >
            TOKEN NOT FOUND
          </h1>
          <p
            style={{
              fontSize: '12px',
              opacity: 0.7,
              fontFamily: 'monospace',
              marginBottom: '24px',
            }}
          >
            {mint}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, rgba(0,228,255,0.6), rgba(155,0,255,0.5))',
              border: '2px solid rgba(0,228,255,0.8)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#000',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0,228,255,0.5)',
            }}
          >
            ← Back to Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#08080A',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        animation: 'terminalFadeIn 0.6s ease-out',
      }}
    >
      {/* Neon gradient top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
          animation: 'borderGlow 3s ease-in-out infinite',
        }}
      />

      {/* Spray paint graffiti - top left corner */}
      <div
        style={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(0,245,255,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'cornerSpray 4s ease-in-out infinite',
        }}
      />

      {/* Spray paint graffiti - bottom right corner */}
      <div
        style={{
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(255,62,191,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'cornerSpray 5s ease-in-out infinite',
        }}
      />

      {/* Mobile Tab Navigation */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            gap: '0',
            padding: '0',
            background: 'rgba(11,11,15,0.95)',
            borderBottom: '2px solid transparent',
            backgroundImage: 'linear-gradient(rgba(11,11,15,0.95), rgba(11,11,15,0.95)), linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            position: 'relative',
          }}
        >
          {(['chart', 'info', 'flow'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                flex: 1,
                padding: '14px 8px',
                background: mobileTab === tab
                  ? 'linear-gradient(135deg, rgba(0,245,255,0.2) 0%, rgba(155,0,255,0.2) 100%)'
                  : 'transparent',
                border: 'none',
                borderBottom: mobileTab === tab ? '3px solid #00E4FF' : '3px solid transparent',
                color: mobileTab === tab ? '#00E4FF' : '#6B7280',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textShadow: mobileTab === tab ? '0 0 10px rgba(0,245,255,0.8)' : 'none',
                animation: mobileTab === tab ? 'tabGlow 2s infinite' : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {mobileTab === tab && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(0,245,255,0.2) 0%, transparent 70%)',
                    animation: 'sprayActive 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {tab === 'chart' && '📊 Chart'}
                {tab === 'info' && '📋 Info'}
                {tab === 'flow' && '📡 Flow'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchMove={isMobile ? onTouchMove : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          padding: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Desktop Layout: 3 columns */}
        {!isMobile && (
          <>
            {/* Left Column - Order Flow Tape */}
            <div
              style={{
                width: 300,
                height: '100%',
                flexShrink: 0,
              }}
            >
              <OrderFlowTape mint={mint!} />
            </div>

            {/* Center Column - Chart Panel */}
            <div
              style={{
                flex: 1,
                height: '100%',
                minWidth: 0,
              }}
            >
              <TerminalChartPanel mint={mint!} />
            </div>

            {/* Right Column - Token Info Panel */}
            <div
              style={{
                width: 350,
                height: '100%',
                flexShrink: 0,
              }}
            >
              <TokenInfoPanel mint={mint!} />
            </div>
          </>
        )}

        {/* Mobile Layout: Tab-based single panel */}
        {isMobile && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {mobileTab === 'chart' && (
              <div style={{ flex: 1, minHeight: 0 }}>
                <TerminalChartPanel mint={mint!} />
              </div>
            )}
            {mobileTab === 'info' && (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <TokenInfoPanel mint={mint!} />
              </div>
            )}
            {mobileTab === 'flow' && (
              <div style={{ flex: 1, minHeight: 0 }}>
                <OrderFlowTape mint={mint!} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '4px 12px',
          background: 'rgba(0,0,0,0.8)',
          border: '1px solid #2A2A3A',
          borderRadius: '12px',
          fontSize: '10px',
          color: '#6B7280',
          fontWeight: 600,
          letterSpacing: '0.5px',
          pointerEvents: 'none',
        }}
      >
        DCK TOOLS TRADER TERMINAL v1.0
      </div>
    </div>
  );
};

export default TraderTerminal;
