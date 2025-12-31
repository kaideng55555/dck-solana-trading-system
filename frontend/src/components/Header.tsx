import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAlertsStore } from "../stores/alertsStore";
import logo from "./dck-logo.webp"; // 👈 this matches your setup exactly

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const alertCount = useAlertsStore((s) => s.alerts.length);

  const isAlertsPage = location.pathname === '/alerts';

  return (
    <>
      <style>
        {`
          @keyframes pinkPurpleGlow {
            0%, 100% { box-shadow: 0 0 15px rgba(255,62,191,0.4), 0 0 30px rgba(155,0,255,0.3); }
            50% { box-shadow: 0 0 25px rgba(255,62,191,0.6), 0 0 40px rgba(155,0,255,0.5); }
          }

          @keyframes badgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .alerts-btn {
            padding: 10px 20px;
            background: rgba(0,228,255,0.05);
            border: 2px solid #00E4FF;
            border-radius: 12px;
            color: #00E4FF;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .alerts-btn:hover {
            background: rgba(0,228,255,0.1);
            animation: pinkPurpleGlow 2s ease-in-out infinite;
          }

          .alerts-btn.active {
            background: linear-gradient(135deg, rgba(255,62,191,0.2) 0%, rgba(155,0,255,0.2) 100%);
            border-color: #FF3EBF;
            color: #FF3EBF;
            box-shadow: 0 0 20px rgba(255,62,191,0.4);
          }

          .alert-badge {
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%);
            border-radius: 10px;
            font-size: 11px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            box-shadow: 0 0 10px rgba(255,62,191,0.6);
          }

          .alert-badge.has-alerts {
            animation: badgePulse 2s ease-in-out infinite;
          }
        `}
      </style>
      <header
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          padding: "0.5rem 2rem",
        }}
      >
        <img
          src={logo}
          alt="DCK$ Tools"
          style={{
            width: "260px",
            height: "auto",
            imageRendering: "crisp-edges",
            filter:
              "drop-shadow(0 0 2px #2FD9FF) drop-shadow(0 0 4px #FF41D6)",
            cursor: "pointer",
          }}
          onClick={() => navigate('/')}
        />

        <button
          className={`alerts-btn ${isAlertsPage ? 'active' : ''}`}
          onClick={() => navigate('/alerts')}
          title="View Alert History (Press H)"
        >
          <span>🔔 Alerts</span>
          <span className={`alert-badge ${alertCount > 0 ? 'has-alerts' : ''}`}>
            {alertCount}
          </span>
        </button>
      </header>
    </>
  );
}