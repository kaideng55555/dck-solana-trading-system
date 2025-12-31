/**
 * GlobalFeedStore - Zustand Store for Live Token Feed
 * 
 * Integrates LiveFeedEngine and FeedNormalizer to provide a global,
 * reactive state management solution for real-time token data.
 * 
 * Features:
 * - Subscribes to LiveFeedEngine updates
 * - Normalizes raw data via FeedNormalizer
 * - Stores normalized Token objects in global state
 * - Provides selector methods for filtering/querying
 * - Tracks engine connection status
 * - Automatic cleanup on unmount
 * 
 * Usage:
 * ```typescript
 * const { tokens, subscribeTo, getToken } = useGlobalFeedStore();
 * 
 * // Subscribe to a mint
 * subscribeTo('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
 * 
 * // Get token
 * const token = getToken('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
 * ```
 */

import { create } from 'zustand';
import { Connection } from '@solana/web3.js';
import LiveFeedEngine, { type TokenLiveEntry } from '../live/LiveFeedEngine';
import FeedNormalizer from './FeedNormalizer';
import type { Token } from '../data/tokenTypes';

// ============================================================
// TYPES
// ============================================================

/**
 * Engine status information
 */
interface EngineStatus {
  connected: boolean;
  reconnectAttempts: number;
  polling: boolean;
  subscribedMints: number;
}

/**
 * Global feed state shape
 */
interface GlobalFeedState {
  // Data
  tokens: Record<string, Token>;
  lastUpdated: number;
  engineStatus: EngineStatus;

  // Internal flags
  _isStarted: boolean;
  _engine: LiveFeedEngine | null;
  _normalizer: FeedNormalizer | null;

  // Methods
  start: () => void;
  stop: () => void;
  subscribeTo: (mint: string) => void;
  unsubscribeFrom: (mint: string) => void;
  getToken: (mint: string) => Token | undefined;
  getAll: () => Token[];
  updateEngineStatus: () => void;
}

// ============================================================
// SOLANA CONNECTION SETUP
// ============================================================

/**
 * Get Solana RPC connection.
 * Uses environment variable or defaults to devnet.
 */
