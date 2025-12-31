/**
 * GraffitiModeTabs Component
 * 
 * 3-tab graffiti-style mode selector for DCK$ Tools
 * Features:
 * - Chrome metallic letters
 * - Neon cyan → purple → pink glow
 * - Graffiti drips on selected tab
 * - Spray-paint hover effect
 * - Forward slanted graffiti style
 */

import React, { useState } from 'react';

// =============================================
// TYPES
// =============================================

export interface GraffitiModeTabsProps {
  /** Current active mode */
  mode: 'quick' | 'curve' | 'mc';
  
  /** Callback when mode changes */
  onChange: (mode: 'quick' | 'curve' | 'mc') => void;
}

interface TabConfig {
  id: 'quick' | 'curve' | 'mc';
  label: string;
  icon: string;
}

// =============================================
// COMPONENT
// =============================================

export const GraffitiModeTabs: React.FC<GraffitiModeTabsProps> = ({
  mode,
  onChange,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showSpray, setShowSpray] = useState<string | null>(null);

  const tabs: TabConfig[] = [
    { id: 'quick', label: 'Quick Snipe', icon: '⚡' },
    { id: 'curve', label: 'Curve Edge', icon: '📈' },
    { id: 'mc', label: 'MC Trigger', icon: '💰' },
  ];

  const handleTabClick = (tabId: 'quick' | 'curve' | 'mc') => {
    if (tabId === mode) return;
    
    // Trigger spray effect
    setShowSpray(tabId);
    setTimeout(() => setShowSpray(null), 300);
    
    // Call onChange
    onChange(tabId);
    
    console.log(`🎨 MODE SWITCHED: ${tabId.toUpperCase()}`);
  };

  return (
    <>
      {/* Keyframe Animations */}
      <style>
        {`
          @keyframes sprayFlash {
            0% {
              opacity: 0;
              transform: scale(0.8) rotate(-5deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.2) rotate(5deg);
            }
            100% {
              opacity: 0;
              transform: scale(1) rotate(0deg);
            }
          }

          @keyframes dripWobble {
            0%, 100% {
              transform: translateY(0) scaleY(1);
            }
            50% {
              transform: translateY(2px) scaleY(1.1);
            }
          }

          @keyframes neonPulse {
            0%, 100% {
              filter: drop-shadow(0 0 8px #00E4FF) drop-shadow(0 0 12px #FF3EBF);
            }
            50% {
              filter: drop-shadow(0 0 16px #00E4FF) drop-shadow(0 0 20px #FF3EBF) drop-shadow(0 0 8px #9B00FF);
            }
          }

          @keyframes chromeShine {
            0% {
              background-position: -100% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          .graffiti-tab {
            transition: all 0.2s ease;
          }

          .graffiti-tab:hover {
            transform: skewX(-5deg) scale(1.05);
          }

          .graffiti-tab.active {
            transform: skewX(-5deg) scale(1.08);
            animation: neonPulse 2s ease-in-out infinite;
          }

          .chrome-text {
            background: linear-gradient(
              180deg,
              #ffffff 0%,
              #e0e0e0 25%,
              #a0a0a0 50%,
              #707070 75%,
              #404040 100%
            );
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 
              0 1px 0 #fff,
              0 2px 0 #ddd,
              0 3px 0 #bbb,
              0 4px 0 #999,
              0 5px 3px rgba(0,0,0,0.3);
          }

          .chrome-text-active {
            background: linear-gradient(
              180deg,
              #f0f0f0 0%,
              #c0c0c0 25%,
              #808080 50%,
              #505050 75%,
              #202020 100%
            );
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 
              0 1px 0 #fff,
              0 2px 0 #ddd,
              0 3px 0 #bbb,
              0 4px 0 #999,
              0 5px 5px rgba(0,0,0,0.5),
              0 0 20px #00E4FF,
              0 0 30px #FF3EBF;
          }

          .drip {
            animation: dripWobble 3s ease-in-out infinite;
          }

          .spray-burst {
            animation: sprayFlash 300ms ease-out;
          }
        `}
      </style>

      {/* Container */}
      <div style={containerStyle}>
        {tabs.map((tab) => {
          const isActive = mode === tab.id;
          const isHovered = hoveredTab === tab.id;
          const isSpray = showSpray === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`graffiti-tab ${isActive ? 'active' : ''}`}
              style={{
                ...tabStyle,
                ...(isActive ? tabActiveStyle : {}),
                ...(isHovered && !isActive ? tabHoverStyle : {}),
              }}
            >
              {/* Spray flash effect */}
              {isSpray && (
                <div
                  className="spray-burst"
                  style={sprayBurstStyle}
                />
              )}

              {/* Neon glow background */}
              <div
                style={{
                  ...glowBackgroundStyle,
                  opacity: isActive ? 1 : isHovered ? 0.6 : 0.3,
                }}
              />

              {/* Tab content */}
              <div style={tabContentStyle}>
                {/* Icon */}
                <span style={iconStyle}>{tab.icon}</span>
                
                {/* Chrome text */}
                <span
                  className={isActive ? 'chrome-text-active' : 'chrome-text'}
                  style={chromeTextStyle}
                >
                  {tab.label}
                </span>
              </div>

              {/* Graffiti drips (only on active tab) */}
              {isActive && (
                <div style={dripsContainerStyle}>
                  <div className="drip" style={{ ...dripStyle, left: '20%' }} />
                  <div className="drip" style={{ ...dripStyle, left: '50%', animationDelay: '0.5s' }} />
                  <div className="drip" style={{ ...dripStyle, left: '80%', animationDelay: '1s' }} />
                </div>
              )}

              {/* Neon outline */}
              <div
                style={{
                  ...neonOutlineStyle,
                  opacity: isActive ? 1 : isHovered ? 0.8 : 0.4,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

// =============================================
// STYLES
// =============================================

const containerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  padding: '16px',
  background: 'rgba(13, 17, 23, 0.6)',
  borderRadius: '16px',
  border: '2px solid rgba(0, 228, 255, 0.2)',
  boxShadow: '0 0 20px rgba(0, 228, 255, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(10px)',
  width: 'fit-content',
};

const tabStyle: React.CSSProperties = {
  position: 'relative',
  padding: '16px 32px',
  background: 'rgba(20, 25, 35, 0.8)',
  border: '2px solid transparent',
  borderRadius: '12px',
  cursor: 'pointer',
  overflow: 'visible',
  transform: 'skewX(-5deg)',
  userSelect: 'none',
};

const tabActiveStyle: React.CSSProperties = {
  background: 'rgba(30, 35, 45, 0.95)',
  transform: 'skewX(-5deg) scale(1.08)',
};

const tabHoverStyle: React.CSSProperties = {
  background: 'rgba(25, 30, 40, 0.9)',
  transform: 'skewX(-5deg) scale(1.05)',
};

const glowBackgroundStyle: React.CSSProperties = {
  position: 'absolute',
  inset: '-4px',
  background: 'linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
  borderRadius: '12px',
  zIndex: -1,
  filter: 'blur(8px)',
  transition: 'opacity 0.3s ease',
};

const tabContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  position: 'relative',
  zIndex: 1,
};

const iconStyle: React.CSSProperties = {
  fontSize: '24px',
  filter: 'drop-shadow(0 0 8px rgba(255, 62, 191, 0.6))',
};

const chromeTextStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Arial Black", sans-serif',
};

const dripsContainerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-20px',
  left: 0,
  right: 0,
  height: '20px',
  pointerEvents: 'none',
};

const dripStyle: React.CSSProperties = {
  position: 'absolute',
  width: '6px',
  height: '16px',
  background: 'linear-gradient(180deg, #00E4FF 0%, #FF3EBF 100%)',
  borderRadius: '0 0 3px 3px',
  boxShadow: '0 0 8px rgba(0, 228, 255, 0.8), 0 0 12px rgba(255, 62, 191, 0.6)',
  transformOrigin: 'top center',
};

const neonOutlineStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  border: '2px solid transparent',
  borderRadius: '12px',
  borderImage: 'linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF) 1',
  pointerEvents: 'none',
  transition: 'opacity 0.3s ease',
  boxShadow: 'inset 0 0 20px rgba(0, 228, 255, 0.2)',
};

const sprayBurstStyle: React.CSSProperties = {
  position: 'absolute',
  inset: '-20px',
  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(0,228,255,0.2) 30%, transparent 70%)',
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: 10,
};

// =============================================
// EXPORTS
// =============================================

export default GraffitiModeTabs;
