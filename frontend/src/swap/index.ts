/**
 * Swap Engine - Main Export
 * 
 * Jupiter + Jito swap infrastructure for DCK Tools
 */

// Types
export type {
  SwapRequest,
  SwapResult,
  SwapFees,
  SwapError,
  RouteInfo,
  RouteRequest,
  RouteResponse,
  MarketInfo,
  JitoTipConfig,
  JitoBundleResult,
  WalletAdapter,
} from './swapTypes';

export {
  SwapErrorCode,
  TOKEN_MINTS,
  DEFAULT_SLIPPAGE,
  DEFAULT_PRIORITY_FEE,
  DEFAULT_JITO_TIP,
} from './swapTypes';

// Jupiter Client
export {
  JupiterClient,
  createJupiterClient,
  calculateMinimumOutput,
  formatRoute,
  validateRouteRequest,
} from './jupiterClient';

// Jito Client
export {
  JitoClient,
  createJitoClient,
  validateTipAmount,
  getTipAccount,
  formatTipAmount,
  solToLamports,
} from './jitoClient';

// React Hooks
export { useSwapEngine, useSwapEstimate } from './useSwapEngine';
