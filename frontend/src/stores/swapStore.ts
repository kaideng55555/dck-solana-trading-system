/**
 * Swap Modal Store
 * 
 * Global state management for swap modal
 */

import { create } from 'zustand';

interface SwapState {
  /** Whether swap modal is open */
  isSwapOpen: boolean;
  
  /** Input token mint address */
  selectedInput: string;
  
  /** Output token mint address */
  selectedOutput: string;
  
  /** Swap mode */
  mode: 'default' | 'snipe';
  
  /** Open swap modal with specific tokens */
  openSwap: (inputMint: string, outputMint: string, mode?: 'default' | 'snipe') => void;
  
  /** Close swap modal */
  closeSwap: () => void;
  
  /** Swap input/output tokens */
  swapTokens: () => void;
}

/**
 * Default token mints
 */
export const DEFAULT_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
} as const;

/**
 * Swap modal store
 */
export const useSwapStore = create<SwapState>((set) => ({
  isSwapOpen: false,
  selectedInput: DEFAULT_TOKENS.SOL,
  selectedOutput: DEFAULT_TOKENS.USDC,
  mode: 'default',
  
  openSwap: (inputMint: string, outputMint: string, mode: 'default' | 'snipe' = 'default') => {
    set({
      isSwapOpen: true,
      selectedInput: inputMint,
      selectedOutput: outputMint,
      mode,
    });
    console.log(`🔄 Opening swap: ${inputMint.slice(0, 8)}... → ${outputMint.slice(0, 8)}... (${mode} mode)`);
  },
  
  closeSwap: () => {
    set({ isSwapOpen: false });
    console.log('❌ Closing swap modal');
  },
  
  swapTokens: () => {
    set((state) => ({
      selectedInput: state.selectedOutput,
      selectedOutput: state.selectedInput,
    }));
    console.log('🔄 Swapped input/output tokens');
  },
}));

/**
 * Hook to open buy modal (SOL → token)
 */
export const useOpenBuyModal = () => {
  const openSwap = useSwapStore((state) => state.openSwap);
  
  return (tokenMint: string) => {
    openSwap(DEFAULT_TOKENS.SOL, tokenMint);
  };
};

/**
 * Hook to open sell modal (token → SOL)
 */
export const useOpenSellModal = () => {
  const openSwap = useSwapStore((state) => state.openSwap);
  
  return (tokenMint: string) => {
    openSwap(tokenMint, DEFAULT_TOKENS.SOL);
  };
};

/**
 * Hook to open quick swap modal
 */
export const useOpenQuickSwap = () => {
  const openSwap = useSwapStore((state) => state.openSwap);
  
  return () => {
    openSwap(DEFAULT_TOKENS.SOL, DEFAULT_TOKENS.USDC);
  };
};
