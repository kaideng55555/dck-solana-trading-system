/**
 * SFXToggle Component
 * 
 * DCK-styled sound toggle with volume slider
 * Features:
 * - Pink→Cyan gradient glow
 * - SOUND ON/OFF indicator
 * - Volume slider
 * - Spray-paint border drip effect
 * - Shake animation on click
 * - LocalStorage persistence
 */

import React, { useState } from 'react';
import { useSFX } from './useSFX';

export const SFXToggle: React.FC = () => {
  const { enabled, volume, toggle, setVolume, play } = useSFX();
  const [isShaking, setIsShaking] = useState(false);

  const handleToggle = () => {
    const newState = !enabled;
    toggle(newState);
    
    // Play test sound when enabling
    if (newState) {
      play('shotgun');
    }

    // Shake animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // Play test sound on volume change
    if (enabled) {
      play('alert');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
            20%, 40%, 60%, 80% { transform: translateX(3px); }
          }

          @keyframes dripFall {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(10px); opacity: 0; }
          }

          @keyframes glowPulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(255,62,191,0.4), 0 0 30px rgba(0,228,255,0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(255,62,191,0.8), 0 0 50px rgba(0,228,255,0.6);
            }
          }

          .sfx-toggle-container {
            animation: ${isShaking ? 'shake 0.3s ease-in-out' : 'none'};
          }

          .volume-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            background: linear-gradient(90deg, rgba(255,62,191,0.3), rgba(0,228,255,0.3));
            outline: none;
            border-radius: 3px;
          }

          .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: linear-gradient(135deg, #FF3EBF, #00E4FF);
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,228,255,0.8);
          }

          .volume-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: linear-gradient(135deg, #FF3EBF, #00E4FF);
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,228,255,0.8);
            border: none;
          }
        `}
      </style>

      <div
        className="sfx-toggle-container"
        style={{
          position: 'relative',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(255,62,191,0.1), rgba(155,0,255,0.1), rgba(0,228,255,0.1))',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF) 1',
          borderRadius: '16px',
          boxShadow: '0 0 20px rgba(0,228,255,0.3)',
          animation: enabled ? 'glowPulse 3s ease-in-out infinite' : 'none',
        }}
      >
        {/* Spray drip effects */}
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '20%',
            width: '4px',
            height: '12px',
            background: 'linear-gradient(180deg, #00E4FF, transparent)',
            borderRadius: '2px',
            animation: 'dripFall 2s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            width: '3px',
            height: '15px',
            background: 'linear-gradient(180deg, #9B00FF, transparent)',
            borderRadius: '2px',
            animation: 'dripFall 2s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-7px',
            right: '30%',
            width: '4px',
            height: '10px',
            background: 'linear-gradient(180deg, #FF3EBF, transparent)',
            borderRadius: '2px',
            animation: 'dripFall 2s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: enabled ? '#00E4FF' : '#888',
              textShadow: enabled ? '0 0 10px rgba(0,228,255,0.8)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            🔊 SOUND {enabled ? 'ON' : 'OFF'}
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            style={{
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 700,
              background: enabled
                ? 'linear-gradient(135deg, rgba(0,228,255,0.4), rgba(155,0,255,0.3))'
                : 'rgba(0,0,0,0.3)',
              border: enabled
                ? '2px solid rgba(0,228,255,0.8)'
                : '2px solid rgba(128,128,128,0.3)',
              borderRadius: '8px',
              color: enabled ? '#00E4FF' : '#888',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textShadow: enabled ? '0 0 10px rgba(0,228,255,0.8)' : 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {enabled ? '🔊 ON' : '🔇 OFF'}
          </button>
        </div>

        {/* Volume Slider */}
        {enabled && (
          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '8px',
              }}
            >
              Volume: {Math.round(volume * 100)}%
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        )}

        {/* Info Text */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
          }}
        >
          {enabled ? '🎯 Sniper sounds active' : 'Sound effects disabled'}
        </div>
      </div>
    </>
  );
};

export default SFXToggle;
