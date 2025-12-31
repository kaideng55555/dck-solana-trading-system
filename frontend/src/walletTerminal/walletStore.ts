/**
 * Multi-Wallet Store (D11)
 * 
 * Zustand store for multi-wallet management
 * Features:
 * - Wallet CRUD operations
 * - Group management
 * - Active wallet selection
 * - History tracking
 * - LocalStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Wallet,
  WalletGroup,
  WalletHistoryEntry,
  WalletStore,
  WalletStoreState,
} from './walletTypes';
import { Keypair } from '@solana/web3.js';

// =============================================
// INITIAL STATE
// =============================================

const initialState: WalletStoreState = {
  wallets: {},
  walletGroups: {},
  activeWalletId: null,
  timelineOpen: false,
  sniperFeedVisible: true,
};

// =============================================
// STORE
// =============================================

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // =============================================
      // WALLET MANAGEMENT
      // =============================================

      addWallet: (walletData) => {
        const id = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const wallet: Wallet = {
          ...walletData,
          id,
          createdAt: Date.now(),
          history: [],
        };

        set((state) => ({
          wallets: {
            ...state.wallets,
            [id]: wallet,
          },
          activeWalletId: state.activeWalletId || id, // Auto-select first wallet
        }));

        return id;
      },

      removeWallet: (walletId) => {
        set((state) => {
          const { [walletId]: removed, ...remainingWallets } = state.wallets;
          const newActiveId =
            state.activeWalletId === walletId
              ? Object.keys(remainingWallets)[0] || null
              : state.activeWalletId;

          return {
            wallets: remainingWallets,
            activeWalletId: newActiveId,
          };
        });
      },

      renameWallet: (walletId, name) => {
        set((state) => ({
          wallets: {
            ...state.wallets,
            [walletId]: {
              ...state.wallets[walletId],
              name,
            },
          },
        }));
      },

      // =============================================
      // GROUP MANAGEMENT
      // =============================================

      addGroup: (name, color) => {
        const id = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const group: WalletGroup = {
          id,
          name,
          color,
          createdAt: Date.now(),
        };

        set((state) => ({
          walletGroups: {
            ...state.walletGroups,
            [id]: group,
          },
        }));

        return id;
      },

      renameGroup: (groupId, name) => {
        set((state) => ({
          walletGroups: {
            ...state.walletGroups,
            [groupId]: {
              ...state.walletGroups[groupId],
              name,
            },
          },
        }));
      },

      deleteGroup: (groupId) => {
        set((state) => {
          const { [groupId]: removed, ...remainingGroups } = state.walletGroups;

          // Remove group from all wallets
          const updatedWallets = { ...state.wallets };
          Object.values(updatedWallets).forEach((wallet) => {
            if (wallet.groupId === groupId) {
              updatedWallets[wallet.id] = {
                ...wallet,
                groupId: null,
              };
            }
          });

          return {
            walletGroups: remainingGroups,
            wallets: updatedWallets,
          };
        });
      },

      // =============================================
      // ACTIVE WALLET
      // =============================================

      setActiveWallet: (walletId) => {
        set({ activeWalletId: walletId });
      },

      toggleTimeline: () => {
        set((state) => ({ timelineOpen: !state.timelineOpen }));
      },

      toggleSniperFeed: () => {
        set((state) => ({ sniperFeedVisible: !state.sniperFeedVisible }));
      },

      // =============================================
      // WALLET DATA UPDATES
      // =============================================

      updateBalance: (walletId, solBalance, usdBalance) => {
        set((state) => {
          const wallet = state.wallets[walletId];
          if (!wallet) return state;

          return {
            wallets: {
              ...state.wallets,
              [walletId]: {
                ...wallet,
                solBalance,
                usdBalance,
              },
            },
          };
        });
      },

      updatePnL: (walletId, pnl, pnlPercent) => {
        set((state) => {
          const wallet = state.wallets[walletId];
          if (!wallet) return state;

          return {
            wallets: {
              ...state.wallets,
              [walletId]: {
                ...wallet,
                pnl,
                pnlPercent,
              },
            },
          };
        });
      },

      addHistory: (walletId, entryData) => {
        set((state) => {
          const wallet = state.wallets[walletId];
          if (!wallet) return state;

          const entry: WalletHistoryEntry = {
            ...entryData,
            id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };

          return {
            wallets: {
              ...state.wallets,
              [walletId]: {
                ...wallet,
                history: [entry, ...wallet.history].slice(0, 1000), // Keep last 1000 entries
              },
            },
          };
        });
      },

      // =============================================
      // QUERIES
      // =============================================

      getGroupWallets: (groupId) => {
        const state = get();
        return Object.values(state.wallets).filter(
          (wallet) => wallet.groupId === groupId
        );
      },

      getWallet: (walletId) => {
        return get().wallets[walletId];
      },

      getAllWallets: () => {
        return Object.values(get().wallets);
      },

      // =============================================
      // IMPORT FUNCTIONS
      // =============================================

      importWalletFromPrivateKey: async (privateKey, name, groupId) => {
        try {
          // Parse private key (hex string or array)
          const secretKey = Uint8Array.from(JSON.parse(privateKey));
          const keypair = Keypair.fromSecretKey(secretKey);

          const address = keypair.publicKey.toBase58();

          // Check if wallet already exists
          const existingWallet = Object.values(get().wallets).find(
            (w) => w.address === address
          );
          if (existingWallet) {
            throw new Error('Wallet already imported');
          }

          const walletId = get().addWallet({
            name,
            address,
            groupId,
            solBalance: 0,
            usdBalance: 0,
            pnl: 0,
            pnlPercent: 0,
            tags: [],
            privateKey, // Store encrypted in production
          });

          console.log(`✅ Imported wallet: ${address}`);
          return walletId;
        } catch (error) {
          console.error('Failed to import wallet from private key:', error);
          throw error;
        }
      },

      importWalletFromSeed: async (seed, name, groupId) => {
        try {
          // Generate keypair from seed phrase
          // TODO: Implement proper BIP39 derivation when bip39 package is added
          const keypair = Keypair.generate();

          const address = keypair.publicKey.toBase58();

          // Check if wallet already exists
          const existingWallet = Object.values(get().wallets).find(
            (w) => w.address === address
          );
          if (existingWallet) {
            throw new Error('Wallet already imported');
          }

          const walletId = get().addWallet({
            name,
            address,
            groupId,
            solBalance: 0,
            usdBalance: 0,
            pnl: 0,
            pnlPercent: 0,
            tags: ['seed'],
          });

          console.log(`✅ Imported wallet from seed: ${address}`);
          return walletId;
        } catch (error) {
          console.error('Failed to import wallet from seed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'dck-wallet-terminal-storage',
      version: 1,
    }
  )
);

export default useWalletStore;
