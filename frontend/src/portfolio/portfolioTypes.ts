/**
 * Portfolio Types
 * 
 * Type definitions for portfolio tracking and PnL calculation
 */

/**
 * Individual token position
 */
export interface Position {
  mint: string;              // Token mint address
  symbol: string;            // Token symbol
  logo?: string;             // Token logo URL

  amount: number;            // Token amount user holds
  value: number;             // Current USD value
  entryPrice: number;        // USD entry price
  costBasis: number;         // entryPrice * amount
  pnl: number;               // value - costBasis
  pnlPercent: number;        // (pnl / costBasis) * 100

  lastUpdated: number;       // Unix timestamp
}

/**
 * Portfolio summary totals
 */
export interface PortfolioSummary {
  totalValue: number;        // Sum of all position values
  totalCost: number;         // Sum of all cost bases
  totalPnl: number;          // totalValue - totalCost
  pnlPercent: number;        // (totalPnl / totalCost) * 100
}

/**
 * Complete portfolio state
 */
export interface PortfolioState {
  positions: Record<string, Position>;  // Positions by token mint
  summary: PortfolioSummary;
}
