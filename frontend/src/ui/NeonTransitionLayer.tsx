import React, { useState, useEffect } from 'react';

// =============================================
// TYPES
// =============================================

interface NeonTransitionLayerProps {
  active: boolean; // Controlled by App.tsx
}

// =============================================
// COMPONENT
// =============================================

export const NeonTransitionLayer: React.FC<NeonTransitionLayerProps> = ({ active }) => {
  const [done, setDone] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // =============================================
  // ANIMATIONS INJECTION
  // =============================================

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes sprayExpand {
        0% { 
          transform: scale(0.4);
          opacity: 0.8;
        }
        40% { 
          transform: scale(1.4);
          opacity: 1;
        }
        80% { 
          transform: scale(1.7);
          opacity: 0.7;
        }
        100% { 
          transform: scale(1.9);
          opacity: 0;
        }
      }

      @keyframes neonPulse {
        0% { 
          opacity: 0;
        }
        50% { 
          opacity: 0.25;
          box-shadow: 0 0 80px #00e4ff88;
        }
        100% { 
          opacity: 0;
        }
      }

      @keyframes motionBlur {
        0% {
          transform: translateX(-20px);
          opacity: 0;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          transform: translateX(20px);
          opacity: 0;
        }
      }

      @keyframes overshoot {
        0% {
          transform: scale(1);
        }
        60% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // =============================================
  // UNMOUNT LOGIC
  // =============================================

  useEffect(() => {
    if (!active) return;

    // Start animation
    setIsAnimating(true);

    // Self-destruct after 900ms
    const timer = setTimeout(() => {
      setDone(true);
    }, 900);

    return () => clearTimeout(timer);
  }, [active]);

  // =============================================
  // RENDER
  // =============================================

  // Don't render if not active or already done
  if (!active || done) {
    return null;
  }

  return (
    <div
      className="neon-transition-layer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99998, // Below loading screen (99999) but above everything else
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Main Spray Cloud - Cyan/Pink Gradient */}
      <div
        className="spray-cloud"
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: `
            radial-gradient(
              circle,
              rgba(0, 228, 255, 0.4) 0%,
              rgba(155, 0, 255, 0.3) 30%,
              rgba(255, 62, 191, 0.2) 60%,
              transparent 100%
            )
          `,
          filter: 'blur(80px)',
          animation: isAnimating ? 'sprayExpand 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
        }}
      />

      {/* Secondary Spray Cloud - Pink Accent */}
      <div
        className="spray-cloud-accent"
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `
            radial-gradient(
              circle,
              rgba(255, 62, 191, 0.5) 0%,
              rgba(155, 0, 255, 0.3) 50%,
              transparent 100%
            )
          `,
          filter: 'blur(60px)',
          animation: isAnimating ? 'sprayExpand 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards' : 'none',
        }}
      />

      {/* Neon Pulse Layer */}
      <div
        className="pulse"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(0, 228, 255, 0.15) 0%, transparent 60%)',
          animation: isAnimating ? 'neonPulse 0.9s ease-out forwards' : 'none',
        }}
      />

      {/* Motion Blur Streaks - Cyan */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`cyan-streak-${i}`}
          style={{
            position: 'absolute',
            width: '300px',
            height: '4px',
            background: 'linear-gradient(90deg, transparent 0%, #00E4FF 50%, transparent 100%)',
            filter: 'blur(3px)',
            top: `${30 + i * 15}%`,
            left: '50%',
            transform: 'translateX(-50%) rotate(-5deg)',
            animation: isAnimating ? `motionBlur 0.6s ease-out ${i * 0.05}s forwards` : 'none',
          }}
        />
      ))}

      {/* Motion Blur Streaks - Pink */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`pink-streak-${i}`}
          style={{
            position: 'absolute',
            width: '250px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, #FF3EBF 50%, transparent 100%)',
            filter: 'blur(2px)',
            top: `${35 + i * 12}%`,
            left: '50%',
            transform: 'translateX(-50%) rotate(5deg)',
            animation: isAnimating ? `motionBlur 0.7s ease-out ${i * 0.06}s forwards` : 'none',
          }}
        />
      ))}

      {/* Overshoot Pulse Ring */}
      <div
        className="overshoot-ring"
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: '2px solid rgba(0, 228, 255, 0.3)',
          animation: isAnimating ? 'overshoot 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, neonPulse 0.9s ease-out forwards' : 'none',
        }}
      />

      {/* Particle Spray Effects */}
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * 360;
        const distance = 100 + Math.random() * 200;
        return (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: i % 2 === 0 ? '#00E4FF' : '#FF3EBF',
              boxShadow: `0 0 10px ${i % 2 === 0 ? '#00E4FF' : '#FF3EBF'}`,
              filter: 'blur(2px)',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%)`,
              animation: isAnimating 
                ? `sprayExpand 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.02}s forwards` 
                : 'none',
            }}
          />
        );
      })}

      {/* Cyberpunk Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            linear-gradient(90deg, transparent 0%, rgba(0, 228, 255, 0.03) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(255, 62, 191, 0.03) 50%, transparent 100%)
          `,
          backgroundSize: '100px 100px',
          animation: isAnimating ? 'overshoot 0.9s ease-out forwards' : 'none',
          opacity: 0.3,
        }}
      />
    </div>
  );
};

export default NeonTransitionLayer;
