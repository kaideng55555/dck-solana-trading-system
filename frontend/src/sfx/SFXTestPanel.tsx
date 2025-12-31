/**
 * SFXTestPanel Component
 * 
 * Test panel for DCK Sound System
 * Allows testing all sound effects with visual feedback
 */

import React, { useState } from 'react';
import { useSFX } from './useSFX';
import { SFXToggle } from './SFXToggle';
import type { SFXName } from './soundEngine';

export const SFXTestPanel: React.FC = () => {
  const { play, enabled } = useSFX();
  const [lastPlayed, setLastPlayed] = useState<SFXName | null>(null);

  const sounds: Array<{ name: SFXName; label: string; icon: string; color: string }> = [
    { name: 'shotgun', label: 'Shotgun', icon: '🔫', color: '#FF3EBF' },
    { name: 'sniperReady', label: 'Sniper Ready', icon: '🎯', color: '#00E4FF' },
    { name: 'alert', label: 'Alert', icon: '⚠️', color: '#FFB800' },
    { name: 'buy', label: 'Buy', icon: '🟢', color: '#00FF88' },
    { name: 'sell', label: 'Sell', icon: '🔴', color: '#FF3E3E' },
    { name: 'rug', label: 'Rug Pull', icon: '💀', color: '#9B00FF' },
  ];

  const handlePlay = (name: SFXName) => {
    play(name);
    setLastPlayed(name);
    setTimeout(() => setLastPlayed(null), 500);
  };

  return (
    <>
      <style>
        {`
          @keyframes flashButton {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.95); }
          }

          .sfx-test-button {
            transition: all 0.2s;
          }

          .sfx-test-button:hover {
            transform: scale(1.05);
          }

          .sfx-test-button.playing {
            animation: flashButton 0.5s ease-out;
          }
        `}
      </style>

      <div
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(7,7,10,0.95), rgba(20,20,30,0.95))',
          borderRadius: '16px',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF) 1',
          boxShadow: '0 0 30px rgba(0,228,255,0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}
          >
            🔊 SFX Test Panel
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Click buttons to test sound effects
          </p>
        </div>

        {/* Toggle Control */}
        <div style={{ marginBottom: '32px' }}>
          <SFXToggle />
        </div>

        {/* Status */}
        <div
          style={{
            marginBottom: '24px',
            padding: '12px',
            background: enabled
              ? 'rgba(0,228,255,0.1)'
              : 'rgba(128,128,128,0.1)',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: enabled ? '#00E4FF' : '#888',
          }}
        >
          {enabled ? '✅ Sound enabled' : '🔇 Sound disabled'}
          {lastPlayed && ` | Last played: ${lastPlayed}`}
        </div>

        {/* Sound Buttons Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          {sounds.map((sound) => (
            <button
              key={sound.name}
              onClick={() => handlePlay(sound.name)}
              className={`sfx-test-button ${lastPlayed === sound.name ? 'playing' : ''}`}
              style={{
                padding: '16px',
                background: `linear-gradient(135deg, ${sound.color}33, ${sound.color}11)`,
                border: `2px solid ${sound.color}`,
                borderRadius: '12px',
                color: sound.color,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: `0 0 15px ${sound.color}33`,
              }}
              disabled={!enabled}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {sound.icon}
              </div>
              <div>{sound.label}</div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(155,0,255,0.1)',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 700, color: '#9B00FF' }}>
            📝 Integration Status:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>✅ S1 Quick Snipe — Shotgun on click</li>
            <li>✅ S2 Curve Edge — Sniper Ready on high confidence</li>
            <li>✅ S3 Hot Buy Bot — Alert/Buy/Rug on trades</li>
            <li>✅ S4 LP Event — Sniper Ready on high score</li>
            <li>✅ S5 Smart Limits — Buy/Sell on execution</li>
            <li>⏳ S6 Watchdog — TODO</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SFXTestPanel;
