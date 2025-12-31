/**
 * AlertTag Component (D13)
 * 
 * Individual alert notification with hybrid neon HUD + graffiti styling
 * Features:
 * - Clean HUD frame with type-based border color
 * - Graffiti spray burst accent on appear
 * - Auto-dismiss progress bar
 * - Click to dismiss
 * - Icon + message + timestamp
 * - Level-based styling (success, info, warning, danger)
 */

import React, { useEffect, useState } from 'react';
import { useAlertsStore, getAlertColor, getAlertIcon, type AlertItem } from '../stores/alertsStore';

interface AlertTagProps {
  alert: AlertItem;
}

export const AlertTag: React.FC<AlertTagProps> = ({ alert }) => {
  const removeAlert = useAlertsStore((s) => s.removeAlert);
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const color = getAlertColor(alert.level);
  const icon = getAlertIcon(alert.type);
  const duration = alert.duration || 5000;

  // Progress bar animation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  // Handle dismiss
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeAlert(alert.id);
    }, 300);
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <>
      <style>
        {`
          @keyframes alertSlideIn {
            0% { transform: translateX(140%); opacity: 0; }
            80% { transform: translateX(-6%); opacity: 1; }
            100% { transform: translateX(0); }
          }

          @keyframes alertFadeOut {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(12px) scale(0.95); }
          }

          @keyframes sprayBurstAlert {
            0% { 
              transform: scale(0.8) rotate(0deg); 
              opacity: 0; 
            }
            30% {
              opacity: 0.8;
            }
            100% { 
              transform: scale(2) rotate(180deg); 
              opacity: 0; 
            }
          }

          @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
          }

          .alert-tag {
            position: relative;
            background: rgba(10,10,15,0.95);
            border: 2px solid ${color};
            border-radius: 16px;
            padding: 16px;
            backdrop-filter: blur(12px);
            cursor: pointer;
            transition: all 0.3s ease;
            animation: alertSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: auto;
            overflow: hidden;
            box-shadow: 0 0 20px ${color}40;
          }

          .alert-tag.exiting {
            animation: alertFadeOut 0.3s ease forwards;
          }

          .alert-tag:hover {
            transform: translateX(-4px);
            box-shadow: 0 0 30px ${color}60;
            border-color: ${color};
          }

          .alert-tag::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, transparent 30%, ${color}44 100%);
            transform: translate(-50%, -50%);
            animation: sprayBurstAlert 0.8s ease-out;
            pointer-events: none;
          }

          .alert-tag-content {
            position: relative;
            z-index: 1;
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }

          .alert-icon {
            font-size: 24px;
            flex-shrink: 0;
            filter: drop-shadow(0 0 8px ${color});
          }

          .alert-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .alert-type {
            font-size: 11px;
            font-weight: 700;
            color: ${color};
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .alert-time {
            font-size: 10px;
            color: rgba(255,255,255,0.5);
            font-family: 'Courier New', monospace;
          }

          .alert-message {
            font-size: 14px;
            color: #FFFFFF;
            line-height: 1.4;
            font-weight: 500;
          }

          .alert-progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: ${color};
            border-radius: 0 0 14px 14px;
            box-shadow: 0 0 10px ${color};
            animation: progressShrink ${duration}ms linear;
          }

          .alert-dismiss {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
          }

          .alert-tag:hover .alert-dismiss {
            opacity: 1;
          }

          .alert-dismiss:hover {
            background: rgba(255,62,191,0.2);
            border-color: #FF3EBF;
            color: #FF3EBF;
          }

          .alert-data {
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            background: rgba(0,0,0,0.3);
            padding: 8px;
            border-radius: 8px;
            border-left: 2px solid ${color};
            margin-top: 4px;
            font-family: 'Courier New', monospace;
          }
        `}
      </style>

      <div 
        className={`alert-tag ${isExiting ? 'exiting' : ''}`}
        onClick={handleDismiss}
      >
        <div className="alert-tag-content">
          <div className="alert-icon">{icon}</div>
          
          <div className="alert-body">
            <div className="alert-header">
              <div className="alert-type">{alert.type}</div>
              <div className="alert-time">{formatTime(alert.timestamp)}</div>
            </div>
            
            <div className="alert-message">{alert.message}</div>
            
            {alert.data && (
              <div className="alert-data">
                {typeof alert.data === 'string' 
                  ? alert.data 
                  : JSON.stringify(alert.data, null, 2)}
              </div>
            )}
          </div>

          <button 
            className="alert-dismiss"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>

        <div className="alert-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </>
  );
};

export default AlertTag;