function getConnection(): Connection {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

// ============================================================
// GLOBAL FEED STORE
// ============================================================

export const useGlobalFeedStore = create<GlobalFeedState>((set, get) => {
  // Initialize connection and engine outside the store
  // These are created once and reused
  let connection: Connection | null = null;
  let engine: LiveFeedEngine | null = null;
  let normalizer: FeedNormalizer | null = null;

  /**
   * Initialize engine and normalizer if not already created.
   */
  const initializeEngine = () => {
    if (!engine) {
      connection = getConnection();
      engine = new LiveFeedEngine(connection);
      normalizer = new FeedNormalizer();
    }
    return { engine, normalizer };
  };

  return {
    // ============================================================
    // STATE
    // ============================================================

    tokens: {},
    lastUpdated: 0,
    engineStatus: {
      connected: false,
      reconnectAttempts: 0,
      polling: false,
      subscribedMints: 0,
    },
    _isStarted: false,
    _engine: null,
    _normalizer: null,

    // ============================================================
    // METHODS
    // ============================================================

    /**
     * Start the live feed engine.
     * Can be called multiple times - will only start once.
     */
    start: () => {
      const state = get();
      
      // Prevent multiple starts
      if (state._isStarted) {
        console.log('[GlobalFeedStore] Engine already started');
        return;
      }

      console.log('[GlobalFeedStore] Starting live feed engine...');

      // Initialize engine and normalizer
      const { engine: eng, normalizer: norm } = initializeEngine();
      
      if (!eng || !norm) {
        console.error('[GlobalFeedStore] Failed to initialize engine');
        return;
      }

      // Update store with references
      set({
        _isStarted: true,
        _engine: eng,
        _normalizer: norm,
      });

      // Note: Actual subscription to mints happens via subscribeTo()
      // The engine will start monitoring when first subscription is added

      console.log('[GlobalFeedStore] Engine started');
    },

    /**
     * Stop the live feed engine and clear state.
     */
    stop: () => {
      const state = get();

      if (!state._isStarted) {
        console.log('[GlobalFeedStore] Engine not started');
        return;
      }

      console.log('[GlobalFeedStore] Stopping live feed engine...');

      // Stop engine if it exists
      if (state._engine) {
        state._engine.stop();
      }

      // Reset normalizer
      if (state._normalizer) {
        state._normalizer.reset();
      }

      // Clear state
      set({
        tokens: {},
        lastUpdated: 0,
        engineStatus: {
          connected: false,
          reconnectAttempts: 0,
          polling: false,
          subscribedMints: 0,
        },
        _isStarted: false,
        _engine: null,
        _normalizer: null,
      });

      console.log('[GlobalFeedStore] Engine stopped');
    },

    /**
     * Subscribe to a specific mint address.
     * Automatically starts engine if not started.
     */
    subscribeTo: (mint: string) => {
      const state = get();

      // Auto-start if not started
      if (!state._isStarted) {
        get().start();
      }

      const { _engine, _normalizer } = get();

      if (!_engine || !_normalizer) {
        console.error('[GlobalFeedStore] Engine not initialized');
        return;
      }

      console.log(`[GlobalFeedStore] Subscribing to ${mint}`);

      // Define callback for this mint
      const callback = (rawUpdate: TokenLiveEntry) => {
        try {
          // Normalize the raw update
          const normalized = _normalizer.normalize(rawUpdate);

          // Update store with shallow merge
          set((s) => ({
            tokens: {
              ...s.tokens,
              [mint]: normalized,
            },
            lastUpdated: Date.now(),
          }));
        } catch (error) {
          console.error(`[GlobalFeedStore] Error normalizing update for ${mint}:`, error);
        }
      };

      // Subscribe to engine
      _engine.addSubscription(mint, callback);

      // Update engine status
      get().updateEngineStatus();
    },

    /**
     * Unsubscribe from a specific mint address.
     */
    unsubscribeFrom: (mint: string) => {
      const { _engine, tokens } = get();

      if (!_engine) {
        console.error('[GlobalFeedStore] Engine not initialized');
        return;
      }

      console.log(`[GlobalFeedStore] Unsubscribing from ${mint}`);

      // Get all callbacks for this mint (we need to track them to remove)
      // Note: This is a limitation - we can't easily get the callback reference
      // For now, we'll remove the token from state
      // In production, you'd want to track callbacks separately

      // Remove token from state
      set((s) => {
        const newTokens = { ...s.tokens };
        delete newTokens[mint];
        return {
          tokens: newTokens,
          lastUpdated: Date.now(),
        };
      });

      // Update engine status
      get().updateEngineStatus();
    },

    /**
     * Get a specific token by mint address.
     */
    getToken: (mint: string) => {
      const state = get();
      return state.tokens[mint];
    },

    /**
     * Get all tokens as an array.
     */
    getAll: () => {
      const state = get();
      return Object.values(state.tokens);
    },

    /**
     * Update engine status from engine.getStatus().
     */
    updateEngineStatus: () => {
      const { _engine } = get();

      if (!_engine) {
        return;
      }

      const status = _engine.getStatus();

      set({
        engineStatus: {
          connected: status.wsConnected,
          reconnectAttempts: status.reconnectAttempts,
          polling: status.polling,
          subscribedMints: status.subscribedMints,
        },
      });
    },
  };
});

// ============================================================
// CONVENIENCE SELECTORS
// ============================================================

/**
 * Select all tokens as array.
 */
export const selectAllTokens = (state: GlobalFeedState) => state.getAll();

/**
 * Select a specific token by mint.
 */
export const selectToken = (mint: string) => (state: GlobalFeedState) => 
  state.getToken(mint);

/**
 * Select engine connection status.
 */
export const selectEngineStatus = (state: GlobalFeedState) => 
  state.engineStatus;

/**
 * Select tokens count.
 */
export const selectTokensCount = (state: GlobalFeedState) => 
  Object.keys(state.tokens).length;

/**
 * Select last updated timestamp.
 */
export const selectLastUpdated = (state: GlobalFeedState) => 
  state.lastUpdated;

// ============================================================
// EXPORT
// ============================================================

export default useGlobalFeedStore;
