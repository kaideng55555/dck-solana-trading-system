/**
 * Multi-Wallet Engine Hook (D11)
 * 
 * React hook for multi-wallet data management
 * Features:
 * - Fetch SOL/SPL token balances per wallet
 * - Update prices via global token store
 * - Compute PnL (unrealized, realized, daily, weekly, total)
 * - Auto-sync every 3 seconds
 * - Expose wallet store actions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWalletStore } from './walletStore';
import { useGlobalTokenData } from '../data/useGlobalTokenData';
import type { Wallet, WalletSummary } from './walletTypes';

// =============================================
// CONSTANTS
// =============================================

const SYNC_INTERVAL = 3000; // 3 seconds
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// =============================================
// HOOK
// =============================================

export function useMultiWalletEngine() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<WalletSummary>({
    totalBalance: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    pnl1h: 0,
    pnl24h: 0,
    pnl7d: 0,
    bestWalletId: null,
    lastSnipe: null,
    totalTrades: 0,
    successRate: 0,
  });

  const walletStore = useWalletStore();
  const { tokens } = useGlobalTokenData();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionRef = useRef<Connection | null>(null);

  // Get Solana connection
  useEffect(() => {
    const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com';
    connectionRef.current = new Connection(rpcUrl, 'confirmed');
  }, []);

  /**
   * Fetch SOL balance for a wallet
   */
  const fetchSolBalance = useCallback(async (address: string): Promise<number> => {
    if (!connectionRef.current) return 0;

    try {
      const publicKey = new PublicKey(address);
      const balance = await connectionRef.current.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error(`Failed to fetch SOL balance for ${address}:`, error);
      return 0;
    }
  }, []);

  /**
   * Fetch SPL token balances for a wallet
   */
  const fetchTokenBalances = useCallback(
    async (address: string): Promise<{ mint: string; amount: number; usdValue: number }[]> => {
      if (!connectionRef.current) return [];

      try {
        const publicKey = new PublicKey(address);
        const tokenAccounts = await connectionRef.current.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );

        const balances = tokenAccounts.value
          .map((account) => {
            const parsedInfo = account.account.data.parsed.info;
            const mint = parsedInfo.mint;
            const amount = parsedInfo.tokenAmount.uiAmount || 0;

            // Find token price from global store
            const token = tokens.find((t) => t.mint === mint);
            const price = token?.market?.price || 0;
            const usdValue = amount * price;

            return { mint, amount, usdValue };
          })
          .filter((b) => b.amount > 0);

        return balances;
      } catch (error) {
        console.error(`Failed to fetch token balances for ${address}:`, error);
        return [];
      }
    },
    [tokens]
  );

  /**
   * Calculate PnL for a wallet
   */
  const calculateWalletPnL = useCallback((wallet: Wallet): { pnl: number; pnlPercent: number } => {
    let totalCost = 0;
    let totalValue = 0;

    // Calculate from history
    wallet.history.forEach((entry) => {
      if (entry.action === 'BUY' || entry.action === 'SNIPE' || entry.action === 'AUTO_BUY') {
        totalCost += entry.amount * entry.price;
      } else if (entry.action === 'SELL' || entry.action === 'AUTO_SELL') {
        totalValue += entry.amount * entry.price;
      }
    });

    // Current holdings value
    totalValue += wallet.usdBalance;

    const pnl = totalValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

    return { pnl, pnlPercent };
  }, []);

  /**
   * Update all wallet balances and PnL
   */
  const refreshWallets = useCallback(async () => {
    setLoading(true);

    try {
      const wallets = walletStore.getAllWallets();

      for (const wallet of wallets) {
        // Fetch SOL balance
        const solBalance = await fetchSolBalance(wallet.address);

        // Fetch token balances
        const tokenBalances = await fetchTokenBalances(wallet.address);

        // Calculate total USD value
        const solPrice = tokens.find((t) => t.mint === SOL_MINT)?.market?.price || 0;
        const solUsdValue = solBalance * solPrice;
        const tokenUsdValue = tokenBalances.reduce((sum, b) => sum + b.usdValue, 0);
        const totalUsdBalance = solUsdValue + tokenUsdValue;

        // Update balance
        walletStore.updateBalance(wallet.id, solBalance, totalUsdBalance);

        // Calculate and update PnL
        const { pnl, pnlPercent } = calculateWalletPnL(wallet);
        walletStore.updatePnL(wallet.id, pnl, pnlPercent);
      }
    } catch (error) {
      console.error('Failed to refresh wallets:', error);
    } finally {
      setLoading(false);
    }
  }, [walletStore, fetchSolBalance, fetchTokenBalances, tokens, calculateWalletPnL]);

  /**
   * Calculate summary statistics
   */
  const calculateSummary = useCallback(() => {
    const wallets = walletStore.getAllWallets();

    const totalBalance = wallets.reduce((sum, w) => sum + w.usdBalance, 0);
    const totalPnl = wallets.reduce((sum, w) => sum + w.pnl, 0);
    const totalPnlPercent = totalBalance > 0 ? (totalPnl / totalBalance) * 100 : 0;

    // Find best wallet
    const bestWallet = wallets.reduce((best, w) =>
      w.pnlPercent > (best?.pnlPercent || -Infinity) ? w : best
    , null as Wallet | null);

    // Find last snipe
    let lastSnipe = null;
    let lastSnipeTime = 0;
    wallets.forEach((wallet) => {
      const snipeEntry = wallet.history.find(
        (e) => (e.action === 'SNIPE' || e.sniperType) && e.timestamp > lastSnipeTime
      );
      if (snipeEntry && snipeEntry.timestamp > lastSnipeTime) {
        lastSnipe = snipeEntry;
        lastSnipeTime = snipeEntry.timestamp;
      }
    });

    // Calculate total trades and success rate
    const allHistory = wallets.flatMap((w) => w.history);
    const totalTrades = allHistory.length;
    const successfulTrades = allHistory.filter(
      (e) => (e.action === 'SELL' || e.action === 'AUTO_SELL') && (e.pnl || 0) > 0
    ).length;
    const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;

    // TODO: Calculate 1h, 24h, 7d PnL from history timestamps
    const pnl1h = 0;
    const pnl24h = 0;
    const pnl7d = 0;

    setSummary({
      totalBalance,
      totalPnl,
      totalPnlPercent,
      pnl1h,
      pnl24h,
      pnl7d,
      bestWalletId: bestWallet?.id || null,
      lastSnipe,
      totalTrades,
      successRate,
    });
  }, [walletStore]);

  /**
   * Auto-sync every 3 seconds
   */
  useEffect(() => {
    // Initial refresh
    refreshWallets();
    calculateSummary();

    // Set up interval
    intervalRef.current = setInterval(() => {
      refreshWallets();
      calculateSummary();
    }, SYNC_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshWallets, calculateSummary]);

  /**
   * Recalculate summary when wallets change
   */
  useEffect(() => {
    calculateSummary();
  }, [walletStore.wallets, calculateSummary]);

  return {
    // State
    wallets: walletStore.getAllWallets(),
    groups: Object.values(walletStore.walletGroups),
    activeWallet: walletStore.activeWalletId
      ? walletStore.getWallet(walletStore.activeWalletId)
      : null,
    summary,
    loading,
    timelineOpen: walletStore.timelineOpen,
    sniperFeedVisible: walletStore.sniperFeedVisible,

    // Actions
    refresh: refreshWallets,
    addWallet: walletStore.addWallet,
    removeWallet: walletStore.removeWallet,
    renameWallet: walletStore.renameWallet,
    addGroup: walletStore.addGroup,
    renameGroup: walletStore.renameGroup,
    deleteGroup: walletStore.deleteGroup,
    setActiveWallet: walletStore.setActiveWallet,
    toggleTimeline: walletStore.toggleTimeline,
    toggleSniperFeed: walletStore.toggleSniperFeed,
    updateBalance: walletStore.updateBalance,
    updatePnL: walletStore.updatePnL,
    addHistory: walletStore.addHistory,
    getGroupWallets: walletStore.getGroupWallets,
    getWallet: walletStore.getWallet,
    getAllWallets: walletStore.getAllWallets,
    importWalletFromPrivateKey: walletStore.importWalletFromPrivateKey,
    importWalletFromSeed: walletStore.importWalletFromSeed,
  };
}

export default useMultiWalletEngine;
