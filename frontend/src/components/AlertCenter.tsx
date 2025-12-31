/**
 * AlertCenter Component (D13)
 * 
 * Global alert notification center with hybrid neon HUD + graffiti styling
 * Features:
 * - Fixed position top-right corner
 * - Stacked alerts with slide-in animation
 * - Auto-dismiss with progress bar
 * - Mute/unmute toggle
 * - Sound effects via D10 SFX
 * - Clean HUD frame with graffiti spray accents
 */

import React, { useEffect } from 'react';
import { useAlertsStore } from '../stores/alertsStore';
import { AlertTag } from './AlertTag';
import { useSFX } from '../sfx/useSFX';

export const AlertCenter: React.FC = () => {
  const alerts = useAlertsStore((s) => s.alerts);
  const muted = useAlertsStore((s) => s.muted);
  const toggleMute = useAlertsStore((s) => s.toggleMute);
  const clearAllAlerts = useAlertsStore((s) => s.clearAllAlerts);
  const { play } = useSFX();

  // Play sound for new alerts
  useEffect(() => {
    if (alerts.length === 0 || muted) return;

    const latestAlert = alerts[alerts.length - 1];
    const sound = getAlertSound(latestAlert.type, latestAlert.level);
    
    if (sound) {
      play(sound as any);
    }
  }, [alerts.length, muted, play]);

  // Helper to get sound name
  const getAlertSound = (type: string, level: string): string | null => {
    if (level === 'danger' || type === 'rug') return 'shotgun';
    if (level === 'success' || type === 'pnl') return 'alert';
    if (type === 'sniper') return 'snipe';
    return null;
  };

  return (
    <>
      <style>
        {`
          @keyframes hudSlideIn {
            0% { transform: translateX(140%); opacity: 0; }
            80% { transform: translateX(-6%); opacity: 1; }
            100% { transform: translateX(0); }
          }

          @keyframes hudFadeOut {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(12px); }
          }

          @keyframes sprayBurst {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: scale(1.5) rotate(180deg); opacity: 0; }
          }

          .alert-center-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 420px;
            pointer-events: none;
          }

          .alert-center-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: rgba(10,10,15,0.95);
            border: 2px solid rgba(0,228,255,0.4);
            border-radius: 12px;
            backdrop-filter: blur(12px);
            pointer-events: auto;
          }

          .alert-center-title {
            font-size: 14px;
            font-weight: 700;
            color: #00E4FF;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .alert-count {
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%);
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 900;
          }

          .alert-controls {
            display: flex;
            gap: 8px;
          }

          .alert-control-btn {
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            color: #FFFFFF;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .alert-control-btn:hover {
            background: rgba(0,228,255,0.2);
            border-color: #00E4FF;
            box-shadow: 0 0 12px rgba(0,228,255,0.4);
          }

          .alert-control-btn.active {
            background: rgba(255,62,191,0.2);
            border-color: #FF3EBF;
            color: #FF3EBF;
          }

          .alerts-stack {
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            padding-right: 4px;
          }

          .alerts-stack::-webkit-scrollbar {
            width: 6px;
          }

          .alerts-stack::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 3px;
          }

          .alerts-stack::-webkit-scrollbar-thumb {
            background: rgba(0,228,255,0.4);
            border-radius: 3px;
          }

          .alerts-stack::-webkit-scrollbar-thumb:hover {
            background: rgba(0,228,255,0.6);
          }

          @media (max-width: 768px) {
            .alert-center-container {
              top: 10px;
              right: 10px;
              left: 10px;
              max-width: none;
            }
          }
        `}
      </style>

      <div className="alert-center-container">
        {/* Header with controls */}
        {alerts.length > 0 && (
          <div className="alert-center-header">
            <div className="alert-center-title">
              🔔 Alerts
              <span className="alert-count">{alerts.length}</span>
            </div>
            <div className="alert-controls">
              <button
                className={`alert-control-btn ${muted ? 'active' : ''}`}
                onClick={toggleMute}
                title={muted ? 'Unmute alerts' : 'Mute alerts'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <button
                className="alert-control-btn"
                onClick={clearAllAlerts}
                title="Clear all alerts"
              >
                🗑️
              </button>
            </div>
          </div>
        )}

        {/* Alerts stack */}
        <div className="alerts-stack">
          {alerts.map((alert) => (
            <AlertTag key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </>
  );
};

export default AlertCenter;
