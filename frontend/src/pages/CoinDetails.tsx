import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOpenBuyModal, useOpenSellModal } from '../stores/swapStore';
import { SnipeButton } from '../components/SnipeButton';

interface Holder {
  address: string;
  percentage: number;
  amount: number;
}

interface CoinDetailsData {
  address: string;
  name: string;
  symbol: string;
  logo: string;
  marketCap: number;
  volume24h: number;
  price: number;
  age: number;
  bondingProgress: number;
  isMigrated: boolean;
  isOnCurve: boolean;
  lpBurned: boolean;
  mintAuthDisabled: boolean;
  freezeDisabled: boolean;
  holders: Holder[];
  priceHistory: Array<{ time: string; price: number }>;
}

export const CoinDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const openBuyModal = useOpenBuyModal();
  const openSellModal = useOpenSellModal();
  const [coin, setCoin] = useState<CoinDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const fetchCoinDetails = async () => {
      setIsLoading(true);
      
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockCoin: CoinDetailsData = {
        address: address || '',
        name: 'Degen Coin',
        symbol: 'DEGEN',
        logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${address}`,
        marketCap: 1250000,
        volume24h: 850000,
        price: 0.00012345,
        age: 7200, // 2 hours
        bondingProgress: 67.5,
        isMigrated: false,
        isOnCurve: true,
        lpBurned: true,
        mintAuthDisabled: true,
        freezeDisabled: false,
        holders: [
          { address: '7x1g...k9mP', percentage: 12.5, amount: 125000000 },
          { address: '9Zk2...m3nQ', percentage: 8.3, amount: 83000000 },
          { address: 'B4vE...x7wT', percentage: 6.7, amount: 67000000 },
          { address: 'Qm8L...r2sK', percentage: 5.4, amount: 54000000 },
          { address: 'Fn3P...w9xY', percentage: 4.8, amount: 48000000 },
          { address: 'Ht6R...v1zN', percentage: 3.9, amount: 39000000 },
          { address: 'Kp2M...c5dL', percentage: 3.2, amount: 32000000 },
          { address: 'Wr7Q...b4jF', percentage: 2.8, amount: 28000000 },
          { address: 'Vs9T...h8gA', percentage: 2.1, amount: 21000000 },
          { address: 'Yx4N...p6eR', percentage: 1.9, amount: 19000000 },
        ],
        priceHistory: [
          { time: '00:00', price: 0.00008123 },
          { time: '04:00', price: 0.00009456 },
          { time: '08:00', price: 0.00011234 },
          { time: '12:00', price: 0.00010987 },
          { time: '16:00', price: 0.00012456 },
          { time: '20:00', price: 0.00012345 },
        ],
      };

      setCoin(mockCoin);
      setIsLoading(false);
      
      // Trigger fade-in animation
      setTimeout(() => setFadeIn(true), 50);
    };

    fetchCoinDetails();
  }, [address]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0d11] via-[#0d1117] to-purple-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">💎</div>
          <p className="text-cyan-400 font-bold text-lg">Loading token details...</p>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0d11] via-[#0d1117] to-purple-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-red-400 font-bold text-lg mb-4">Token not found</p>
          <button
            onClick={() => navigate('/explorer')}
            className="px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
          >
            ← Back to Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-[#0a0d11] via-[#0d1117] to-purple-900/10 transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0d11]/95 backdrop-blur-sm border-b border-cyan-500/20 panel-shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/explorer')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Explorer</span>
          </button>

          <div className="flex items-center gap-4">
            <img
              src={coin.logo}
              alt={coin.symbol}
              className="w-16 h-16 rounded-full border-2 border-cyan-400/40"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="32" fill="%2300F5FF"/><text x="32" y="42" text-anchor="middle" fill="%23000" font-size="28" font-weight="bold">${coin.symbol.charAt(0)}</text></svg>`;
              }}
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text-cyan-pink">
                ${coin.symbol}
              </h1>
              <p className="text-sm md:text-base text-gray-400">{coin.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile: Single Column, Desktop: 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Key Stats Card */}
            <div className="bg-gray-900/40 border border-cyan-500/20 rounded-xl p-6 panel-shadow">
              <h2 className="text-xl font-bold gradient-text-cyan-pink mb-4 flex items-center gap-2">
                <span>📊</span> Key Metrics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                  <div className="text-lg font-bold text-cyan-400">
                    ${formatMarketCap(coin.marketCap)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                  <div className="text-lg font-bold text-pink-400">
                    ${formatMarketCap(coin.volume24h)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Price</div>
                  <div className="text-lg font-bold text-purple-400 font-mono">
                    ${coin.price.toFixed(8)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Age</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {formatAge(coin.age)}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Chart Card */}
            <div className="bg-gray-900/40 border border-cyan-500/20 rounded-xl p-6 panel-shadow">
              <h2 className="text-xl font-bold gradient-text-cyan-pink mb-4 flex items-center gap-2">
                <span>📈</span> Price Chart (24h)
              </h2>
              
              {/* Mock Static Chart */}
              <div className="relative h-64 bg-gray-800/50 rounded-lg border border-cyan-500/10 p-4">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(0,245,255,0.1)" strokeWidth="1" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(0,245,255,0.1)" strokeWidth="1" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(0,245,255,0.1)" strokeWidth="1" />
                  
                  {/* Price line */}
                  <polyline
                    points="0,180 67,140 133,100 200,110 267,60 333,65 400,65"
                    fill="none"
                    stroke="url(#priceGradient)"
                    strokeWidth="3"
                  />
                  
                  {/* Area fill */}
                  <polygon
                    points="0,180 67,140 133,100 200,110 267,60 333,65 400,65 400,200 0,200"
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00F5FF" />
                      <stop offset="100%" stopColor="#FF41D6" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0,245,255,0.3)" />
                      <stop offset="100%" stopColor="rgba(0,245,255,0.0)" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Time labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-[10px] text-gray-500">
                  {coin.priceHistory.map((point, i) => (
                    <span key={i}>{point.time}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Holders Card */}
            <div className="bg-gray-900/40 border border-cyan-500/20 rounded-xl p-6 panel-shadow">
              <h2 className="text-xl font-bold gradient-text-cyan-pink mb-4 flex items-center gap-2">
                <span>👥</span> Top 10 Holders
              </h2>
              
              <div className="space-y-2">
                {coin.holders.map((holder, index) => (
                  <div
                    key={holder.address}
                    className="flex items-center gap-3 bg-gray-800/40 border border-cyan-500/10 rounded-lg p-3 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono text-gray-300 truncate">
                        {holder.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {holder.amount.toLocaleString()} tokens
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="text-base font-bold text-cyan-400">
                        {holder.percentage.toFixed(1)}%
                      </div>
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-pink-500"
                          style={{ width: `${holder.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Security & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Security Status Card */}
            <div className="bg-gray-900/40 border border-cyan-500/20 rounded-xl p-6 panel-shadow">
              <h2 className="text-xl font-bold gradient-text-cyan-pink mb-4 flex items-center gap-2">
                <span>🛡️</span> Security
              </h2>
              
              <div className="space-y-3">
                {/* Migration Status */}
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  coin.isMigrated
                    ? 'bg-pink-500/10 border-pink-500/40'
                    : 'bg-gray-800/40 border-gray-700/40'
                }`}>
                  <span className="text-sm text-gray-300">Migrated</span>
                  <span className={`text-lg ${coin.isMigrated ? 'text-pink-400' : 'text-gray-500'}`}>
                    {coin.isMigrated ? '🚀' : '⏳'}
                  </span>
                </div>

                {/* LP Burned */}
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  coin.lpBurned
                    ? 'bg-green-500/10 border-green-500/40'
                    : 'bg-red-500/10 border-red-500/40'
                }`}>
                  <span className="text-sm text-gray-300">LP Burned</span>
                  <span className={`text-lg ${coin.lpBurned ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.lpBurned ? '🔥' : '❌'}
                  </span>
                </div>

                {/* Mint Authority */}
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  coin.mintAuthDisabled
                    ? 'bg-green-500/10 border-green-500/40'
                    : 'bg-red-500/10 border-red-500/40'
                }`}>
                  <span className="text-sm text-gray-300">Mint Disabled</span>
                  <span className={`text-lg ${coin.mintAuthDisabled ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.mintAuthDisabled ? '🔒' : '⚠️'}
                  </span>
                </div>

                {/* Freeze Authority */}
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  coin.freezeDisabled
                    ? 'bg-green-500/10 border-green-500/40'
                    : 'bg-red-500/10 border-red-500/40'
                }`}>
                  <span className="text-sm text-gray-300">Freeze Disabled</span>
                  <span className={`text-lg ${coin.freezeDisabled ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.freezeDisabled ? '❄️' : '⚠️'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bonding Curve Card */}
            {coin.isOnCurve && (
              <div className="bg-gray-900/40 border border-cyan-500/20 rounded-xl p-6 panel-shadow">
                <h2 className="text-xl font-bold gradient-text-cyan-pink mb-4 flex items-center gap-2">
                  <span>📈</span> Bonding Curve
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-2xl font-bold text-cyan-400">
                      {coin.bondingProgress.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${coin.bondingProgress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>

                  <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                    <p className="text-xs text-cyan-400">
                      {coin.bondingProgress < 100 
                        ? `${(100 - coin.bondingProgress).toFixed(1)}% until migration to Raydium`
                        : 'Ready to migrate!'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trading Actions Card */}
            <div className="bg-gray-900/40 border border-cyan-500/20 rounded-xl p-6 panel-shadow">
              <h2 className="text-xl font-bold gradient-text-cyan-pink mb-4 flex items-center gap-2">
                <span>💰</span> Trade
              </h2>
              
              <div className="space-y-3">
                {/* Snipe Button (for fresh tokens < 5 min) */}
                {coin.age < 300 && (
                  <div className="mb-3">
                    <SnipeButton 
                      tokenMint={coin.address}
                      createdAt={Date.now() - (coin.age * 1000)}
                    />
                  </div>
                )}

                <button
                  onClick={() => openBuyModal(coin.address)}
                  className="w-full py-4 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 rounded-lg border border-green-500/40 font-bold text-lg hover:from-green-500/30 hover:to-green-600/30 hover:border-green-500/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    boxShadow: '0 0 15px rgba(34,197,94,0.2)',
                  }}
                >
                  🟢 Buy ${coin.symbol}
                </button>
                
                <button
                  onClick={() => openSellModal(coin.address)}
                  className="w-full py-4 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-lg border border-red-500/40 font-bold text-lg hover:from-red-500/30 hover:to-red-600/30 hover:border-red-500/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    boxShadow: '0 0 15px rgba(239,68,68,0.2)',
                  }}
                >
                  🔴 Sell ${coin.symbol}
                </button>

                <div className="pt-3 border-t border-gray-700/40">
                  <p className="text-xs text-center text-gray-500">
                    💡 Powered by Jupiter + Jito
                  </p>
                </div>
              </div>
            </div>

            {/* Token Address Card */}
            <div className="bg-gray-900/40 border border-cyan-500/20 rounded-xl p-6 panel-shadow">
              <h2 className="text-xl font-bold gradient-text-cyan-pink mb-4 flex items-center gap-2">
                <span>🔗</span> Contract
              </h2>
              
              <div className="bg-gray-800/40 border border-cyan-500/10 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Token Address</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-cyan-400 truncate">
                    {coin.address}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(coin.address)}
                    className="flex-shrink-0 p-2 hover:bg-cyan-500/10 rounded transition-colors"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function formatMarketCap(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

function formatAge(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''}`;
  return `${seconds} sec`;
}

export default CoinDetails;
