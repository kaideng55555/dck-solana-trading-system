import React, { useEffect, useRef } from 'react';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface MintAnimationProps {
  imageUrl: string | null;
  status: 'idle' | 'minting' | 'revealing' | 'done';
  onClose: () => void;
}

// =============================================
// COMPONENT
// =============================================

export const MintAnimation: React.FC<MintAnimationProps> = ({
  imageUrl,
  status,
  onClose,
}) => {
  const { play } = useSFX();
  const hasPlayedRevealSounds = useRef(false);
  const hasPlayedDoneSound = useRef(false);

  // =============================================
  // SOUND EFFECTS
  // =============================================

  useEffect(() => {
    if (status === 'revealing' && !hasPlayedRevealSounds.current) {
      hasPlayedRevealSounds.current = true;
      play('shotgun');
      setTimeout(() => play('buy'), 300);
    }

    if (status === 'done' && !hasPlayedDoneSound.current) {
      hasPlayedDoneSound.current = true;
      play('alert');
    }
  }, [status, play]);

  // Reset sound flags when status goes back to idle/minting
  useEffect(() => {
    if (status === 'idle' || status === 'minting') {
      hasPlayedRevealSounds.current = false;
      hasPlayedDoneSound.current = false;
    }
  }, [status]);

  // =============================================
  // ANIMATIONS INJECTION
  // =============================================

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes mintSpin {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.05); }
        100% { transform: rotate(360deg) scale(1); }
      }

      @keyframes mintPulse {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(155,0,255,0.6), 0 0 40px rgba(0,228,255,0.4);
          opacity: 1;
        }
        50% { 
          box-shadow: 0 0 40px rgba(155,0,255,0.9), 0 0 80px rgba(0,228,255,0.7);
          opacity: 0.8;
        }
      }

      @keyframes textFlicker {
        0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(0,228,255,0.8); }
        10% { opacity: 0.9; }
        20% { opacity: 1; }
        30% { opacity: 0.8; }
        40% { opacity: 1; }
        50% { opacity: 0.95; }
        60% { opacity: 1; }
        70% { opacity: 0.85; }
        80% { opacity: 1; }
        90% { opacity: 0.9; }
      }

      @keyframes sprayMist {
        0% { 
          transform: translateY(0) scale(1);
          opacity: 0.3;
        }
        50% { 
          transform: translateY(-20px) scale(1.2);
          opacity: 0.5;
        }
        100% { 
          transform: translateY(-40px) scale(1.4);
          opacity: 0;
        }
      }

      @keyframes smokeBurst {
        0% { 
          transform: scale(0.5);
          opacity: 0;
        }
        50% { 
          transform: scale(2);
          opacity: 0.8;
        }
        100% { 
          transform: scale(4);
          opacity: 0;
        }
      }

      @keyframes nftSlideIn {
        0% { 
          transform: translateZ(-200px) scale(0.5);
          opacity: 0;
          filter: blur(10px);
        }
        60% { 
          transform: translateZ(0) scale(1.1);
          opacity: 1;
          filter: blur(0);
        }
        100% { 
          transform: translateZ(0) scale(1);
          opacity: 1;
          filter: blur(0);
        }
      }

      @keyframes lightStreak {
        0% { 
          transform: translateX(-200%) translateY(-100%) rotate(45deg);
          opacity: 0;
        }
        50% { 
          opacity: 1;
        }
        100% { 
          transform: translateX(200%) translateY(100%) rotate(45deg);
          opacity: 0;
        }
      }

      @keyframes neonFramePulse {
        0%, 100% { 
          box-shadow: 
            0 0 10px rgba(0,228,255,0.6),
            0 0 20px rgba(155,0,255,0.4),
            0 0 30px rgba(255,62,191,0.3),
            inset 0 0 20px rgba(0,228,255,0.2);
        }
        50% { 
          box-shadow: 
            0 0 20px rgba(0,228,255,0.9),
            0 0 40px rgba(155,0,255,0.7),
            0 0 60px rgba(255,62,191,0.6),
            inset 0 0 30px rgba(0,228,255,0.4);
        }
      }

      @keyframes graffitiDrip {
        0% { 
          transform: translateY(0);
          opacity: 1;
        }
        100% { 
          transform: translateY(10px);
          opacity: 0.3;
        }
      }

      @keyframes smokeFloat {
        0% { 
          transform: translate(0, 0) scale(1);
          opacity: 0.2;
        }
        25% { 
          transform: translate(30px, -40px) scale(1.3);
          opacity: 0.4;
        }
        50% { 
          transform: translate(-20px, -80px) scale(1.6);
          opacity: 0.3;
        }
        75% { 
          transform: translate(40px, -120px) scale(1.8);
          opacity: 0.2;
        }
        100% { 
          transform: translate(0, -160px) scale(2);
          opacity: 0;
        }
      }

      @keyframes ledPulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }

      @keyframes placeholderPulse {
        0%, 100% { 
          border-color: rgba(0,228,255,0.4);
          box-shadow: 0 0 20px rgba(0,228,255,0.3);
        }
        50% { 
          border-color: rgba(0,228,255,0.8);
          box-shadow: 0 0 40px rgba(0,228,255,0.6);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // =============================================
  // RENDER LOGIC
  // =============================================

  if (status === 'idle') {
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
        background: 'linear-gradient(135deg, #050508 0%, #0a0a14 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        fontFamily: "'Impact', 'Anton', sans-serif",
      }}
    >
      {/* Animated Smoke Clouds Background */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`smoke-${i}`}
          style={{
            position: 'absolute',
            width: 200 + i * 50,
            height: 200 + i * 50,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${i % 2 === 0 ? '155,0,255' : '0,228,255'},0.1) 0%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: `smokeFloat ${6 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            left: `${10 + i * 12}%`,
            top: `${20 + i * 8}%`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* DCK Graffiti Accent at Top */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Main DCK Text */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 900,
            color: '#FF3EBF',
            textShadow: `
              0 0 10px rgba(255,62,191,0.8),
              0 0 20px rgba(155,0,255,0.6),
              0 0 30px rgba(0,228,255,0.4),
              3px 3px 0 rgba(0,0,0,0.8)
            `,
            letterSpacing: '4px',
            position: 'relative',
          }}
        >
          DCK TOOLS
        </div>

        {/* Spray Paint Drip */}
        <div
          style={{
            width: 4,
            height: 20,
            background: 'linear-gradient(180deg, #FF3EBF 0%, transparent 100%)',
            borderRadius: '2px',
            animation: 'graffitiDrip 2s ease-in-out infinite',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* Pulsing LED Border Accents */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(90deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
          animation: 'ledPulse 2s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
          animation: 'ledPulse 2s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Center Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          zIndex: 10,
        }}
      >
        {/* MINTING STATE */}
        {status === 'minting' && (
          <>
            {/* Spinning Neon Ring */}
            <div
              style={{
                width: 300,
                height: 300,
                borderRadius: '50%',
                border: '6px solid transparent',
                borderTopColor: '#9B00FF',
                borderRightColor: '#00E4FF',
                borderBottomColor: '#FF3EBF',
                borderLeftColor: '#9B00FF',
                animation: 'mintSpin 3s linear infinite, mintPulse 2s ease-in-out infinite',
                position: 'relative',
              }}
            >
              {/* Inner Glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 240,
                  height: 240,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(155,0,255,0.3) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Spray Mist Particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`mist-${i}`}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(${i % 2 === 0 ? '0,228,255' : '255,62,191'},0.4) 0%, transparent 70%)`,
                    filter: 'blur(8px)',
                    animation: `sprayMist 2s ease-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(80px)`,
                  }}
                />
              ))}
            </div>

            {/* Minting Text */}
            <div
              style={{
                fontSize: '42px',
                fontWeight: 900,
                color: '#00E4FF',
                textShadow: '0 0 20px rgba(0,228,255,0.8), 3px 3px 0 rgba(0,0,0,0.6)',
                letterSpacing: '3px',
                animation: 'textFlicker 1.5s ease-in-out infinite',
              }}
            >
              MINTING...
            </div>
          </>
        )}

        {/* REVEALING STATE */}
        {status === 'revealing' && (
          <>
            {/* Smoke Burst */}
            <div
              style={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(155,0,255,0.6) 0%, rgba(0,228,255,0.3) 50%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'smokeBurst 1.5s ease-out forwards',
              }}
            />

            {/* Light Streaks */}
            {[...Array(5)].map((_, i) => (
              <div
                key={`streak-${i}`}
                style={{
                  position: 'absolute',
                  width: 300,
                  height: 4,
                  background: `linear-gradient(90deg, transparent 0%, ${i % 2 === 0 ? '#00E4FF' : '#FF3EBF'} 50%, transparent 100%)`,
                  filter: 'blur(2px)',
                  animation: 'lightStreak 1.2s ease-out',
                  animationDelay: `${i * 0.1}s`,
                  transformOrigin: 'center',
                }}
              />
            ))}

            {/* NFT Slide In */}
            <div
              style={{
                width: 350,
                height: 350,
                borderRadius: '12px',
                overflow: 'hidden',
                border: '4px solid #00E4FF',
                boxShadow: '0 0 40px rgba(0,228,255,0.8)',
                animation: 'nftSlideIn 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                background: '#0a0a14',
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="NFT"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(0,228,255,0.1) 0%, transparent 70%)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '120px',
                      color: '#00E4FF',
                      opacity: 0.3,
                    }}
                  >
                    🎨
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* DONE STATE */}
        {status === 'done' && (
          <>
            {/* NFT Display with Neon Frame */}
            <div
              style={{
                width: 400,
                height: 400,
                borderRadius: '12px',
                overflow: 'hidden',
                border: '6px solid transparent',
                borderImage: 'linear-gradient(135deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%) 1',
                animation: 'neonFramePulse 2s ease-in-out infinite',
                background: '#0a0a14',
                position: 'relative',
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Minted NFT"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(0,228,255,0.15) 0%, transparent 70%)',
                  }}
                >
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      border: '4px dashed #00E4FF',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'placeholderPulse 2s ease-in-out infinite',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '80px',
                        color: '#00E4FF',
                        opacity: 0.4,
                      }}
                    >
                      🎨
                    </div>
                  </div>
                </div>
              )}

              {/* Corner Accents */}
              {[
                { top: -4, left: -4 },
                { top: -4, right: -4 },
                { bottom: -4, left: -4 },
                { bottom: -4, right: -4 },
              ].map((pos, i) => (
                <div
                  key={`corner-${i}`}
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    background: '#00E4FF',
                    boxShadow: '0 0 10px rgba(0,228,255,0.8)',
                    ...pos,
                  }}
                />
              ))}
            </div>

            {/* Success Text */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 900,
                color: '#00FF88',
                textShadow: `
                  0 0 20px rgba(0,255,136,0.8),
                  0 0 40px rgba(0,228,255,0.6),
                  4px 4px 0 rgba(0,0,0,0.8)
                `,
                letterSpacing: '4px',
                textAlign: 'center',
              }}
            >
              MINT SUCCESSFUL!
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                padding: '16px 48px',
                fontSize: '24px',
                fontWeight: 700,
                fontFamily: "'Impact', 'Anton', sans-serif",
                border: '3px solid #00E4FF',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(0,228,255,0.2) 0%, rgba(155,0,255,0.2) 100%)',
                color: '#00E4FF',
                cursor: 'pointer',
                textShadow: '0 0 10px rgba(0,228,255,0.6)',
                boxShadow: '0 0 20px rgba(0,228,255,0.4)',
                transition: 'all 0.2s ease',
                letterSpacing: '2px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0,228,255,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,228,255,0.4)';
              }}
            >
              CLOSE
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MintAnimation;
