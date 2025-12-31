import React, { useEffect, useState } from 'react';
import { DCKNeonLogo } from '../../components/DCKNeonLogo';

// =============================================
// TYPES
// =============================================

interface GlobalLoadingScreenProps {
  loadingCount: number;
  ready: boolean;
}

// =============================================
// COMPONENT
// =============================================

export const GlobalLoadingScreen: React.FC<GlobalLoadingScreenProps> = ({
  loadingCount,
  ready,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Calculate percentage (max 50 tokens = 100%)
  const percentage = Math.min((loadingCount / 50) * 100, 100);

  // =============================================
  // FADE OUT LOGIC
  // =============================================

  useEffect(() => {
    if (ready && !isFadingOut) {
      setIsFadingOut(true);
      
      // Unmount after fade-out animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1000); // Match fadeOut animation duration

      return () => clearTimeout(timer);
    }
  }, [ready, isFadingOut]);

  // =============================================
  // ANIMATIONS INJECTION
  // =============================================

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes sprayRing {
        0% { 
          transform: rotate(0deg) scale(1);
          opacity: 0.4;
        }
        50% { 
          transform: rotate(180deg) scale(1.1);
          opacity: 0.6;
        }
        100% { 
          transform: rotate(360deg) scale(1);
          opacity: 0.4;
        }
      }

      @keyframes neonPulse {
        0%, 100% { 
          filter: drop-shadow(0 0 20px rgba(0,228,255,0.6)) 
                  drop-shadow(0 0 40px rgba(255,62,191,0.4));
          opacity: 1;
        }
        50% { 
          filter: drop-shadow(0 0 40px rgba(0,228,255,0.9)) 
                  drop-shadow(0 0 80px rgba(255,62,191,0.7));
          opacity: 0.9;
        }
      }

      @keyframes fadeOut {
        0% { 
          opacity: 1;
          transform: scale(1);
        }
        100% { 
          opacity: 0;
          transform: scale(1.05);
        }
      }

      @keyframes blinkText {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      @keyframes sprayDrip {
        0% { 
          transform: translateY(0);
          opacity: 0.6;
        }
        100% { 
          transform: translateY(10px);
          opacity: 0;
        }
      }

      @keyframes particleDrift {
        0% { 
          transform: translate(0, 0) scale(1);
          opacity: 0.3;
        }
        50% { 
          transform: translate(20px, -30px) scale(1.5);
          opacity: 0.5;
        }
        100% { 
          transform: translate(0, -60px) scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // =============================================
  // PREVENT BODY SCROLL
  // =============================================

  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldRender]);

  // =============================================
  // RENDER
  // =============================================

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #050508 0%, #0f0520 50%, #050508 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden',
        animation: isFadingOut ? 'fadeOut 1s ease-out forwards' : 'none',
      }}
    >
      {/* Background Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            width: 150 + i * 30,
            height: 150 + i * 30,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${i % 2 === 0 ? '155,0,255' : '0,228,255'},0.15) 0%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: `particleDrift ${5 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            left: `${5 + i * 8}%`,
            top: `${10 + i * 7}%`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Center Content Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
          zIndex: 10,
        }}
      >
        {/* Spray Ring Behind Logo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 350,
            height: 350,
            borderRadius: '50%',
            border: '8px solid transparent',
            borderTopColor: 'rgba(0,228,255,0.4)',
            borderRightColor: 'rgba(155,0,255,0.3)',
            borderBottomColor: 'rgba(255,62,191,0.4)',
            borderLeftColor: 'rgba(0,228,255,0.3)',
            animation: 'sprayRing 6s linear infinite',
            filter: 'blur(4px)',
          }}
        />

        {/* Inner Glow Ring */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155,0,255,0.2) 0%, transparent 70%)',
            filter: 'blur(30px)',
            animation: 'neonPulse 3s ease-in-out infinite',
          }}
        />

        {/* DCK Logo */}
        <div
          style={{
            position: 'relative',
            animation: 'neonPulse 3s ease-in-out infinite',
            zIndex: 5,
          }}
        >
          <DCKNeonLogo />
        </div>

        {/* Status Text */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#00E4FF',
            textShadow: '0 0 15px rgba(0,228,255,0.8)',
            letterSpacing: '2px',
            animation: 'blinkText 2s ease-in-out infinite',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          INITIALIZING LIVE FEED...
        </div>

        {/* Loading Bar Container */}
        <div
          style={{
            width: '450px',
            maxWidth: '85vw',
            position: 'relative',
          }}
        >
          {/* Bar Background */}
          <div
            style={{
              height: '14px',
              background: '#0a0a14',
              borderRadius: '7px',
              border: '2px solid rgba(155,0,255,0.3)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {/* Fill */}
            <div
              style={{
                height: '100%',
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
                borderRadius: '5px',
                transition: 'width 0.3s ease-out',
                boxShadow: `
                  0 0 15px rgba(0,228,255,0.6),
                  0 0 30px rgba(155,0,255,0.4),
                  0 0 45px rgba(255,62,191,0.3)
                `,
                position: 'relative',
              }}
            >
              {/* Spray Drip Effect */}
              {percentage > 5 && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      right: -6,
                      top: '100%',
                      width: 3,
                      height: 12,
                      background: 'linear-gradient(180deg, #FF3EBF 0%, transparent 100%)',
                      borderRadius: '0 0 2px 2px',
                      filter: 'blur(1px)',
                      animation: 'sprayDrip 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: -12,
                      top: '100%',
                      width: 2,
                      height: 8,
                      background: 'linear-gradient(180deg, #9B00FF 0%, transparent 100%)',
                      borderRadius: '0 0 1px 1px',
                      filter: 'blur(1px)',
                      animation: 'sprayDrip 1.8s ease-in-out infinite',
                      animationDelay: '0.3s',
                    }}
                  />
                </>
              )}

              {/* Inner Glow */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  borderRadius: '5px',
                }}
              />
            </div>
          </div>

          {/* Progress Stats */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Percentage */}
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#00E4FF',
                textShadow: '0 0 10px rgba(0,228,255,0.6)',
                letterSpacing: '1px',
              }}
            >
              {Math.floor(percentage)}%
            </div>

            {/* Token Count */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#9B00FF',
                textShadow: '0 0 8px rgba(155,0,255,0.5)',
                letterSpacing: '0.5px',
              }}
            >
              {loadingCount} / 50 TOKENS
            </div>
          </div>
        </div>

        {/* Bottom Accent Text */}
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '1px',
            marginTop: '8px',
          }}
        >
          STREET ART TRADING TERMINAL
        </div>
      </div>

      {/* Bottom LED Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
          opacity: 0.6,
          animation: 'neonPulse 2s ease-in-out infinite',
          animationDelay: '0.5s',
        }}
      />

      {/* Top LED Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(90deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
          opacity: 0.6,
          animation: 'neonPulse 2s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default GlobalLoadingScreen;
