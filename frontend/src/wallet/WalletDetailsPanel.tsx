/**
 * WalletDetailsPanel Component (D11)
 * 
 * Right panel showing active wallet details
 * Features:
 * - SOL balance
 * - Token holdings with unrealized PnL
 * - Sniper activity log
 * - Buy/Sell/Send buttons
 * - LP risk warnings
 * - Graffiti headers + neon highlights
 */

import React from 'react';
import { useMultiWalletEngine } from '../walletTerminal/multiWalletEngine';
import { useSwapStore } from '../stores/swapStore';
import { useQuickSnipe } from '../hooks/useQuickSnipe';
import { useSFX } from '../sfx/useSFX';
import { WalletActivityFeed } from './WalletActivityFeed';

export const WalletDetailsPanel: React.FC = () => {
  const { activeWallet, updateBalance } = useMultiWalletEngine();
  const openSwap = useSwapStore((s) => s.openSwap);
  const { openQuickSnipe } = useQuickSnipe();
  const { play } = useSFX();

  if (!activeWallet) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '18px',
      }}>
        Select a wallet to view details
      </div>
    );
  }

  const handleBuy = (tokenMint: string) => {
    openSwap(tokenMint, 'TOKEN');
    play('alert');
  };

  const handleSell = (tokenMint: string) => {
    openSwap(tokenMint, 'TOKEN');
    play('alert');
  };

  const handleSnipe = (tokenMint: string) => {
    openQuickSnipe(tokenMint);
    play('shotgun');
  };

  const formatUSD = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
  const formatSOL = (val: number) => `${val.toFixed(4)} SOL`;

  // Mock SOL price
  const solPriceUSD = 180.50;
  const walletValueUSD = activeWallet.solBalance * solPriceUSD;

  return (
    <>
      <style>
        {`
          .wallet-details-container {
            flex: 1;
            background: #07070A;
            overflow-y: auto;
            padding: 24px;
          }

          .details-header {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid rgba(255,62,191,0.3);
            position: relative;
          }

          .details-header::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 0;
            width: 60px;
            height: 4px;
            background: linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%);
            border-radius: 2px;
          }

          .details-title {
            font-size: 24px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            background: linear-gradient(135deg, #FF3EBF 0%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .details-address {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
            margin-top: 8px;
            font-family: monospace;
          }

          .balance-section {
            background: linear-gradient(135deg, rgba(255,62,191,0.1) 0%, rgba(0,228,255,0.1) 100%);
            border: 2px solid rgba(0,228,255,0.4);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .balance-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          .balance-value {
            font-size: 36px;
            font-weight: 700;
            color: #00E4FF;
            margin-bottom: 8px;
          }

          .balance-usd {
            font-size: 18px;
            color: rgba(255,255,255,0.7);
          }

          .pnl-display {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: flex;
            justify-content: space-between;
          }

          .pnl-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .pnl-label {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
          }

          .pnl-value {
            font-size: 16px;
            font-weight: 600;
          }

          .pnl-value.positive {
            color: #00FF55;
          }

          .pnl-value.negative {
            color: #FF3EBF;
          }

          .action-buttons {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }

          .action-btn {
            flex: 1;
            padding: 14px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .action-btn.buy {
            background: linear-gradient(135deg, #00FF55 0%, #00E4FF 100%);
            color: #000;
          }

          .action-btn.buy:hover {
            border-color: #00FF55;
            box-shadow: 0 0 20px rgba(0,255,85,0.6);
            transform: translateY(-2px);
          }

          .action-btn.sell {
            background: linear-gradient(135deg, #FF3EBF 0%, #FF7A00 100%);
            color: #FFF;
          }

          .action-btn.sell:hover {
            border-color: #FF3EBF;
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
            transform: translateY(-2px);
          }

          .action-btn.send {
            background: linear-gradient(135deg, #9B00FF 0%, #00E4FF 100%);
            color: #FFF;
          }

          .action-btn.send:hover {
            border-color: #9B00FF;
            box-shadow: 0 0 20px rgba(155,0,255,0.6);
            transform: translateY(-2px);
          }

          .section {
            margin-bottom: 24px;
          }

          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #FF3EBF;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
            position: relative;
            padding-left: 12px;
          }

          .section-title::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 20px;
            background: linear-gradient(180deg, #FF3EBF 0%, #9B00FF 100%);
            border-radius: 2px;
          }

          .token-holdings {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .token-card {
            background: #0A0A0F;
            border: 2px solid rgba(155,0,255,0.3);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.3s ease;
          }

          .token-card:hover {
            border-color: rgba(0,228,255,0.6);
            transform: translateX(4px);
          }

          .token-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .token-symbol {
            font-size: 16px;
            font-weight: 700;
            color: #FFFFFF;
          }

          .token-amount {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
          }

          .token-value {
            font-size: 14px;
            color: #00E4FF;
          }

          .token-pnl {
            font-size: 12px;
            font-weight: 600;
          }

          .token-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }

          .token-action-btn {
            flex: 1;
            padding: 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
          }

          .token-action-btn.buy {
            background: rgba(0,255,85,0.2);
            color: #00FF55;
            border: 1px solid #00FF55;
          }

          .token-action-btn.buy:hover {
            background: rgba(0,255,85,0.3);
          }

          .token-action-btn.sell {
            background: rgba(255,62,191,0.2);
            color: #FF3EBF;
            border: 1px solid #FF3EBF;
          }

          .token-action-btn.sell:hover {
            background: rgba(255,62,191,0.3);
          }

          .token-action-btn.snipe {
            background: rgba(0,228,255,0.2);
            color: #00E4FF;
            border: 1px solid #00E4FF;
          }

          .token-action-btn.snipe:hover {
            background: rgba(0,228,255,0.3);
          }

          .risk-warning {
            background: rgba(255,62,191,0.1);
            border: 2px solid #FF3EBF;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: start;
            gap: 12px;
          }

          .risk-icon {
            font-size: 24px;
          }

          .risk-content {
            flex: 1;
          }

          .risk-title {
            font-size: 14px;
            font-weight: 700;
            color: #FF3EBF;
            margin-bottom: 4px;
          }

          .risk-text {
            font-size: 12px;
            color: rgba(255,255,255,0.7);
          }

          .empty-holdings {
            padding: 40px;
            text-align: center;
            color: rgba(255,255,255,0.5);
            background: #0A0A0F;
            border: 2px dashed rgba(255,255,255,0.2);
            border-radius: 12px;
          }
        `}
      </style>

      <div className="wallet-details-container">
        {/* Header */}
        <div className="details-header">
          <div className="details-title">{activeWallet.name}</div>
          <div className="details-address">{activeWallet.address}</div>
        </div>

        {/* Balance Section */}
        <div className="balance-section">
          <div className="balance-label">Total Balance</div>
          <div className="balance-value">{formatSOL(activeWallet.solBalance)}</div>
          <div className="balance-usd">{formatUSD(walletValueUSD)}</div>

          <div className="pnl-display">
            <div className="pnl-item">
              <div className="pnl-label">Unrealized PnL</div>
              <div className={`pnl-value ${activeWallet.pnl >= 0 ? 'positive' : 'negative'}`}>
                {formatUSD(activeWallet.pnl)}
              </div>
            </div>
            <div className="pnl-item">
              <div className="pnl-label">PnL %</div>
              <div className={`pnl-value ${activeWallet.pnlPercent >= 0 ? 'positive' : 'negative'}`}>
                {formatPercent(activeWallet.pnlPercent)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn buy" onClick={() => handleBuy('DEMO_TOKEN')}>
            <span>🟢</span>
            <span>BUY</span>
          </button>
          <button className="action-btn sell" onClick={() => handleSell('DEMO_TOKEN')}>
            <span>🔴</span>
            <span>SELL</span>
          </button>
          <button className="action-btn send">
            <span>📤</span>
            <span>SEND</span>
          </button>
        </div>

        {/* Token Holdings */}
        <div className="section">
          <div className="section-title">Token Holdings</div>
          <div className="token-holdings">
            {activeWallet.history.length === 0 ? (
              <div className="empty-holdings">
                No token holdings yet. Start trading to build your portfolio!
              </div>
            ) : (
              activeWallet.history.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="token-card">
                  <div className="token-header">
                    <div>
                      <div className="token-symbol">{entry.tokenSymbol}</div>
                      <div className="token-amount">{entry.amount.toFixed(4)} tokens</div>
                    </div>
                    <div>
                      <div className="token-value">{formatUSD(entry.price)}</div>
                    </div>
                  </div>
                  <div className="token-actions">
                    <button className="token-action-btn buy" onClick={() => handleBuy(entry.tokenMint)}>
                      Buy More
                    </button>
                    <button className="token-action-btn sell" onClick={() => handleSell(entry.tokenMint)}>
                      Sell
                    </button>
                    <button className="token-action-btn snipe" onClick={() => handleSnipe(entry.tokenMint)}>
                      ⚡ Snipe
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LP Risk Warning */}
        {activeWallet.history.length > 0 && (
          <div className="section">
            <div className="risk-warning">
              <div className="risk-icon">⚠️</div>
              <div className="risk-content">
                <div className="risk-title">Liquidity Risk Check</div>
                <div className="risk-text">
                  Always verify liquidity pool locks before trading. Use the Rug Check tool to scan for risks.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="section">
          <div className="section-title">Recent Activity</div>
          <WalletActivityFeed walletId={activeWallet.id} />
        </div>
      </div>
    </>
  );
};

export default WalletDetailsPanel;
