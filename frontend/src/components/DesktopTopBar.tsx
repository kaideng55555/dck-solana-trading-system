/**
 * DesktopTopBar - Top navigation bar for desktop screens only
 * Hidden on mobile (< md breakpoint)
 * Full-width bar with search, network selector, and controls
 */

import React, { memo, useState, useCallback } from 'react';
import { WalletConnect } from './WalletConnect';
import { useOpenQuickSwap } from '../stores/swapStore';

type Network = 'mainnet' | 'devnet' | 'testnet';

interface DesktopTopBarProps {
  onSearch?: (query: string) => void;
  onNetworkChange?: (network: Network) => void;
  onRefresh?: () => void;
  onFilterToggle?: () => void;
  searchPlaceholder?: string;
}

export const DesktopTopBar: React.FC<DesktopTopBarProps> = memo(({
  onSearch,
  onNetworkChange,
  onRefresh,
  onFilterToggle,
  searchPlaceholder = 'Search tokens by name or address...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('mainnet');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const openQuickSwap = useOpenQuickSwap();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch]);

  const handleNetworkChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const network = e.target.value as Network;
    setSelectedNetwork(network);
    if (onNetworkChange) {
      onNetworkChange(network);
    }
  }, [onNetworkChange]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    // Reset spinning animation after 2 seconds
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [onRefresh]);

  return (
    <div className="hidden md:block sticky top-0 z-30 bg-[#0a0d11]/95 backdrop-blur-sm border-b border-cyan-500/20">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full px-4 py-2 pl-10 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder-gray-500 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all panel-shadow"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60">🔍</span>
        </div>

        {/* Network Selector */}
        <div className="relative">
          <select
            value={selectedNetwork}
            onChange={handleNetworkChange}
            className="px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium cursor-pointer hover:border-cyan-500/50 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all panel-shadow appearance-none pr-10"
          >
            <option value="mainnet">🌐 Mainnet</option>
            <option value="devnet">🔧 Devnet</option>
            <option value="testnet">🧪 Testnet</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60 pointer-events-none">▼</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 font-medium hover:bg-cyan-500/30 hover:border-cyan-500/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-neon panel-shadow flex items-center gap-2"
          title="Refresh data"
        >
          <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
          <span className="hidden lg:inline">Refresh</span>
        </button>

        {/* Filter Toggle */}
        <button
          onClick={onFilterToggle}
          className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-400 font-medium hover:bg-purple-500/30 hover:border-purple-500/60 transition-all btn-neon panel-shadow flex items-center gap-2"
          title="Toggle filters"
        >
          <span>⚙️</span>
          <span className="hidden lg:inline">Filters</span>
        </button>

        {/* Network Selector */}
        <div className="relative">
          <select
            value={selectedNetwork}
            onChange={handleNetworkChange}
            className="appearance-none px-4 py-2.5 pr-10 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-cyan-100 font-medium cursor-pointer hover:border-cyan-500/50 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            style={{
              boxShadow: '0 0 15px rgba(0, 245, 255, 0.1)',
            }}
          >
            <option value="mainnet">🟢 Mainnet</option>
            <option value="devnet">🟡 Devnet</option>
            <option value="testnet">🔵 Testnet</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
            ▼
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 bg-gray-900/50 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: '0 0 15px rgba(0, 245, 255, 0.1)',
          }}
          title="Refresh data"
        >
          <span 
            className={`text-xl ${isRefreshing ? 'inline-block animate-spin' : ''}`}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))',
            }}
          >
            🔄
          </span>
        </button>

        {/* Global Filter Button */}
        <button
          onClick={onFilterToggle}
          className="p-2.5 bg-gray-900/50 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
          style={{
            boxShadow: '0 0 15px rgba(0, 245, 255, 0.1)',
          }}
          title="Toggle filters"
        >
          <span 
            className="text-xl"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))',
            }}
          >
            ⚙️
          </span>
        </button>

        {/* Quick Swap Button */}
        <button
          onClick={openQuickSwap}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 rounded-lg hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-500/60 transition-all flex items-center gap-2 font-medium text-cyan-400"
          style={{
            boxShadow: '0 0 15px rgba(0, 245, 255, 0.2)',
          }}
          title="Quick swap SOL to USDC"
        >
          <span className="text-lg">⚡</span>
          <span className="hidden xl:inline">Quick Swap</span>
        </button>

        {/* Wallet Connect Button */}
        <WalletConnect variant="desktop" />
      </div>

      {/* Subtle bottom glow */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.3) 50%, transparent)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
});

DesktopTopBar.displayName = 'DesktopTopBar';

export default DesktopTopBar;
