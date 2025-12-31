/**
 * BuyModule - Token swap/buy interface
 * Compact panel for buying tokens with SOL
 * Mobile: Condensed input in TopBar
 * Desktop: Full panel in DesktopTopBar
 * Prepared for Jupiter/Jito integration
 */

import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';

interface TokenOption {
  address: string;
  symbol: string;
  name: string;
  logo: string;
  price: number; // in SOL
}

interface SwapQuote {
  inputAmount: number; // SOL
  outputAmount: number; // Tokens
  pricePerToken: number;
  slippage: number;
  networkFee: number; // SOL
  platformFee: number; // SOL
  totalFee: number; // SOL
  priceImpact: number; // percentage
  estimatedTime: number; // seconds
}

interface BuyModuleProps {
  variant?: 'mobile' | 'desktop';
  onSwap?: (quote: SwapQuote, tokenAddress: string) => void;
  defaultTokens?: TokenOption[];
}

// Mock token options (replace with real data)
const DEFAULT_TOKENS: TokenOption[] = [
  { address: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', logo: '◎', price: 1 },
  { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', logo: '💵', price: 0.01 },
  { address: '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT', symbol: 'DEGEN', name: 'Degen Coin', logo: '🚀', price: 0.0001 },
];

/**
 * Mock quote calculator (replace with Jupiter API)
 */
function calculateMockQuote(solAmount: number, token: TokenOption): SwapQuote {
  const outputAmount = solAmount / token.price;
  const networkFee = 0.000005; // 5000 lamports
  const platformFee = solAmount * 0.001; // 0.1% platform fee
  const totalFee = networkFee + platformFee;
  const priceImpact = solAmount > 1 ? Math.min(solAmount * 0.5, 5) : 0.1; // Mock price impact
  const slippage = 0.5; // 0.5% slippage tolerance

  return {
    inputAmount: solAmount,
    outputAmount,
    pricePerToken: token.price,
    slippage,
    networkFee,
    platformFee,
    totalFee,
    priceImpact,
    estimatedTime: 15,
  };
}

export const BuyModule: React.FC<BuyModuleProps> = memo(({
  variant = 'desktop',
  onSwap,
  defaultTokens = DEFAULT_TOKENS,
}) => {
  const [solAmount, setSolAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<TokenOption>(defaultTokens[2]); // Default to DEGEN
  const [isSwapping, setIsSwapping] = useState(false);
  const [showTokenMenu, setShowTokenMenu] = useState(false);

  // Calculate quote whenever amount or token changes
  const quote = useMemo(() => {
    const amount = parseFloat(solAmount);
    if (isNaN(amount) || amount <= 0) return null;
    return calculateMockQuote(amount, selectedToken);
  }, [solAmount, selectedToken]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSolAmount(value);
    }
  }, []);

  const handleQuickAmount = useCallback((amount: number) => {
    setSolAmount(amount.toString());
  }, []);

  const handleTokenSelect = useCallback((token: TokenOption) => {
    setSelectedToken(token);
    setShowTokenMenu(false);
  }, []);

  const handleSwap = useCallback(async () => {
    if (!quote) return;

    setIsSwapping(true);
    
    try {
      // Simulate swap delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSwap) {
        onSwap(quote, selectedToken.address);
      }
      
      // Reset after successful swap
      setSolAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  }, [quote, selectedToken, onSwap]);

  // Mobile variant - condensed
  if (variant === 'mobile') {
    return (
      <div className="w-full p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/30 rounded-lg panel-shadow">
        <div className="space-y-2">
          {/* Amount Input */}
          <div className="relative">
            <input
              type="text"
              value={solAmount}
              onChange={handleAmountChange}
              placeholder="0.1"
              className="w-full px-3 py-2 pr-16 bg-black/40 border border-cyan-500/30 rounded text-cyan-100 text-lg font-bold focus:border-cyan-500/60 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              SOL
            </span>
          </div>

          {/* Token Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTokenMenu(!showTokenMenu)}
              className="w-full px-3 py-2 bg-black/40 border border-cyan-500/30 rounded text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedToken.logo}</span>
                <span className="text-cyan-400 font-medium">{selectedToken.symbol}</span>
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {/* Token Dropdown */}
            {showTokenMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTokenMenu(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {defaultTokens.map((token) => (
                    <button
                      key={token.address}
                      onClick={() => handleTokenSelect(token)}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-b-0"
                    >
                      <span className="text-lg">{token.logo}</span>
                      <div className="flex-1 text-left">
                        <div className="text-cyan-400 font-medium text-sm">{token.symbol}</div>
                        <div className="text-gray-500 text-xs">{token.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-1">
            {[0.1, 0.5, 1, 5].map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                className="flex-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs hover:bg-cyan-500/20 transition-all"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!quote || isSwapping}
            className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-neon"
            style={{
              boxShadow: quote ? '0 0 20px rgba(236, 72, 153, 0.5)' : 'none',
            }}
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span>
                Swapping...
              </span>
            ) : (
              `Buy ${selectedToken.symbol}`
            )}
          </button>

          {/* Quote Summary */}
          {quote && (
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>You receive:</span>
                <span className="text-cyan-400 font-bold">
                  ~{quote.outputAmount.toFixed(4)} {selectedToken.symbol}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop variant - full panel
  return (
    <div className="relative">
      <div className="w-96 p-4 bg-gradient-to-br from-gray-900/95 to-purple-900/50 border border-cyan-500/30 rounded-xl backdrop-blur-sm panel-shadow"
        style={{
          boxShadow: '0 0 30px rgba(0, 245, 255, 0.2)',
        }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-cyan-400" style={{
              textShadow: '0 0 10px rgba(0, 245, 255, 0.6)',
            }}>
              ⚡ Quick Buy
            </h3>
            <button className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
              Settings ⚙️
            </button>
          </div>

          {/* Input Amount */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">You pay</label>
            <div className="relative">
              <input
                type="text"
                value={solAmount}
                onChange={handleAmountChange}
                placeholder="0.0"
                className="w-full px-4 py-3 pr-20 bg-black/40 border border-cyan-500/30 rounded-lg text-cyan-100 text-2xl font-bold focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                style={{
                  boxShadow: '0 0 15px rgba(0, 245, 255, 0.1)',
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-lg border border-cyan-500/40">
                  <span className="text-lg">◎</span>
                  <span className="text-cyan-400 font-bold">SOL</span>
                </div>
              </div>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {[0.1, 0.5, 1, 5, 10].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="flex-1 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/40 rounded-full">
              <span className="text-xl">⇅</span>
            </div>
          </div>

          {/* Output Token */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">You receive</label>
            <div className="relative">
              <button
                onClick={() => setShowTokenMenu(!showTokenMenu)}
                className="w-full px-4 py-3 bg-black/40 border border-cyan-500/30 rounded-lg flex items-center justify-between hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedToken.logo}</span>
                  <div className="text-left">
                    <div className="text-cyan-400 font-bold">{selectedToken.symbol}</div>
                    <div className="text-gray-500 text-xs">{selectedToken.name}</div>
                  </div>
                </div>
                <span className="text-gray-400">▼</span>
              </button>

              {/* Estimated Output */}
              {quote && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right pointer-events-none">
                  <div className="text-cyan-400 font-bold text-lg">
                    ~{quote.outputAmount.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Token Dropdown */}
              {showTokenMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowTokenMenu(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    {defaultTokens.map((token) => (
                      <button
                        key={token.address}
                        onClick={() => handleTokenSelect(token)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-b-0"
                      >
                        <span className="text-2xl">{token.logo}</span>
                        <div className="flex-1 text-left">
                          <div className="text-cyan-400 font-bold">{token.symbol}</div>
                          <div className="text-gray-500 text-sm">{token.name}</div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          {token.price} SOL
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quote Details */}
          {quote && (
            <div className="p-3 bg-black/30 border border-cyan-500/20 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Price per token:</span>
                <span className="text-cyan-400 font-medium">{quote.pricePerToken.toFixed(8)} SOL</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Slippage tolerance:</span>
                <span className="text-yellow-400">{quote.slippage}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Network fee:</span>
                <span>{quote.networkFee.toFixed(6)} SOL</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Platform fee (0.1%):</span>
                <span>{quote.platformFee.toFixed(6)} SOL</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Price impact:</span>
                <span className={quote.priceImpact > 2 ? 'text-red-400' : 'text-green-400'}>
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="pt-2 border-t border-cyan-500/20 flex justify-between font-bold">
                <span className="text-gray-300">Total cost:</span>
                <span className="text-cyan-400">
                  {(quote.inputAmount + quote.totalFee).toFixed(6)} SOL
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!quote || isSwapping}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-pink-600 hover:to-purple-600 btn-neon"
            style={{
              boxShadow: quote ? '0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)' : 'none',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin text-2xl">⚡</span>
                Processing Swap...
              </span>
            ) : quote ? (
              `Swap ${quote.inputAmount} SOL → ${quote.outputAmount.toFixed(2)} ${selectedToken.symbol}`
            ) : (
              'Enter amount to swap'
            )}
          </button>

          {/* Info Footer */}
          <div className="text-xs text-center text-gray-500">
            ⚡ Powered by Jito • Jupiter aggregator
          </div>
        </div>
      </div>
    </div>
  );
});

BuyModule.displayName = 'BuyModule';

export default BuyModule;
