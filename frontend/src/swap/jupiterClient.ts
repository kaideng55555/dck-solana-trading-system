/**
 * Jupiter V6 Client
 * 
 * Handles route fetching and swap execution via Jupiter aggregator
 */

import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import type {
  RouteRequest,
  RouteResponse,
  RouteInfo,
  WalletAdapter,
  SwapErrorCode,
} from './swapTypes';

// =============================================
// CONFIGURATION
// =============================================

const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';
const DEFAULT_MAX_ROUTES = 3;

// Mock mode for development (set to false when Jupiter API is ready)
const USE_MOCK_MODE = true;

// =============================================
// JUPITER CLIENT CLASS
// =============================================

/**
 * Jupiter V6 API client
 */
export class JupiterClient {
  private connection: Connection;
  private apiUrl: string;

  constructor(connection: Connection, apiUrl: string = JUPITER_API_URL) {
    this.connection = connection;
    this.apiUrl = apiUrl;
  }

  /**
   * Get swap routes from Jupiter
   * 
   * @param request - Route request parameters
   * @returns Available routes with best route first
   */
  async getRoutes(request: RouteRequest): Promise<RouteResponse> {
    if (USE_MOCK_MODE) {
      return this.getMockRoutes(request);
    }

    try {
      const params = new URLSearchParams({
        inputMint: request.inputMint,
        outputMint: request.outputMint,
        amount: String(request.amount),
        slippageBps: String(request.slippage),
        onlyDirectRoutes: String(request.onlyDirectRoutes || false),
        maxAccounts: String(request.maxRoutes || DEFAULT_MAX_ROUTES),
      });

      const response = await fetch(`${this.apiUrl}/quote?${params}`);

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform Jupiter API response to our format
      const routes: RouteInfo[] = data.data?.map((route: any) => ({
        id: route.id || crypto.randomUUID(),
        inputMint: route.inputMint,
        outputMint: route.outputMint,
        inAmount: route.inAmount,
        outAmount: route.outAmount,
        priceImpact: parseFloat(route.priceImpactPct || '0'),
        marketInfos: route.marketInfos || [],
        otherAmountThreshold: route.otherAmountThreshold,
      })) || [];

      if (routes.length === 0) {
        throw new Error('No routes found');
      }

      return {
        routes,
        bestRoute: routes[0],
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch Jupiter routes:', error);
      throw error;
    }
  }

  /**
   * Execute swap transaction
   * 
   * @param params - Swap execution parameters
   * @returns Transaction signature
   */
  async executeSwap(params: {
    route: RouteInfo;
    wallet: WalletAdapter;
    priorityFee?: number;
  }): Promise<string> {
    const { route, wallet, priorityFee = 0 } = params;

    if (!wallet.publicKey || !wallet.connected) {
      throw new Error('Wallet not connected');
    }

    if (!wallet.signTransaction && !wallet.sendTransaction) {
      throw new Error('Wallet does not support signing or sending transactions');
    }

    if (USE_MOCK_MODE) {
      return this.executeMockSwap(route, wallet);
    }

    try {
      // Step 1: Get swap transaction from Jupiter
      const swapResponse = await fetch(`${this.apiUrl}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: route,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          computeUnitPriceMicroLamports: priorityFee,
        }),
      });

      if (!swapResponse.ok) {
        throw new Error(`Jupiter swap API error: ${swapResponse.statusText}`);
      }

      const { swapTransaction } = await swapResponse.json();

      // Step 2: Deserialize transaction
      const transactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuf);

      // Step 3: Sign and send transaction
      let signature: string;

      if (wallet.sendTransaction) {
        // Use wallet's sendTransaction if available
        signature = await wallet.sendTransaction(transaction, this.connection);
      } else if (wallet.signTransaction) {
        // Sign then send manually
        const signedTx = await wallet.signTransaction(transaction);
        signature = await this.connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
      } else {
        throw new Error('Wallet cannot sign or send transactions');
      }

      // Step 4: Confirm transaction
      console.log(`🔄 Swap transaction sent: ${signature}`);

      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log(`✅ Swap confirmed: ${signature}`);
      return signature;
    } catch (error) {
      console.error('Swap execution failed:', error);
      throw error;
    }
  }

  /**
   * Get token price from Jupiter
   * 
   * @param mint - Token mint address
   * @returns Price in USD (if available)
   */
  async getTokenPrice(mint: string): Promise<number | null> {
    if (USE_MOCK_MODE) {
      return Math.random() * 0.01; // Mock price
    }

    try {
      const response = await fetch(`${this.apiUrl}/price?ids=${mint}`);
      const data = await response.json();
      return data.data?.[mint]?.price || null;
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      return null;
    }
  }

  // =============================================
  // MOCK MODE (for development)
  // =============================================

  /**
   * Generate mock routes for testing
   */
  private async getMockRoutes(request: RouteRequest): Promise<RouteResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));

    const baseOutput = Number(request.amount) * (0.95 + Math.random() * 0.1);

    const routes: RouteInfo[] = [
      {
        id: crypto.randomUUID(),
        inputMint: request.inputMint,
        outputMint: request.outputMint,
        inAmount: String(request.amount),
        outAmount: String(Math.floor(baseOutput * 1.02)),
        priceImpact: 0.15 + Math.random() * 0.3,
        marketInfos: [
          {
            label: 'Raydium',
            id: 'raydium-pool-123',
            inputMint: request.inputMint,
            outputMint: request.outputMint,
            lpFee: 0.003,
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        inputMint: request.inputMint,
        outputMint: request.outputMint,
        inAmount: String(request.amount),
        outAmount: String(Math.floor(baseOutput)),
        priceImpact: 0.25 + Math.random() * 0.5,
        marketInfos: [
          {
            label: 'Orca',
            id: 'orca-pool-456',
            inputMint: request.inputMint,
            outputMint: request.outputMint,
            lpFee: 0.0025,
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        inputMint: request.inputMint,
        outputMint: request.outputMint,
        inAmount: String(request.amount),
        outAmount: String(Math.floor(baseOutput * 0.98)),
        priceImpact: 0.4 + Math.random() * 0.6,
        marketInfos: [
          {
            label: 'Raydium',
            id: 'raydium-pool-789',
            inputMint: request.inputMint,
            outputMint: 'intermediate-token',
            lpFee: 0.003,
          },
          {
            label: 'Orca',
            id: 'orca-pool-abc',
            inputMint: 'intermediate-token',
            outputMint: request.outputMint,
            lpFee: 0.0025,
          },
        ],
      },
    ];

    console.log(`📊 Mock routes fetched: ${routes.length} routes available`);

    return {
      routes,
      bestRoute: routes[0],
      timestamp: Date.now(),
    };
  }

  /**
   * Execute mock swap for testing
   */
  private async executeMockSwap(
    route: RouteInfo,
    wallet: WalletAdapter
  ): Promise<string> {
    // Simulate transaction execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate mock signature
    const mockSignature = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    console.log(`✅ Mock swap executed: ${mockSignature}`);
    console.log(`   Input: ${route.inAmount} ${route.inputMint.slice(0, 8)}...`);
    console.log(`   Output: ${route.outAmount} ${route.outputMint.slice(0, 8)}...`);
    console.log(`   Price Impact: ${route.priceImpact.toFixed(2)}%`);

    return mockSignature;
  }
}

// =============================================
// FACTORY FUNCTION
// =============================================

/**
 * Create Jupiter client instance
 * 
 * @param connection - Solana connection
 * @param apiUrl - Optional custom API URL
 * @returns Jupiter client instance
 */
export function createJupiterClient(
  connection: Connection,
  apiUrl?: string
): JupiterClient {
  return new JupiterClient(connection, apiUrl);
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Calculate minimum output amount based on slippage
 * 
 * @param outputAmount - Expected output amount
 * @param slippageBps - Slippage in basis points
 * @returns Minimum acceptable output amount
 */
export function calculateMinimumOutput(
  outputAmount: string | number,
  slippageBps: number
): string {
  const amount = BigInt(outputAmount);
  const slippage = BigInt(slippageBps);
  const bps = BigInt(10000);

  const minAmount = (amount * (bps - slippage)) / bps;
  return minAmount.toString();
}

/**
 * Format route for display
 * 
 * @param route - Route information
 * @returns Human-readable route string
 */
export function formatRoute(route: RouteInfo): string {
  if (route.marketInfos.length === 1) {
    return `Direct swap via ${route.marketInfos[0].label}`;
  }

  const dexes = route.marketInfos.map((m) => m.label).join(' → ');
  return `Multi-hop: ${dexes}`;
}

/**
 * Validate route parameters
 * 
 * @param request - Route request
 * @throws Error if parameters are invalid
 */
export function validateRouteRequest(request: RouteRequest): void {
  if (!request.inputMint || request.inputMint.length !== 44) {
    throw new Error('Invalid input mint address');
  }

  if (!request.outputMint || request.outputMint.length !== 44) {
    throw new Error('Invalid output mint address');
  }

  if (request.inputMint === request.outputMint) {
    throw new Error('Input and output mints cannot be the same');
  }

  const amount = Number(request.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid swap amount');
  }

  if (request.slippage < 0 || request.slippage > 5000) {
    throw new Error('Slippage must be between 0 and 5000 bps (50%)');
  }
}
