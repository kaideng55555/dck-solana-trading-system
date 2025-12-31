/**
 * WalletTerminal Component (D11)
 * 
 * Multi-Wallet Trading Terminal - Main Layout
 * Features:
 * - 3-column grid layout (Desktop)
 * - Responsive mobile view
 * - Timeline drawer
 * - Cyberpunk × Graffiti styling
 */

import React, { useState } from 'react';
import { WalletSidebar } from './WalletSidebar';
import { WalletDashboard } from './WalletDashboard';
import { WalletSniperFeed } from './WalletSniperFeed';
import { WalletTimeline } from './WalletTimeline';
import { useMultiWalletEngine } from './multiWalletEngine';
import { walletTheme } from './walletTheme';

const { bg } = walletTheme;

export const WalletTerminal: React.FC = () => {
  const { toggleTimeline } = useMultiWalletEngine();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive layout
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <style>
        {`
          .wallet-terminal-container {
            width: 100%;
            height: 100vh;
            background: ${bg.dark};
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .wallet-terminal-header {
            padding: 16px 20px;
            border-bottom: 2px solid rgba(255,62,191,0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, rgba(255,62,191,0.05), rgba(0,228,255,0.05));
          }
          
          .terminal-title {
            font-size: 24px;
            font-weight: 900;
            font-family: Impact, Anton, sans-serif;
            background: linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 1px;
          }
          
          .terminal-actions {
            display: flex;
            gap: 12px;
          }
          
          .action-button {
            padding: 8px 16px;
            background: rgba(0,228,255,0.2);
            border: 1px solid #00E4FF;
            border-radius: 8px;
            color: #00E4FF;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.1s ease;
          }
          
          .action-button:hover {
            background: rgba(0,228,255,0.4);
            box-shadow: 0 0 12px rgba(0,228,255,0.6);
            transform: scale(1.02);
          }
          
          .wallet-terminal-body {
            flex: 1;
            display: grid;
            grid-template-columns: 280px 1fr 320px;
            overflow: hidden;
          }
          
          @media (max-width: 1024px) {
            .wallet-terminal-body {
              grid-template-columns: 240px 1fr;
            }
            
            .sniper-feed-mobile-hidden {
              display: none;
            }
          }
          
          @media (max-width: 768px) {
            .wallet-terminal-body {
              grid-template-columns: 1fr;
            }
            
            .sidebar-mobile-hidden {
              display: none;
            }
          }
          
          .terminal-column {
            overflow: hidden;
          }
        `}
      </style>

      <div className="wallet-terminal-container">
        {/* Header */}
        <div className="wallet-terminal-header">
          <div className="terminal-title">🔑 MULTI-WALLET TERMINAL</div>
          
          <div className="terminal-actions">
            <button
              className="action-button"
              onClick={toggleTimeline}
              title="Open trade timeline"
            >
              📊 Timeline
            </button>
            <button
              className="action-button"
              onClick={() => alert('Import wallet feature coming soon!')}
              title="Import wallet"
            >
              ➕ Import Wallet
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="wallet-terminal-body">
          {/* Left: Wallet Sidebar */}
          <div className={`terminal-column ${isMobile ? 'sidebar-mobile-hidden' : ''}`}>
            <WalletSidebar />
          </div>

          {/* Center: Dashboard */}
          <div className="terminal-column">
            <WalletDashboard />
          </div>

          {/* Right: Sniper Feed */}
          {!isMobile && (
            <div className="terminal-column sniper-feed-mobile-hidden">
              <WalletSniperFeed />
            </div>
          )}
        </div>

        {/* Bottom: Timeline Drawer */}
        <WalletTimeline />
      </div>
    </>
  );
};

export default WalletTerminal;
