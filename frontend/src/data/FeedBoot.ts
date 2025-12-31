/**
 * FeedBoot - Global Bootloader for Real-Time Token Data
 * 
 * Singleton service that initializes and manages the entire live feed system.
 * Automatically discovers new tokens from Solana blockchain and subscribes
 * to their real-time updates via GlobalFeedStore.
 * 
 * Features:
 * - Singleton pattern (only one instance globally)
 * - Token discovery from Raydium pools, Pump.fun, and transaction logs
 * - Automatic subscription to discovered tokens
 * - Progress tracking (loadingCount) for UI integration
 * - Ready state when first 50 tokens loaded
 * - Fail-safe error handling for RPC/JSON errors
 * 
 * Usage:
 * ```typescript
 * import { FeedBoot } from './FeedBoot';
 * 
 * // Start the feed system
 * FeedBoot.start();
 * 
 * // Check ready state
 * if (FeedBoot.state.ready) {
 *   console.log('Feed ready with', FeedBoot.state.loadingCount, 'tokens');
 * }
 * 
 * // Stop when done
 * FeedBoot.stop();
 * ```
 */

import { Connection, PublicKey, LogsFilter } from '@solana/web3.js';
import { useGlobalFeedStore } from '../feed/GlobalFeedStore';

// ============================================================
// TYPES
// ============================================================

interface FeedBootState {
  ready: boolean;
  loadingCount: number;
  start: () => void;
  stop: () => void;
  _internalState: {
    ready: boolean;
    loadingCount: number;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

const READY_THRESHOLD = 50; // Number of tokens before marking as ready
const LOG_SCAN_INTERVAL = 5000; // Check for new tokens every 5 seconds

// Known program IDs for token discovery
const RAYDIUM_PROGRAMS = [
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK', // Raydium Concentrated Liquidity
];

const PUMP_FUN_PROGRAM = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'; // Pump.fun

// ============================================================
// SINGLETON STATE
// ============================================================

let initialized = false;
let connection: Connection | null = null;
let logSubscriptionId: number | null = null;
let scanIntervalId: NodeJS.Timeout | null = null;
let discoveredMints = new Set<string>();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get Solana RPC connection
 */
function getConnection(): Connection {
  if (!connection) {
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    connection = new Connection(rpcUrl, 'confirmed');
  }
  return connection;
}

/**
 * Validate if a string is a valid Solana public key
 */
function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract mint addresses from transaction logs
 */
function extractMintsFromLogs(logs: string[]): string[] {
  const mints: string[] = [];
  
  try {
    for (const log of logs) {
      // Look for base58 addresses in logs (mint addresses are typically 32-44 chars)
      const matches = log.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);
      if (matches) {
        for (const match of matches) {
          if (isValidPublicKey(match) && !discoveredMints.has(match)) {
            mints.push(match);
          }
        }
      }
    }
  } catch (error) {
    console.error('[FeedBoot] Error extracting mints from logs:', error);
  }
  
  return mints;
}

/**
 * Discover tokens from recent transactions
 */
async function discoverTokensFromRecentTransactions(): Promise<string[]> {
  const conn = getConnection();
  const discovered: string[] = [];

  try {
    // Get recent signatures
    const signatures = await conn.getSignaturesForAddress(
      new PublicKey(RAYDIUM_PROGRAMS[0]),
      { limit: 10 }
    );

    for (const sig of signatures) {
      try {
        const tx = await conn.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta) continue;

        // Extract token mints from parsed transaction
        const accountKeys = tx.transaction.message.accountKeys;
        for (const key of accountKeys) {
          let pubkey: string;
          if (typeof key === 'object' && key !== null && 'pubkey' in key) {
            pubkey = (key as any).pubkey.toBase58();
          } else {
            continue;
          }
          
          if (!discoveredMints.has(pubkey) && isValidPublicKey(pubkey)) {
            discovered.push(pubkey);
          }
        }
      } catch (error) {
        // Skip failed transactions silently
        continue;
      }
    }
  } catch (error) {
    console.error('[FeedBoot] Error discovering tokens from transactions:', error);
  }

  return discovered;
}

/**
 * Subscribe to a newly discovered mint
 */
function subscribeToMint(mint: string): void {
  if (discoveredMints.has(mint)) return;

  try {
    // Mark as discovered
    discoveredMints.add(mint);

    // Subscribe via GlobalFeedStore
    const store = useGlobalFeedStore.getState();
    store.subscribeTo(mint);

    // Update loading count
    FeedBoot._internalState.loadingCount = discoveredMints.size;

    // Check if ready
    if (!FeedBoot._internalState.ready && FeedBoot._internalState.loadingCount >= READY_THRESHOLD) {
      FeedBoot._internalState.ready = true;
      console.log('[FeedBoot] ✅ Feed system ready with', FeedBoot._internalState.loadingCount, 'tokens');
    }

    console.log(`[FeedBoot] 📡 Subscribed to ${mint} (${FeedBoot._internalState.loadingCount}/${READY_THRESHOLD})`);
  } catch (error) {
    console.error('[FeedBoot] Error subscribing to mint:', mint, error);
  }
}

/**
 * Handle new token discovery from logs
 */
function handleTokenDiscovery(mints: string[]): void {
  for (const mint of mints) {
    if (!discoveredMints.has(mint)) {
      subscribeToMint(mint);
    }
  }
}

