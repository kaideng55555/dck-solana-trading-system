/**
 * Portfolio Engine (D12)
 * 
 * Aggregates balances from all wallets and computes portfolio metrics
 * Features:
 * - Total SOL/USD value across all wallets
 * - Per-wallet and per-token PnL calculations
 * - 24h PnL tracking
 * - Token distribution data
 * - Real-time updates from wallet store + token store
 */

import { useEffect, useState, useMemo } from 'react';
import { useWalletStore } from '../walletTerminal/walletStore';
import { useGlobalTokenData } from '../data/useGlobalTokenData';
import type { Wallet } from '../walletTerminal/walletTypes';
import type { Token } from '../data/tokenTypes';

// =============================================
// TYPES
// =============================================

export interface TokenHolding {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  valueSOL: number;
  percentOfPortfolio: number;
  pnl24h: number;
  pnl24hPercent: number;
  pnlAllTime: number;
  pnlAllTimePercent: number;
  wallets: string[]; // Wallet IDs holding this token
}

export interface WalletSummary {
  walletId: string;
  walletName: string;
  solBalance: number;
  usdValue: number;
  tokenCount: number;
  pnl24h: number;
  pnlAllTime: number;
}

export interface DistributionDataPoint {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface PortfolioData {
  totalValueUSD: number;
  totalValueSOL: number;
  walletSummaries: WalletSummary[];
  tokenHoldings: TokenHolding[];
  pnl24h: number;
  pnl24hPercent: number;
  pnlAllTime: number;
  pnlAllTimePercent: number;
  distributionData: DistributionDataPoint[];
  lastUpdated: number;
}

// =============================================
// PORTFOLIO ENGINE HOOK
// =============================================

export const usePortfolioEngine = (): PortfolioData & { loading: boolean } => {
  const wallets = useWalletStore((state) => Object.values(state.wallets));
  const { tokens: globalTokens } = useGlobalTokenData();
  const [loading, setLoading] = useState(true);

  // Mock SOL price (in production, fetch from price feed)
  const SOL_PRICE_USD = 180.50;

  useEffect(() => {
    if (wallets.length > 0) {
      setLoading(false);
    }
  }, [wallets.length]);

  const portfolioData = useMemo<PortfolioData>(() => {
    // =============================================
    // 1. AGGREGATE WALLET SUMMARIES
    // =============================================
    const walletSummaries: WalletSummary[] = wallets.map((wallet) => {
      const solBalance = wallet.solBalance;
      const usdValue = solBalance * SOL_PRICE_USD;
      
      // Count unique tokens from history
      const uniqueTokens = new Set(wallet.history.map((h) => h.tokenMint));
      const tokenCount = uniqueTokens.size;

      return {
        walletId: wallet.id,
        walletName: wallet.name,
        solBalance,
        usdValue,
        tokenCount,
        pnl24h: wallet.pnl * 0.3, // Mock 30% of total PnL as 24h
        pnlAllTime: wallet.pnl,
      };
    });

    // =============================================
    // 2. AGGREGATE TOKEN HOLDINGS
    // =============================================
    const tokenMap = new Map<string, TokenHolding>();

    wallets.forEach((wallet) => {
      wallet.history.forEach((entry) => {
        const existing = tokenMap.get(entry.tokenMint);
        
        // Find token price from global store
        const tokenData = globalTokens.find((t) => t.mint === entry.tokenMint);
        const currentPrice = tokenData?.market?.price || entry.price;
        const valueUSD = entry.amount * currentPrice;
        const valueSOL = valueUSD / SOL_PRICE_USD;

        // Calculate PnL
        const costBasis = entry.amount * entry.price;
        const pnlAllTime = valueUSD - costBasis;
        const pnlAllTimePercent = costBasis > 0 ? (pnlAllTime / costBasis) * 100 : 0;
        const pnl24h = pnlAllTime * 0.4; // Mock 40% of total as 24h
        const pnl24hPercent = pnlAllTimePercent * 0.4;

        if (existing) {
          // Aggregate existing holding
          existing.balance += entry.amount;
          existing.valueUSD += valueUSD;
          existing.valueSOL += valueSOL;
          existing.pnl24h += pnl24h;
          existing.pnlAllTime += pnlAllTime;
          if (!existing.wallets.includes(wallet.id)) {
            existing.wallets.push(wallet.id);
          }
        } else {
          // New holding
          tokenMap.set(entry.tokenMint, {
            mint: entry.tokenMint,
            symbol: entry.tokenSymbol,
            name: entry.tokenSymbol, // Use symbol as name if not available
            balance: entry.amount,
            valueUSD,
            valueSOL,
            percentOfPortfolio: 0, // Calculate later
            pnl24h,
            pnl24hPercent,
            pnlAllTime,
            pnlAllTimePercent,
            wallets: [wallet.id],
          });
        }
      });
    });

    const tokenHoldings = Array.from(tokenMap.values());

    // =============================================
    // 3. CALCULATE TOTALS
    // =============================================
    const totalValueSOL = walletSummaries.reduce((sum, w) => sum + w.solBalance, 0);
    const totalValueUSD = totalValueSOL * SOL_PRICE_USD;
    const pnl24h = walletSummaries.reduce((sum, w) => sum + w.pnl24h, 0);
    const pnlAllTime = walletSummaries.reduce((sum, w) => sum + w.pnlAllTime, 0);
    
    // Calculate percentages
    const totalInvested = totalValueUSD - pnlAllTime;
    const pnl24hPercent = totalInvested > 0 ? (pnl24h / totalInvested) * 100 : 0;
    const pnlAllTimePercent = totalInvested > 0 ? (pnlAllTime / totalInvested) * 100 : 0;

    // =============================================
    // 4. CALCULATE TOKEN PERCENTAGES
    // =============================================
    tokenHoldings.forEach((token) => {
      token.percentOfPortfolio = totalValueUSD > 0 
        ? (token.valueUSD / totalValueUSD) * 100 
        : 0;
    });

    // Sort by value descending
    tokenHoldings.sort((a, b) => b.valueUSD - a.valueUSD);

    // =============================================
    // 5. GENERATE DISTRIBUTION DATA
    // =============================================
    const neonColors = [
      '#FF3EBF', // Pink
      '#9B00FF', // Purple
      '#00E4FF', // Cyan
      '#00FF55', // Green
      '#FF7A00', // Orange
      '#FFAA00', // Yellow
      '#FF00AA', // Magenta
      '#00AAFF', // Blue
    ];

    const distributionData: DistributionDataPoint[] = tokenHoldings
      .slice(0, 8) // Top 8 tokens
      .map((token, idx) => ({
        name: token.symbol,
        value: token.valueUSD,
        percent: token.percentOfPortfolio,
        color: neonColors[idx % neonColors.length],
      }));

    // Add "Others" if more than 8 tokens
    if (tokenHoldings.length > 8) {
      const othersValue = tokenHoldings
        .slice(8)
        .reduce((sum, t) => sum + t.valueUSD, 0);
      const othersPercent = totalValueUSD > 0 ? (othersValue / totalValueUSD) * 100 : 0;
      
      distributionData.push({
        name: 'Others',
        value: othersValue,
        percent: othersPercent,
        color: 'rgba(255,255,255,0.3)',
      });
    }

    return {
      totalValueUSD,
      totalValueSOL,
      walletSummaries,
      tokenHoldings,
      pnl24h,
      pnl24hPercent,
      pnlAllTime,
      pnlAllTimePercent,
      distributionData,
      lastUpdated: Date.now(),
    };
  }, [wallets, globalTokens, SOL_PRICE_USD]);

  return {
    ...portfolioData,
    loading,
  };
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const formatUSD = (value: number): string => {
  return `$${value.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const formatSOL = (value: number): string => {
  return `${value.toFixed(4)} SOL`;
};

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(2);
};
