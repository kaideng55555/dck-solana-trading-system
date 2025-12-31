/**
 * WalletDashboard Component (D11 + D12 Integration)
 * 
 * Multi-wallet management terminal with neon cyberpunk styling
 * Features:
 * - Total SOL + USD value across all wallets
 * - Wallet count with incoming/outgoing chart
 * - Daily PnL summary cards
 * - Left sidebar: Wallet list
 * - Right panel: Active wallet details OR Portfolio view
 * - DCK neon theme (pink → purple → cyan)
 * - D12: Portfolio tab with graffiti neon engine
 */

import React, { useState } from 'react';
import { useMultiWalletEngine } from '../walletTerminal/multiWalletEngine';
import { WalletSidebar } from './WalletSidebar';
import { WalletDetailsPanel } from './WalletDetailsPanel';
import { PortfolioDashboard } from '../portfolio/PortfolioDashboard';
import { PortfolioDistribution } from '../portfolio/PortfolioDistribution';
import { PortfolioTokenList } from '../portfolio/PortfolioTokenList';
import { PortfolioPnLChart } from '../portfolio/PortfolioPnLChart';

export const WalletDashboard: React.FC = () => {
  const { wallets, summary, activeWallet, loading } = useMultiWalletEngine();
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'wallets' | 'portfolio'>('wallets');

  const formatUSD = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatSOL = (val: number) => `${val.toFixed(4)} SOL`;
  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  // Calculate total SOL across all wallets
  const totalSOL = wallets.reduce((sum, w) => sum + w.solBalance, 0);
  
  // Mock USD price for demo (in production, fetch from price feed)
  const solPriceUSD = 180.50;
  const totalValueUSD = totalSOL * solPriceUSD;

  // Wallet count
  const walletCount = wallets.length;

  return (
    <>
      <style>
        {`
          @keyframes neonPulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(255,62,191,0.4), 0 0 10px rgba(155,0,255,0.3);
            }
            50% {
              box-shadow: 0 0 30px rgba(255,62,191,0.8), 0 0 20px rgba(155,0,255,0.6);
            }
          }

          @keyframes dripAnimation {
            0% { transform: translateY(-10px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(10px); opacity: 0; }
          }

          .wallet-dashboard-container {
            width: 100%;
            min-height: 100vh;
            background: #07070A;
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .wallet-header {
            padding: 24px 32px;
            background: linear-gradient(135deg, rgba(255,62,191,0.1) 0%, rgba(155,0,255,0.1) 50%, rgba(0,228,255,0.1) 100%);
            border-bottom: 2px solid rgba(255,62,191,0.3);
            position: relative;
          }

          .wallet-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            width: 20px;
            height: 20px;
            background: linear-gradient(180deg, #FF3EBF 0%, transparent 100%);
            border-radius: 50%;
            filter: blur(8px);
            animation: dripAnimation 3s infinite;
          }

          .wallet-header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .wallet-header-title {
            font-size: 32px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 20px rgba(255,62,191,0.5);
            margin: 0;
            letter-spacing: 2px;
          }

          .tab-switcher {
            display: flex;
            gap: 12px;
          }

          .tab-btn {
            padding: 12px 24px;
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .tab-btn:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.2);
          }

          .tab-btn.active {
            background: linear-gradient(135deg, rgba(255,62,191,0.2) 0%, rgba(0,228,255,0.2) 100%);
            border-color: #00E4FF;
            color: #00E4FF;
            box-shadow: 0 0 20px rgba(0,228,255,0.4);
          }

          .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            padding: 24px 32px;
          }

          .summary-card {
            background: #0A0A0F;
            border: 2px solid rgba(255,62,191,0.3);
            border-radius: 16px;
            padding: 24px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .summary-card:hover {
            border-color: rgba(0,228,255,0.6);
            animation: neonPulse 2s infinite;
            transform: translateY(-4px);
          }

          .summary-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,62,191,0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .summary-card:hover::before {
            opacity: 1;
          }

          .summary-card-icon {
            font-size: 40px;
            margin-bottom: 12px;
          }

          .summary-card-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          .summary-card-value {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #00E4FF 0%, #9B00FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          }

          .summary-card-subtitle {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
          }

          .wallet-content {
            display: flex;
            flex: 1;
            overflow: hidden;
          }

          .portfolio-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            gap: 24px;
            padding: 24px 32px;
            overflow-y: auto;
          }

          .portfolio-metrics {
            grid-column: 1 / -1;
          }

          .portfolio-distribution {
            grid-column: 1 / 2;
          }

          .portfolio-chart {
            grid-column: 2 / 3;
          }

          .portfolio-tokens {
            grid-column: 1 / -1;
          }

          .toggle-sidebar-btn {
            position: fixed;
            top: 100px;
            left: ${showSidebar ? '320px' : '20px'};
            z-index: 100;
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%);
            border: 2px solid #00E4FF;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            color: white;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
          }

          .toggle-sidebar-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 0 30px rgba(255,62,191,0.9);
          }

          @media (max-width: 768px) {
            .wallet-header {
              padding: 16px 20px;
            }

            .wallet-header-title {
              font-size: 24px;
            }

            .summary-cards {
              grid-template-columns: 1fr;
              padding: 16px 20px;
            }

            .toggle-sidebar-btn {
              left: ${showSidebar ? '280px' : '20px'};
              width: 40px;
              height: 40px;
              font-size: 18px;
            }
          }
        `}
      </style>

      <div className="wallet-dashboard-container">
        {/* Header with spray-paint drip effect */}
        <div className="wallet-header">
          <div className="wallet-header-top">
            <h1 className="wallet-header-title dck-header-drip">🔑 MULTI-WALLET TERMINAL</h1>
            
            {/* Tab Switcher */}
            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === 'wallets' ? 'active' : ''}`}
                onClick={() => setActiveTab('wallets')}
              >
                🏦 Wallets
              </button>
              <button
                className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setActiveTab('portfolio')}
              >
                💎 Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card-icon">💰</div>
            <div className="summary-card-label">Total SOL Balance</div>
            <div className="summary-card-value">{formatSOL(totalSOL)}</div>
            <div className="summary-card-subtitle">{formatUSD(totalValueUSD)}</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-icon">📊</div>
            <div className="summary-card-label">Portfolio Value</div>
            <div className="summary-card-value">{formatUSD(totalValueUSD)}</div>
            <div className="summary-card-subtitle">SOL @ {formatUSD(solPriceUSD)}</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-icon">🏦</div>
            <div className="summary-card-label">Active Wallets</div>
            <div className="summary-card-value">{walletCount}</div>
            <div className="summary-card-subtitle">
              {walletCount === 0 ? 'Create your first wallet' : 'Managing multiple wallets'}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-icon">
              {summary.totalPnl >= 0 ? '📈' : '📉'}
            </div>
            <div className="summary-card-label">Daily PnL</div>
            <div className="summary-card-value" style={{
              background: summary.totalPnl >= 0 
                ? 'linear-gradient(135deg, #00FF55 0%, #00E4FF 100%)'
                : 'linear-gradient(135deg, #FF3EBF 0%, #FF7A00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {formatUSD(summary.totalPnl)}
            </div>
            <div className="summary-card-subtitle">
              {formatPercent(summary.totalPnlPercent)}
            </div>
          </div>
        </div>

        {/* Toggle Sidebar Button (only for Wallets tab) */}
        {activeTab === 'wallets' && (
          <button
            className="toggle-sidebar-btn"
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? 'Hide wallet list' : 'Show wallet list'}
          >
            {showSidebar ? '◀' : '▶'}
          </button>
        )}

        {/* Main Content: Wallets or Portfolio */}
        {activeTab === 'wallets' ? (
          <div className="wallet-content">
            {showSidebar && <WalletSidebar />}
            <WalletDetailsPanel />
          </div>
        ) : (
          <div className="portfolio-grid">
            <div className="portfolio-metrics">
              <PortfolioDashboard />
            </div>
            <div className="portfolio-distribution">
              <PortfolioDistribution />
            </div>
            <div className="portfolio-chart">
              <PortfolioPnLChart />
            </div>
            <div className="portfolio-tokens">
              <PortfolioTokenList />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WalletDashboard;
