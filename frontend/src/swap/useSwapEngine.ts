/**
 * Swap Engine Hook
 * 
 * React hook for executing token swaps with Jupiter + Jito
 */

import { useState, useCallback, useRef } from 'react';
import { Connection } from '@solana/web3.js';
import { createJupiterClient, validateRouteRequest } from './jupiterClient';
import { createJitoClient, validateTipAmount } from './jitoClient';
import type {
  SwapRequest,
  SwapResult,
  SwapError,
  SwapErrorCode,
  WalletAdapter,
  RouteInfo,
} from './swapTypes';

// =============================================
// HOOK CONFIGURATION
// =============================================

interface SwapEngineConfig {
  /** Solana RPC connection */
  connection: Connection;
  
  /** Connected wallet adapter */
  wallet: WalletAdapter | null;
  
  /** Auto-fetch routes on mount */
  autoFetchRoutes?: boolean;
}

interface SwapEngineState {
  /** Current swap request */
  request: SwapRequest | null;
  
  /** Available routes */
  routes: RouteInfo[];
  
  /** Best route (first in array) */
  bestRoute: RouteInfo | null;
  
  /** Swap result */
  result: SwapResult | null;
  
  /** Error state */
  error: SwapError | null;
  
  /** Loading states */
  isLoadingRoutes: boolean;
  isExecutingSwap: boolean;
  
  /** Timestamps */
  lastRoutesFetch: number | null;
  lastSwapExecution: number | null;
}

// =============================================
// HOOK IMPLEMENTATION
// =============================================

