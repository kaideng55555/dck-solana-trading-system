/**
 * usePortfolioData Hook
 * 
 * Fetches live portfolio data:
 * - SPL token balances from wallet
 * - Live token prices from global store
 * - Auto-updates every 3 seconds
 * 
 * Returns:
 * - positions: Current positions with live PnL
 * - summary: Portfolio totals
 * - loading: Loading state
 * - refresh: Manual refresh function
 */

import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { usePortfolioStore } from './portfolioStore';
import { useGlobalTokenData } from '../data/useGlobalTokenData';

export function usePortfolioData() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  const { positions, summary, updatePosition } = usePortfolioStore();
  const { tokens } = useGlobalTokenData();

  /**
   * Fetch SPL token balances and update positions
   */
  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      console.log('No wallet connected');
      return;
    }

    try {
      setLoading(true);

      // Get all token accounts for the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      // Process each token account
      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mint = parsedInfo.mint;
        const amount = parsedInfo.tokenAmount.uiAmount;

        // Skip if no balance
        if (!amount || amount <= 0) continue;

        // Find token info from global store
        const tokenInfo = tokens.find((t: any) => t.mint === mint);
        
        if (tokenInfo) {
          const price = tokenInfo.market?.price || 0;
          const symbol = tokenInfo.metadata?.symbol || 'UNKNOWN';
          const logo = tokenInfo.metadata?.image;

          // Update position (preserves entry price)
          updatePosition(mint, amount, price, symbol, logo);
        }
      }
    } catch (error) {
      console.error('Failed to fetch portfolio balances:', error);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, tokens, updatePosition]);

  /**
   * Update prices for existing positions
   */
  const updatePrices = useCallback(() => {
    Object.values(positions).forEach((position) => {
      const tokenInfo = tokens.find((t: any) => t.mint === position.mint);
      
      if (tokenInfo) {
        const price = tokenInfo.market?.price || 0;
        
        // Update position with new price (preserves entry price and amount)
        updatePosition(
          position.mint,
          position.amount,
          price,
          position.symbol,
          position.logo,
          position.entryPrice
        );
      }
    });
  }, [positions, tokens, updatePosition]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Initial fetch
  useEffect(() => {
    if (publicKey) {
      fetchBalances();
    }
  }, [publicKey, fetchBalances]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!publicKey) return;

    const interval = setInterval(() => {
      // Only update prices, not full balance refresh (to avoid rate limits)
      updatePrices();
    }, 3000);

    return () => clearInterval(interval);
  }, [publicKey, updatePrices]);

  return {
    positions: Object.values(positions),
    summary,
    loading,
    refresh,
  };
}

export default usePortfolioData;
