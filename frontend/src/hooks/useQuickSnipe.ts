import { useSwapStore } from "../stores/swapStore";

export function useQuickSnipe() {
  const openSwap = useSwapStore((s) => s.openSwap);

  const openQuickSnipe = (tokenMint: string) => {
    const SOL_MINT = "So11111111111111111111111111111111111111112";

    openSwap(SOL_MINT, tokenMint, "snipe");

    // SwapWidget will automatically apply snipe presets when mode === "snipe"
  };

  return { openQuickSnipe };
}