/**
 * Swap engine hook
 * 
 * @param config - Hook configuration
 * @returns Swap engine state and actions
 * 
 * @example
 * ```tsx
 * function SwapComponent() {
 *   const { publicKey } = useWallet();
 *   const connection = new Connection(RPC_URL);
 *   
 *   const {
 *     fetchRoutes,
 *     executeSwap,
 *     bestRoute,
 *     result,
 *     error,
 *     isLoadingRoutes,
 *     isExecutingSwap,
 *   } = useSwapEngine({ connection, wallet });
 *   
 *   const handleSwap = async () => {
 *     // 1. Fetch routes
 *     await fetchRoutes({
 *       inputMint: SOL_MINT,
 *       outputMint: USDC_MINT,
 *       amountIn: 1_000_000_000, // 1 SOL
 *       slippage: 50,
 *       useJito: true,
 *     });
 *     
 *     // 2. Execute swap with best route
 *     const result = await executeSwap();
 *     console.log('Swap signature:', result.signature);
 *   };
 *   
 *   return (
 *     <button onClick={handleSwap} disabled={isLoadingRoutes || isExecutingSwap}>
 *       {isExecutingSwap ? 'Swapping...' : 'Swap'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSwapEngine(config: SwapEngineConfig) {
  const { connection, wallet } = config;

  // Initialize clients (memoized)
  const jupiterClient = useRef(createJupiterClient(connection));
  const jitoClient = useRef(createJitoClient(connection));

  // State
  const [state, setState] = useState<SwapEngineState>({
    request: null,
    routes: [],
    bestRoute: null,
    result: null,
    error: null,
    isLoadingRoutes: false,
    isExecutingSwap: false,
    lastRoutesFetch: null,
    lastSwapExecution: null,
  });

  // =============================================
  // ACTIONS
  // =============================================

  /**
   * Fetch swap routes
   */
  const fetchRoutes = useCallback(
    async (request: SwapRequest) => {
      setState((prev) => ({
        ...prev,
        request,
        isLoadingRoutes: true,
        error: null,
      }));

      try {
        // Validate request
        validateRouteRequest({
          inputMint: request.inputMint,
          outputMint: request.outputMint,
          amount: request.amountIn,
          slippage: request.slippage,
        });

        // Fetch routes from Jupiter
        const routeResponse = await jupiterClient.current.getRoutes({
          inputMint: request.inputMint,
          outputMint: request.outputMint,
          amount: request.amountIn,
          slippage: request.slippage,
        });

        setState((prev) => ({
          ...prev,
          routes: routeResponse.routes,
          bestRoute: routeResponse.bestRoute,
          isLoadingRoutes: false,
          lastRoutesFetch: Date.now(),
        }));

        console.log(`✅ Routes fetched: ${routeResponse.routes.length} available`);
        console.log(`   Best route: ${routeResponse.bestRoute.marketInfos.map(m => m.label).join(' → ')}`);
        console.log(`   Output: ${routeResponse.bestRoute.outAmount}`);
        console.log(`   Price impact: ${routeResponse.bestRoute.priceImpact.toFixed(2)}%`);

        return routeResponse;
      } catch (error) {
        const swapError: SwapError = {
          code: 'ROUTE_NOT_FOUND' as SwapErrorCode,
          message: error instanceof Error ? error.message : 'Failed to fetch routes',
          details: error,
          timestamp: Date.now(),
        };

        setState((prev) => ({
          ...prev,
          error: swapError,
          isLoadingRoutes: false,
        }));

        throw swapError;
      }
    },
    []
  );

  /**
   * Execute swap with current best route
   */
  const executeSwap = useCallback(
    async (customRoute?: RouteInfo): Promise<SwapResult> => {
      const { request, bestRoute } = state;

      // Validation
      if (!wallet || !wallet.publicKey || !wallet.connected) {
        const error: SwapError = {
          code: 'WALLET_NOT_CONNECTED' as SwapErrorCode,
          message: 'Wallet not connected',
          timestamp: Date.now(),
        };
        setState((prev) => ({ ...prev, error }));
        throw error;
      }

      if (!request) {
        const error: SwapError = {
          code: 'INVALID_PARAMETERS' as SwapErrorCode,
          message: 'No swap request - call fetchRoutes first',
          timestamp: Date.now(),
        };
        setState((prev) => ({ ...prev, error }));
        throw error;
      }

      const routeToUse = customRoute || bestRoute;
      if (!routeToUse) {
        const error: SwapError = {
          code: 'ROUTE_NOT_FOUND' as SwapErrorCode,
          message: 'No route available - call fetchRoutes first',
          timestamp: Date.now(),
        };
        setState((prev) => ({ ...prev, error }));
        throw error;
      }

      setState((prev) => ({
        ...prev,
        isExecutingSwap: true,
        error: null,
      }));

      try {
        console.log('🚀 Executing swap...');
        console.log(`   Input: ${routeToUse.inAmount} (${request.inputMint.slice(0, 8)}...)`);
        console.log(`   Expected output: ${routeToUse.outAmount} (${request.outputMint.slice(0, 8)}...)`);
        console.log(`   Price impact: ${routeToUse.priceImpact.toFixed(2)}%`);
        console.log(`   Jito: ${request.useJito ? 'YES' : 'NO'}`);

        // Execute swap via Jupiter
        const signature = await jupiterClient.current.executeSwap({
          route: routeToUse,
          wallet,
          priorityFee: request.priorityFee,
        });

        // Calculate fees
        const platformFee = 0; // Jupiter has no platform fee
        const transactionFee = 0.000005; // ~5000 lamports base fee
        const priorityFee = (request.priorityFee || 0) / 1e9;
        const jitoTip = request.useJito ? (request.jitoTipAmount || 0.001) : 0;

        const fees = {
          platformFee,
          transactionFee,
          priorityFee,
          jitoTip: request.useJito ? jitoTip : undefined,
          totalFees: transactionFee + priorityFee + jitoTip,
        };

        // Build result
        const result: SwapResult = {
          signature,
          routeUsed: routeToUse,
          outputAmount: routeToUse.outAmount,
          priceImpact: routeToUse.priceImpact,
          fees,
          jitoTipUsed: request.useJito ? jitoTip : undefined,
          timestamp: Date.now(),
        };

        setState((prev) => ({
          ...prev,
          result,
          isExecutingSwap: false,
          lastSwapExecution: Date.now(),
        }));

        console.log('✅ Swap successful!');
        console.log(`   Signature: ${signature}`);
        console.log(`   Output: ${result.outputAmount}`);
        console.log(`   Total fees: ${fees.totalFees.toFixed(6)} SOL`);

        return result;
      } catch (error) {
        const swapError: SwapError = {
          code: 'TRANSACTION_FAILED' as SwapErrorCode,
          message: error instanceof Error ? error.message : 'Swap execution failed',
          details: error,
          timestamp: Date.now(),
        };

        setState((prev) => ({
          ...prev,
          error: swapError,
          isExecutingSwap: false,
        }));

        console.error('❌ Swap failed:', swapError.message);
        throw swapError;
      }
    },
    [state, wallet]
  );

  /**
   * Validate slippage tolerance
   */
  const validateSlippage = useCallback(
    (expectedOutput: string, actualOutput: string, slippageBps: number): boolean => {
      const expected = BigInt(expectedOutput);
      const actual = BigInt(actualOutput);
      const tolerance = (expected * BigInt(slippageBps)) / BigInt(10000);
      const minAcceptable = expected - tolerance;

      const isValid = actual >= minAcceptable;

      if (!isValid) {
        console.warn('⚠️ Slippage exceeded!');
        console.warn(`   Expected: ${expectedOutput}`);
        console.warn(`   Actual: ${actualOutput}`);
        console.warn(`   Min acceptable: ${minAcceptable.toString()}`);
      }

      return isValid;
    },
    []
  );

  /**
   * Reset swap state
   */
  const reset = useCallback(() => {
    setState({
      request: null,
      routes: [],
      bestRoute: null,
      result: null,
      error: null,
      isLoadingRoutes: false,
      isExecutingSwap: false,
      lastRoutesFetch: null,
      lastSwapExecution: null,
    });
  }, []);

  /**
   * Refresh routes (re-fetch with same request)
   */
  const refreshRoutes = useCallback(async () => {
    if (!state.request) {
      throw new Error('No request to refresh - call fetchRoutes first');
    }
    return fetchRoutes(state.request);
  }, [state.request, fetchRoutes]);

  // =============================================
  // RETURN API
  // =============================================

  return {
    // State
    request: state.request,
    routes: state.routes,
    bestRoute: state.bestRoute,
    result: state.result,
    error: state.error,
    isLoadingRoutes: state.isLoadingRoutes,
    isExecutingSwap: state.isExecutingSwap,
    lastRoutesFetch: state.lastRoutesFetch,
    lastSwapExecution: state.lastSwapExecution,

    // Actions
    fetchRoutes,
    executeSwap,
    validateSlippage,
    refreshRoutes,
    reset,

    // Computed
    isLoading: state.isLoadingRoutes || state.isExecutingSwap,
    hasRoutes: state.routes.length > 0,
    canExecuteSwap: !!state.bestRoute && !!wallet?.connected && !state.isExecutingSwap,
  };
}

