import React, { useState, useEffect } from 'react';
import { DCKNeonLogo } from '../../components/DCKNeonLogo';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface LoadingScreenProps {
  show: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

// =============================================
// COMPONENT
// =============================================

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ show }) => {
  const { play } = useSFX();
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  const [particles, setParticles] = useState<Particle[]>([]);

  // =============================================
  // PARTICLES GENERATION
  // =============================================

  useEffect(() => {
    if (!show) return;

    const colors = ['#FF3EBF', '#9B00FF', '#00E4FF'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 35; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
      });
    }

    setParticles(newParticles);
  }, [show]);

  // =============================================
  // PROGRESS BAR AUTO-FILL
  // =============================================

  useEffect(() => {
    if (!show) return;

    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        play('alert'); // Sound at 100%
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [show, play]);

  // =============================================
  // FADE OUT LOGIC
  // =============================================

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsFadingOut(false);
      setProgress(0);
    } else if (shouldRender) {
      // Start fade out
      setIsFadingOut(true);

      // Unmount after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 800); // Match fadeOut animation duration

      return () => clearTimeout(timer);
    }
  }, [show, shouldRender, play]);

  // =============================================
  // ANIMATIONS INJECTION
  // =============================================

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glitchFlash {
        0%, 100% { 
          filter: brightness(1);
          transform: translate(0, 0) scale(1);
        }
        10% { 
          filter: brightness(2) hue-rotate(180deg);
          transform: translate(-5px, 0) scale(1.02);
        }
        20% { 
          filter: brightness(1.5) hue-rotate(-180deg);
          transform: translate(5px, 0) scale(0.98);
        }
        30% { 
          filter: brightness(1);
          transform: translate(0, 0) scale(1);
        }
      }

      @keyframes neonGrow {
        0% { 
          transform: scale(0.8);
          opacity: 0;
        }
        100% { 
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes glowPulse {
        0%, 100% { 
          filter: drop-shadow(0 0 20px rgba(0,228,255,0.6)) 
                  drop-shadow(0 0 40px rgba(255,62,191,0.4));
        }
        50% { 
          filter: drop-shadow(0 0 40px rgba(0,228,255,0.9)) 
                  drop-shadow(0 0 80px rgba(255,62,191,0.7));
        }
      }

      @keyframes smokeDrift {
        0% { 
          transform: translate(0, 0) scale(1);
          opacity: 0.15;
        }
        50% { 
          transform: translate(30px, -50px) scale(1.5);
          opacity: 0.25;
        }
        100% { 
          transform: translate(0, -100px) scale(2);
          opacity: 0;
        }
      }

      @keyframes particleFloat {
        0% { 
          transform: translateY(0);
          opacity: 0;
        }
        10% { 
          opacity: 1;
        }
        90% { 
          opacity: 1;
        }
        100% { 
          transform: translateY(-100vh);
          opacity: 0;
        }
      }

      @keyframes barFill {
        0% { width: 0%; }
        100% { width: 100%; }
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

      @keyframes flicker {
        0%, 100% { opacity: 1; }
        5% { opacity: 0.9; }
        10% { opacity: 1; }
        15% { opacity: 0.8; }
        20% { opacity: 1; }
        25% { opacity: 0.95; }
        30% { opacity: 1; }
      }

      @keyframes noiseScroll {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-100px, -100px); }
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
        background: '#050507',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden',
        animation: isFadingOut ? 'fadeOut 0.8s ease-out forwards' : 'none',
      }}
    >
      {/* Noise Texture Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200%',
          height: '200%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: 'noiseScroll 8s linear infinite',
          pointerEvents: 'none',
          opacity: 0.3,
        }}
      />

      {/* Animated Smoke Clouds */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`smoke-${i}`}
          style={{
            position: 'absolute',
            width: 300 + i * 100,
            height: 300 + i * 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${i % 2 === 0 ? '155,0,255' : '0,228,255'},0.15) 0%, transparent 70%)`,
            filter: 'blur(80px)',
            animation: `smokeDrift ${8 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            left: `${10 + i * 15}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            bottom: `-${particle.size}px`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            filter: 'blur(4px)',
            animation: `particleFloat ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Center Logo with 3-Stage Animation */}
      <div
        style={{
          position: 'relative',
          marginBottom: '60px',
          animation: `
            glitchFlash 0.8s ease-out 0s 1,
            neonGrow 0.6s ease-out 0.2s 1 both,
            glowPulse 3s ease-in-out 1s infinite
          `,
        }}
      >
        <DCKNeonLogo />
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: '24px',
          fontWeight: 700,
          fontFamily: "'Impact', 'Anton', sans-serif",
          background: 'linear-gradient(90deg, #FF3EBF 0%, #00E4FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '3px',
          marginBottom: '40px',
          textShadow: '0 0 20px rgba(0,228,255,0.5)',
          animation: 'flicker 3s ease-in-out infinite',
        }}
      >
        STREET ART TRADING TERMINAL
      </div>

      {/* Loading Bar Container */}
      <div
        style={{
          width: '400px',
          maxWidth: '80vw',
          position: 'relative',
        }}
      >
        {/* Bar Background */}
        <div
          style={{
            height: '12px',
            background: '#111',
            borderRadius: '6px',
            border: '2px solid #333',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          {/* Fill */}
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
              borderRadius: '4px',
              transition: 'width 0.1s linear',
              boxShadow: `
                0 0 10px rgba(0,228,255,0.6),
                0 0 20px rgba(155,0,255,0.4),
                0 0 30px rgba(255,62,191,0.3)
              `,
              position: 'relative',
            }}
          >
            {/* Spray Drip Effect */}
            {progress > 10 && (
              <div
                style={{
                  position: 'absolute',
                  right: -8,
                  top: '100%',
                  width: 4,
                  height: 8,
                  background: 'linear-gradient(180deg, #FF3EBF 0%, transparent 100%)',
                  borderRadius: '0 0 2px 2px',
                  filter: 'blur(1px)',
                }}
              />
            )}
          </div>
        </div>

        {/* Progress Text */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#00E4FF',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(0,228,255,0.6)',
            letterSpacing: '1px',
          }}
        >
          {Math.floor(progress)}%
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 3,
          background: 'linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
          opacity: 0.6,
        }}
      />
    </div>
  );
};

export default LoadingScreen;
