/**
 * WalletSidebar Component (D11)
 * 
 * Graffiti-style wallet group navigation
 * Features:
 * - Spray-painted header
 * - Neon bubble groups
 * - Wallet cards with avatars
 * - SOL balance + USD value
 * - PnL % with sparkline
 * - Sound effects on interaction
 * - Shake animation on hover
 */

import React from 'react';
import { useMultiWalletEngine } from './multiWalletEngine';
import { walletTheme } from './walletTheme';
import { useSFX } from '../sfx/useSFX';
import type { Wallet, WalletGroup } from './walletTypes';

const { colors, bg, shadows, textEffects, animations } = walletTheme;

export const WalletSidebar: React.FC = () => {
  const { wallets, groups, activeWallet, setActiveWallet } = useMultiWalletEngine();
  const { play } = useSFX();

  const handleWalletClick = (walletId: string) => {
    setActiveWallet(walletId);
    play('alert'); // spray.wav in production
  };

  // Group wallets by groupId
  const groupedWallets: Record<string, Wallet[]> = {};
  const ungroupedWallets: Wallet[] = [];

  (wallets as Wallet[]).forEach((wallet) => {
    if (wallet.groupId) {
      if (!groupedWallets[wallet.groupId]) {
        groupedWallets[wallet.groupId] = [];
      }
      groupedWallets[wallet.groupId].push(wallet);
    } else {
      ungroupedWallets.push(wallet);
    }
  });

  return (
    <>
      <style>
        {`
          ${animations.shake}
          ${animations.drip}
          
          .wallet-sidebar-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: ${bg.dark};
            border-right: 2px solid rgba(0,228,255,0.3);
            overflow-y: auto;
          }
          
          .sidebar-header {
            padding: 20px;
            border-bottom: 2px solid rgba(255,62,191,0.3);
            position: relative;
          }
          
          .sidebar-title {
            font-size: 28px;
            font-weight: 900;
            font-family: Impact, Anton, sans-serif;
            color: ${colors.pink};
            text-shadow: ${textEffects.pinkGlow.textShadow};
            letter-spacing: 2px;
            position: relative;
          }
          
          .title-drip {
            position: absolute;
            bottom: -8px;
            left: 20%;
            width: 3px;
            height: 12px;
            background: linear-gradient(180deg, ${colors.pink}, transparent);
            animation: drip 2s ease-in-out infinite;
          }
          
          .wallet-groups-container {
            padding: 16px;
            flex: 1;
            overflow-y: auto;
          }
          
          .wallet-group {
            margin-bottom: 24px;
          }
          
          .group-header {
            font-size: 14px;
            font-weight: 700;
            color: ${colors.cyan};
            margin-bottom: 8px;
            padding: 8px 12px;
            background: rgba(0,228,255,0.1);
            border-left: 3px solid ${colors.cyan};
            border-radius: 4px;
            text-shadow: ${textEffects.neonGlow.textShadow};
          }
          
          .wallet-card {
            background: ${bg.card};
            border: 2px solid rgba(155,0,255,0.3);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.1s ease;
            position: relative;
          }
          
          .wallet-card:hover {
            border-color: ${colors.cyan};
            box-shadow: ${shadows.glowCyan};
            animation: shake 0.3s ease-in-out;
            background: ${bg.hover};
          }
          
          .wallet-card.active {
            border-color: ${colors.pink};
            box-shadow: ${shadows.glowPink};
            background: ${bg.hover};
          }
          
          .wallet-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${colors.pink}, ${colors.purple}, ${colors.cyan});
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 900;
            color: #FFF;
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
            margin-right: 12px;
            flex-shrink: 0;
          }
          
          .wallet-info {
            flex: 1;
            min-width: 0;
          }
          
          .wallet-name {
            font-size: 14px;
            font-weight: 700;
            color: #FFF;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .wallet-balance {
            font-size: 12px;
            color: ${colors.cyan};
            margin-bottom: 2px;
          }
          
          .wallet-usd {
            font-size: 11px;
            color: rgba(255,255,255,0.6);
          }
          
          .wallet-pnl {
            font-size: 13px;
            font-weight: 700;
            margin-top: 4px;
          }
          
          .wallet-pnl.positive {
            color: ${colors.green};
            text-shadow: 0 0 8px rgba(0,255,85,0.6);
          }
          
          .wallet-pnl.negative {
            color: ${colors.red};
            text-shadow: 0 0 8px rgba(255,0,85,0.6);
          }
          
          .wallet-address {
            font-size: 10px;
            color: rgba(255,255,255,0.4);
            font-family: monospace;
            margin-top: 2px;
          }
        `}
      </style>

      <div className="wallet-sidebar-container">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-title">
            🔑 WALLETS
            <div className="title-drip" />
          </div>
        </div>

        {/* Wallet Groups */}
        <div className="wallet-groups-container">
          {/* Grouped Wallets */}
          {groups.map((group) => {
            const groupWallets = groupedWallets[group.id] || [];
            if (groupWallets.length === 0) return null;

            return (
              <div key={group.id} className="wallet-group">
                <div
                  className="group-header"
                  style={{ borderLeftColor: group.color }}
                >
                  {group.name}
                </div>
                {groupWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    isActive={activeWallet?.id === wallet.id}
                    onClick={() => handleWalletClick(wallet.id)}
                  />
                ))}
              </div>
            );
          })}

          {/* Ungrouped Wallets */}
          {ungroupedWallets.length > 0 && (
            <div className="wallet-group">
              <div className="group-header">📂 Ungrouped</div>
              {ungroupedWallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  isActive={activeWallet?.id === wallet.id}
                  onClick={() => handleWalletClick(wallet.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {(wallets as Wallet[]).length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '14px',
              }}
            >
              No wallets yet
              <br />
              <span style={{ fontSize: '12px' }}>Import or create a wallet to start</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// =============================================
// WALLET CARD COMPONENT
// =============================================

interface WalletCardProps {
  wallet: Wallet;
  isActive: boolean;
  onClick: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, isActive, onClick }) => {
  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  const formatBalance = (balance: number) => balance.toFixed(4);
  const formatUsd = (usd: number) => `$${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const pnlClass = wallet.pnl >= 0 ? 'positive' : 'negative';
  const pnlSign = wallet.pnl >= 0 ? '+' : '';

  return (
    <div
      className={`wallet-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      {/* Avatar */}
      <div className="wallet-avatar">{getInitial(wallet.name)}</div>

      {/* Info */}
      <div className="wallet-info">
        <div className="wallet-name">{wallet.name}</div>
        <div className="wallet-balance">{formatBalance(wallet.solBalance)} SOL</div>
        <div className="wallet-usd">{formatUsd(wallet.usdBalance)}</div>
        <div className={`wallet-pnl ${pnlClass}`}>
          {pnlSign}{wallet.pnlPercent.toFixed(2)}% • {formatUsd(wallet.pnl)}
        </div>
        <div className="wallet-address">{formatAddress(wallet.address)}</div>
      </div>
    </div>
  );
};

export default WalletSidebar;