// =============================================
// UTILITY HOOK
// =============================================

/**
 * Hook for estimating swap output
 * 
 * @example
 * ```tsx
 * const { estimatedOutput, priceImpact } = useSwapEstimate({
 *   inputMint: SOL_MINT,
 *   outputMint: USDC_MINT,
 *   amountIn: 1_000_000_000,
 *   connection,
 * });
 * ```
 */
export function useSwapEstimate(params: {
  inputMint: string;
  outputMint: string;
  amountIn: number | string;
  slippage?: number;
  connection: Connection;
}) {
  const { inputMint, outputMint, amountIn, slippage = 50, connection } = params;

  const [estimatedOutput, setEstimatedOutput] = useState<string | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const jupiterClient = useRef(createJupiterClient(connection));

  const estimate = useCallback(async () => {
    if (!inputMint || !outputMint || !amountIn) return;

    setIsLoading(true);

    try {
      const routeResponse = await jupiterClient.current.getRoutes({
        inputMint,
        outputMint,
        amount: amountIn,
        slippage,
      });

      setEstimatedOutput(routeResponse.bestRoute.outAmount);
      setPriceImpact(routeResponse.bestRoute.priceImpact);
    } catch (error) {
      console.error('Failed to estimate swap:', error);
      setEstimatedOutput(null);
      setPriceImpact(null);
    } finally {
      setIsLoading(false);
    }
  }, [inputMint, outputMint, amountIn, slippage]);

  return {
    estimatedOutput,
    priceImpact,
    isLoading,
    estimate,
  };
}
