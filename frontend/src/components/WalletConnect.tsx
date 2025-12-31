/**
 * WalletConnect - Solana wallet connection component
 * Supports Phantom, Backpack, Solflare, and other wallets
 * Responsive: Simple button on mobile, full panel on desktop
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface WalletConnectProps {
  variant?: 'mobile' | 'desktop';
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = memo(({
  variant = 'desktop',
  onConnect,
  onDisconnect,
}) => {
  const { publicKey, wallet, connect, disconnect, connecting, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalance = async () => {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(null);
        }
      };
      
      fetchBalance();
      
      // Refresh balance every 10 seconds
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  const handleConnect = useCallback(async () => {
    try {
      await connect();
      if (onConnect) onConnect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connect, onConnect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setShowWalletMenu(false);
      if (onDisconnect) onDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [disconnect, onDisconnect]);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (bal: number | null): string => {
    if (bal === null) return '-.-- SOL';
    return `${bal.toFixed(4)} SOL`;
  };

  // Mobile variant - simple button
  if (variant === 'mobile') {
    if (!connected) {
      return (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-pink-500/30 transition-all disabled:opacity-50"
          style={{
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
            textShadow: '0 0 10px rgba(0, 245, 255, 0.6)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg">💎</span>
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </span>
        </button>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={() => setShowWalletMenu(!showWalletMenu)}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 rounded-lg text-green-400 font-medium hover:from-green-500/30 hover:to-cyan-500/30 transition-all"
          style={{
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
            textShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span>{formatAddress(publicKey!.toString())}</span>
            </span>
            <span className="text-xs opacity-80">{formatBalance(balance)}</span>
          </div>
        </button>

        {/* Mobile Dropdown Menu */}
        {showWalletMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-lg z-50">
            <div className="p-4 space-y-3">
              <div className="text-xs text-gray-400">
                <div className="mb-1">Wallet</div>
                <div className="text-cyan-400 font-mono break-all">
                  {publicKey?.toString()}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                <div className="mb-1">Balance</div>
                <div className="text-green-400 font-bold text-lg">
                  {formatBalance(balance)}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full px-3 py-2 bg-red-500/20 border border-red-500/40 rounded text-red-400 hover:bg-red-500/30 transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop variant - full panel
  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="px-4 py-2.5 rounded-lg font-medium transition-all bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/50 text-cyan-400 hover:from-cyan-500/30 hover:to-pink-500/30 disabled:opacity-50"
        style={{
          boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
          textShadow: '0 0 10px rgba(0, 245, 255, 0.6)',
        }}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">💎</span>
          <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletMenu(!showWalletMenu)}
        className="px-4 py-2.5 rounded-lg font-medium transition-all bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 text-green-400 hover:from-green-500/30 hover:to-cyan-500/30"
        style={{
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
          textShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
        }}
      >
        <span className="flex items-center gap-3">
          <span className="text-lg">✅</span>
          <div className="text-left">
            <div className="text-sm font-bold">{formatAddress(publicKey!.toString())}</div>
            <div className="text-xs opacity-80">{formatBalance(balance)}</div>
          </div>
        </span>
      </button>

      {/* Desktop Dropdown Menu */}
      {showWalletMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowWalletMenu(false)}
          />
          
          <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-xl z-50"
            style={{
              boxShadow: '0 0 30px rgba(0, 245, 255, 0.2)',
            }}
          >
            <div className="p-4 space-y-4">
              {/* Wallet Info */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Connected Wallet</div>
                <div className="flex items-center gap-2">
                  {wallet?.adapter.icon && (
                    <img 
                      src={wallet.adapter.icon} 
                      alt={wallet.adapter.name}
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <span className="text-cyan-400 font-medium">{wallet?.adapter.name}</span>
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Address</div>
                <div className="px-3 py-2 bg-gray-800/50 rounded border border-cyan-500/20 font-mono text-xs text-cyan-300 break-all">
                  {publicKey?.toString()}
                </div>
              </div>

              {/* Balance */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Balance</div>
                <div className="px-3 py-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">
                    {formatBalance(balance)}
                  </div>
                  {balance !== null && (
                    <div className="text-xs text-gray-400 mt-1">
                      {(balance * 100).toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-cyan-500/20">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicKey!.toString());
                    setShowWalletMenu(false);
                  }}
                  className="w-full px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm"
                >
                  📋 Copy Address
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 transition-all text-sm"
                >
                  🔌 Disconnect
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

WalletConnect.displayName = 'WalletConnect';

export default WalletConnect;
