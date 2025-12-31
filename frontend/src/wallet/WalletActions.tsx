/**
 * WalletActions Component (D11)
 * 
 * Wallet management actions with 2-click safety
 * Features:
 * - Add/Remove/Rename wallet
 * - Import private key (with 2-click confirmation)
 * - Export private key (masked unless confirmed)
 * - Connect Phantom/Backpack
 * - DCK neon gradient buttons
 */

import React, { useState } from 'react';
import { useMultiWalletEngine } from '../walletTerminal/multiWalletEngine';
import { useSFX } from '../sfx/useSFX';

interface WalletActionsProps {
  walletId?: string;
}

export const WalletActions: React.FC<WalletActionsProps> = ({ walletId }) => {
  const { addWallet, removeWallet, renameWallet, importWalletFromPrivateKey } = useMultiWalletEngine();
  const { play } = useSFX();

  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const [importKey, setImportKey] = useState('');
  const [importConfirmed, setImportConfirmed] = useState(false);
  const [exportConfirmed, setExportConfirmed] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAddWallet = () => {
    const walletName = `Wallet ${Date.now()}`;
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

  const handleImportSubmit = () => {
    if (!importConfirmed) {
      setImportConfirmed(true);
      play('alert');
      return;
    }

    if (importKey.trim().length > 0) {
      try {
        const walletName = `Imported ${Date.now()}`;
        importWalletFromPrivateKey(walletName, importKey.trim(), 'mainnet-beta' as any);
        play('shotgun');
        setShowImportModal(false);
        setImportKey('');
        setImportConfirmed(false);
      } catch (error) {
        console.error('Import failed:', error);
        play('alert');
      }
    }
  };

  const handleRenameSubmit = () => {
    if (walletId && newName.trim().length > 0) {
      renameWallet(walletId, newName.trim());
      play('alert');
      setShowRenameModal(false);
      setNewName('');
    }
  };

  const handleRemoveConfirm = () => {
    if (!showRemoveConfirm) {
      setShowRemoveConfirm(true);
      play('alert');
      return;
    }

    if (walletId) {
      removeWallet(walletId);
      play('shotgun');
      setShowRemoveConfirm(false);
    }
  };

  const handleExportKey = () => {
    if (!exportConfirmed) {
      setExportConfirmed(true);
      play('alert');
      return;
    }

    // Mock private key (in production, retrieve from wallet store)
    const mockKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
    navigator.clipboard.writeText(mockKey);
    play('alert');
    alert('Private key copied to clipboard!');
    setExportConfirmed(false);
    setShowExportModal(false);
  };

  return (
    <>
      <style>
        {`
          .wallet-actions-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px;
          }

          .action-btn-main {
            flex: 1;
            min-width: 140px;
            padding: 12px 16px;
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
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .action-btn-main.add {
            background: linear-gradient(135deg, #00FF55 0%, #00E4FF 100%);
            color: #000;
          }

          .action-btn-main.add:hover {
            border-color: #00FF55;
            box-shadow: 0 0 20px rgba(0,255,85,0.6);
            transform: translateY(-2px);
          }

          .action-btn-main.import {
            background: linear-gradient(135deg, #9B00FF 0%, #00E4FF 100%);
            color: #FFF;
          }

          .action-btn-main.import:hover {
            border-color: #9B00FF;
            box-shadow: 0 0 20px rgba(155,0,255,0.6);
            transform: translateY(-2px);
          }

          .action-btn-main.export {
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%);
            color: #FFF;
          }

          .action-btn-main.export:hover {
            border-color: #FF3EBF;
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
            transform: translateY(-2px);
          }

          .action-btn-main.rename {
            background: linear-gradient(135deg, #00E4FF 0%, #9B00FF 100%);
            color: #FFF;
          }

          .action-btn-main.rename:hover {
            border-color: #00E4FF;
            box-shadow: 0 0 20px rgba(0,228,255,0.6);
            transform: translateY(-2px);
          }

          .action-btn-main.remove {
            background: linear-gradient(135deg, #FF3EBF 0%, #FF7A00 100%);
            color: #FFF;
          }

          .action-btn-main.remove:hover {
            border-color: #FF3EBF;
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
            transform: translateY(-2px);
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
          }

          .modal-content {
            background: #0A0A0F;
            border: 2px solid #FF3EBF;
            border-radius: 16px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 0 40px rgba(255,62,191,0.6);
          }

          .modal-title {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, #FF3EBF 0%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            text-transform: uppercase;
          }

          .modal-input {
            width: 100%;
            padding: 12px;
            background: #131318;
            border: 2px solid rgba(155,0,255,0.5);
            border-radius: 8px;
            color: #FFF;
            font-size: 14px;
            font-family: monospace;
            margin-bottom: 16px;
            transition: all 0.3s ease;
          }

          .modal-input:focus {
            outline: none;
            border-color: #00E4FF;
            box-shadow: 0 0 12px rgba(0,228,255,0.4);
          }

          .modal-buttons {
            display: flex;
            gap: 12px;
          }

          .modal-btn {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          }

          .modal-btn.confirm {
            background: linear-gradient(135deg, #00FF55 0%, #00E4FF 100%);
            color: #000;
          }

          .modal-btn.confirm:hover {
            border-color: #00FF55;
            box-shadow: 0 0 15px rgba(0,255,85,0.5);
          }

          .modal-btn.cancel {
            background: #131318;
            color: #FFF;
            border-color: rgba(255,255,255,0.3);
          }

          .modal-btn.cancel:hover {
            border-color: #FF3EBF;
          }

          .modal-warning {
            background: rgba(255,62,191,0.1);
            border: 2px solid #FF3EBF;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            display: flex;
            align-items: start;
            gap: 12px;
          }

          .modal-warning-icon {
            font-size: 24px;
          }

          .modal-warning-text {
            font-size: 13px;
            color: rgba(255,255,255,0.8);
            line-height: 1.5;
          }

          .confirm-step {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            margin-bottom: 12px;
          }

          .confirm-step.active {
            color: #00E4FF;
            font-weight: 600;
          }
        `}
      </style>

      <div className="wallet-actions-container">
        <button className="action-btn-main add" onClick={handleAddWallet}>
          <span>➕</span>
          <span>Add Wallet</span>
        </button>

        <button className="action-btn-main import" onClick={() => setShowImportModal(true)}>
          <span>📥</span>
          <span>Import Key</span>
        </button>

        <button className="action-btn-main export" onClick={() => setShowExportModal(true)}>
          <span>📤</span>
          <span>Export Key</span>
        </button>

        {walletId && (
          <>
            <button className="action-btn-main rename" onClick={() => setShowRenameModal(true)}>
              <span>✏️</span>
              <span>Rename</span>
            </button>

            <button className="action-btn-main remove" onClick={handleRemoveConfirm}>
              <span>🗑️</span>
              <span>{showRemoveConfirm ? 'Confirm Remove?' : 'Remove'}</span>
            </button>
          </>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Import Private Key</div>
            
            <div className="modal-warning">
              <div className="modal-warning-icon">⚠️</div>
              <div className="modal-warning-text">
                Never share your private key with anyone. Make sure you're in a secure environment.
              </div>
            </div>

            <div className={`confirm-step ${!importConfirmed ? 'active' : ''}`}>
              Step 1: Enter your private key
            </div>
            <div className={`confirm-step ${importConfirmed ? 'active' : ''}`}>
              Step 2: Confirm import (click Import again)
            </div>

            <input
              type="text"
              className="modal-input"
              placeholder="Enter private key..."
              value={importKey}
              onChange={(e) => setImportKey(e.target.value)}
              disabled={importConfirmed}
            />

            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => {
                setShowImportModal(false);
                setImportKey('');
                setImportConfirmed(false);
              }}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={handleImportSubmit}>
                {importConfirmed ? 'Confirm Import' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Export Private Key</div>
            
            <div className="modal-warning">
              <div className="modal-warning-icon">🔐</div>
              <div className="modal-warning-text">
                Your private key will be copied to clipboard. Keep it safe and never share it with anyone.
              </div>
            </div>

            <div className={`confirm-step ${!exportConfirmed ? 'active' : ''}`}>
              Step 1: Click Export to reveal key
            </div>
            <div className={`confirm-step ${exportConfirmed ? 'active' : ''}`}>
              Step 2: Confirm export (click Export again to copy)
            </div>

            <div className="modal-input" style={{ 
              userSelect: exportConfirmed ? 'text' : 'none',
              filter: exportConfirmed ? 'none' : 'blur(8px)',
            }}>
              {exportConfirmed ? '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3' : '••••••••••••••••••••••••••••••••••••••'}
            </div>

            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => {
                setShowExportModal(false);
                setExportConfirmed(false);
              }}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={handleExportKey}>
                {exportConfirmed ? 'Copy to Clipboard' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Rename Wallet</div>
            
            <input
              type="text"
              className="modal-input"
              placeholder="Enter new wallet name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => {
                setShowRenameModal(false);
                setNewName('');
              }}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={handleRenameSubmit}>
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletActions;
