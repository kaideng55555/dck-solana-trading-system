/**
 * Portfolio Store
 * 
 * Zustand store for portfolio management
 * Features:
 * - Store positions by token mint
 * - Auto-calculate PnL and cost basis
 * - Recalculate portfolio summary
 */

import { create } from 'zustand';
import { Position, PortfolioSummary, PortfolioState } from './portfolioTypes';

interface PortfolioStore extends PortfolioState {
  // Actions
  updatePosition: (mint: string, amount: number, price: number, symbol: string, logo?: string, entryPrice?: number) => void;
  removePosition: (mint: string) => void;
  clearPortfolio: () => void;
  recalcSummary: () => void;
}

/**
 * Calculate portfolio summary from positions
 */
function calculateSummary(positions: Record<string, Position>): PortfolioSummary {
  const positionsList = Object.values(positions);
  
  const totalValue = positionsList.reduce((sum, pos) => sum + pos.value, 0);
  const totalCost = positionsList.reduce((sum, pos) => sum + pos.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalPnl,
    pnlPercent,
  };
}

/**
 * Portfolio Store
 */
export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  // Initial state
  positions: {},
  summary: {
    totalValue: 0,
    totalCost: 0,
    totalPnl: 0,
    pnlPercent: 0,
  },

  // Update or create a position
  updatePosition: (mint, amount, price, symbol, logo, entryPrice) => {
    const currentPositions = get().positions;
    const existingPosition = currentPositions[mint];

    // Use existing entry price if available, otherwise use current price
    const finalEntryPrice = entryPrice ?? existingPosition?.entryPrice ?? price;

    // Calculate metrics
    const costBasis = finalEntryPrice * amount;
    const value = price * amount;
    const pnl = value - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    const position: Position = {
      mint,
      symbol,
      logo,
      amount,
      value,
      entryPrice: finalEntryPrice,
      costBasis,
      pnl,
      pnlPercent,
      lastUpdated: Date.now(),
    };

    set({
      positions: {
        ...currentPositions,
        [mint]: position,
      },
    });

    // Recalculate summary
    get().recalcSummary();
  },

  // Remove a position
  removePosition: (mint) => {
    const currentPositions = get().positions;
    const { [mint]: removed, ...remaining } = currentPositions;

    set({ positions: remaining });

    // Recalculate summary
    get().recalcSummary();
  },

  // Clear all positions
  clearPortfolio: () => {
    set({
      positions: {},
      summary: {
        totalValue: 0,
        totalCost: 0,
        totalPnl: 0,
        pnlPercent: 0,
      },
    });
  },

  // Recalculate portfolio summary
  recalcSummary: () => {
    const positions = get().positions;
    const summary = calculateSummary(positions);
    set({ summary });
  },
}));
