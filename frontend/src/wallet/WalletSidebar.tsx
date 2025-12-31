/**
 * WalletSidebar Component (D11)
 * 
 * Left sidebar showing wallet list with graffiti styling
 * Features:
 * - Wallet cards with avatars
 * - SOL balance + PnL
 * - Active wallet highlight
 * - Add wallet button
 */

import React from 'react';
import { useMultiWalletEngine } from '../walletTerminal/multiWalletEngine';
import { useSFX } from '../sfx/useSFX';

export const WalletSidebar: React.FC = () => {
  const { wallets, activeWallet, setActiveWallet, addWallet } = useMultiWalletEngine();
  const { play } = useSFX();

  const handleWalletClick = (walletId: string) => {
    setActiveWallet(walletId);
    play('alert');
  };

  const handleAddWallet = () => {
    const walletName = `Wallet ${wallets.length + 1}`;
    const newAddress = `DCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    addWallet({
      name: walletName,
      address: newAddress,
      groupId: null,
      solBalance: 0,
      usdBalance: 0,
      pnl: 0,
      pnlPercent: 0,
      tags: [],
    });
    play('alert');
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  const formatPnL = (pnl: number) => {
    return `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%`;
  };

  return (
    <>
      <style>
        {`
          .wallet-sidebar-container {
            width: 320px;
            background: #0A0A0F;
            border-right: 2px solid rgba(255,62,191,0.3);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
          }

          .wallet-sidebar-header {
            padding: 20px;
            border-bottom: 2px solid rgba(255,62,191,0.2);
          }

          .wallet-sidebar-title {
            font-size: 18px;
            font-weight: 700;
            color: #00E4FF;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }

          .add-wallet-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%);
            border: 2px solid #00E4FF;
            border-radius: 12px;
            color: white;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .add-wallet-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
          }

          .wallet-list {
            flex: 1;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .wallet-card {
            background: #131318;
            border: 2px solid rgba(155,0,255,0.3);
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }

          .wallet-card:hover {
            border-color: rgba(0,228,255,0.6);
            transform: translateX(4px);
            box-shadow: 0 0 15px rgba(0,228,255,0.4);
          }

          .wallet-card.active {
            border-color: #FF3EBF;
            background: linear-gradient(135deg, rgba(255,62,191,0.1) 0%, rgba(155,0,255,0.1) 100%);
            box-shadow: 0 0 20px rgba(255,62,191,0.5);
          }

          .wallet-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }

          .wallet-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF3EBF 0%, #00E4FF 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
            color: white;
            border: 2px solid #9B00FF;
          }

          .wallet-name {
            font-size: 16px;
            font-weight: 700;
            color: #FFFFFF;
          }

          .wallet-balance {
            font-size: 14px;
            color: #00E4FF;
            margin-bottom: 4px;
          }

          .wallet-pnl {
            font-size: 12px;
            font-weight: 600;
          }

          .wallet-pnl.positive {
            color: #00FF55;
          }

          .wallet-pnl.negative {
            color: #FF3EBF;
          }

          .empty-state {
            padding: 40px 20px;
            text-align: center;
            color: rgba(255,255,255,0.5);
          }

          @media (max-width: 768px) {
            .wallet-sidebar-container {
              width: 280px;
            }
          }
        `}
      </style>

      <div className="wallet-sidebar-container">
        <div className="wallet-sidebar-header">
          <div className="wallet-sidebar-title">WALLETS</div>
          <button className="add-wallet-btn" onClick={handleAddWallet}>
            <span>➕</span>
            <span>Add Wallet</span>
          </button>
        </div>

        <div className="wallet-list">
          {wallets.length === 0 ? (
            <div className="empty-state">
              No wallets yet. Create your first wallet to get started!
            </div>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`wallet-card ${activeWallet?.id === wallet.id ? 'active' : ''}`}
                onClick={() => handleWalletClick(wallet.id)}
              >
                <div className="wallet-card-header">
                  <div className="wallet-avatar">
                    {wallet.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="wallet-name">{wallet.name}</div>
                  </div>
                </div>
                <div className="wallet-balance">
                  {formatBalance(wallet.solBalance)} SOL
                </div>
                <div className={`wallet-pnl ${wallet.pnlPercent >= 0 ? 'positive' : 'negative'}`}>
                  {formatPnL(wallet.pnlPercent)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WalletSidebar;