/**
 * Start log monitoring for token discovery
 */
function startLogMonitoring(): void {
  const conn = getConnection();

  try {
    // Subscribe to logs for Raydium program
    const programId = new PublicKey(RAYDIUM_PROGRAMS[0]);

    // Subscribe to logs
    logSubscriptionId = conn.onLogs(
      programId,
      (logs) => {
        try {
          const mints = extractMintsFromLogs(logs.logs);
          if (mints.length > 0) {
            handleTokenDiscovery(mints);
          }
        } catch (error) {
          console.error('[FeedBoot] Error processing logs:', error);
        }
      },
      'confirmed'
    );

    console.log('[FeedBoot] 🎧 Log monitoring started');
  } catch (error) {
    console.error('[FeedBoot] Failed to start log monitoring:', error);
  }
}

/**
 * Start periodic transaction scanning
 */
function startPeriodicScanning(): void {
  scanIntervalId = setInterval(async () => {
    try {
      const mints = await discoverTokensFromRecentTransactions();
      if (mints.length > 0) {
        handleTokenDiscovery(mints);
      }
    } catch (error) {
      console.error('[FeedBoot] Error in periodic scan:', error);
    }
  }, LOG_SCAN_INTERVAL);

  console.log('[FeedBoot] 🔍 Periodic scanning started');
}

/**
 * Bootstrap initial tokens (seed data)
 */
async function bootstrapInitialTokens(): Promise<void> {
  console.log('[FeedBoot] 🌱 Bootstrapping initial tokens...');

  try {
    // Discover from recent transactions
    const mints = await discoverTokensFromRecentTransactions();
    
    if (mints.length > 0) {
      handleTokenDiscovery(mints);
    }

    // If we found fewer than ready threshold, add some known tokens
    if (discoveredMints.size < READY_THRESHOLD) {
      // You can add known token mints here as fallback
      const fallbackMints = [
        'So11111111111111111111111111111111111111112', // Wrapped SOL
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        // Add more known tokens as needed
      ];

      for (const mint of fallbackMints) {
        if (discoveredMints.size >= READY_THRESHOLD) break;
        subscribeToMint(mint);
      }
    }
  } catch (error) {
    console.error('[FeedBoot] Error bootstrapping tokens:', error);
  }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const FeedBoot: FeedBootState = {
  ready: false,
  loadingCount: 0,
  _internalState: {
    ready: false,
    loadingCount: 0,
  },

  /**
   * Start the feed bootloader
   * - Initializes GlobalFeedStore
   * - Discovers tokens from blockchain
   * - Subscribes to real-time updates
   * - Marks ready when 50+ tokens loaded
   */
  start(): void {
    if (initialized) {
      console.warn('[FeedBoot] Already initialized');
      return;
    }

    console.log('[FeedBoot] 🚀 Starting feed bootloader...');
    initialized = true;

    try {
      // Initialize connection
      getConnection();

      // Start GlobalFeedStore engine
      const store = useGlobalFeedStore.getState();
      store.start();

      // Bootstrap initial tokens
      bootstrapInitialTokens();

      // Start log monitoring for new tokens
      startLogMonitoring();

      // Start periodic scanning
      startPeriodicScanning();

      console.log('[FeedBoot] ✅ Feed bootloader started');
    } catch (error) {
      console.error('[FeedBoot] Failed to start:', error);
      initialized = false;
    }
  },

  /**
   * Stop the feed bootloader
   * - Stops log monitoring
   * - Stops periodic scanning
   * - Stops GlobalFeedStore engine
   * - Clears all subscriptions
   */
  stop(): void {
    if (!initialized) {
      console.warn('[FeedBoot] Not initialized');
      return;
    }

    console.log('[FeedBoot] 🛑 Stopping feed bootloader...');

    try {
      // Stop log monitoring
      if (logSubscriptionId !== null && connection) {
        connection.removeOnLogsListener(logSubscriptionId);
        logSubscriptionId = null;
      }

      // Stop periodic scanning
      if (scanIntervalId !== null) {
        clearInterval(scanIntervalId);
        scanIntervalId = null;
      }

      // Stop GlobalFeedStore
      const store = useGlobalFeedStore.getState();
      store.stop();

      // Reset state
      discoveredMints.clear();
      FeedBoot.ready = false;
      FeedBoot.loadingCount = 0;
      initialized = false;

      console.log('[FeedBoot] ✅ Feed bootloader stopped');
    } catch (error) {
      console.error('[FeedBoot] Error stopping:', error);
    }
  },
};

// Make state properties reactive
Object.defineProperty(FeedBoot, 'ready', {
  get() {
    return FeedBoot._internalState?.ready ?? false;
  },
  set(value: boolean) {
    if (FeedBoot._internalState) {
      FeedBoot._internalState.ready = value;
    }
  },
});

Object.defineProperty(FeedBoot, 'loadingCount', {
  get() {
    return FeedBoot._internalState?.loadingCount ?? 0;
  },
  set(value: number) {
    if (FeedBoot._internalState) {
      FeedBoot._internalState.loadingCount = value;
    }
  },
});

// Store state in the object itself
(FeedBoot as any)._internalState = {
  ready: false,
  loadingCount: 0,
};

export default FeedBoot;
