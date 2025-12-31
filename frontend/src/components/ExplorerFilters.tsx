import React, { useState } from 'react';
import type { FilterState } from '../hooks/useExplorerFilters';

interface ExplorerFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
}

export const ExplorerFilters: React.FC<ExplorerFiltersProps> = ({
  filters,
  setFilters,
  search,
  setSearch,
  isOpen,
  onClose,
  resultCount,
}) => {
  // Local state for range inputs (to avoid lag on slider drag)
  const [marketCapRange, setMarketCapRange] = useState(filters.marketCapRange);
  const [volumeRange, setVolumeRange] = useState(filters.volumeRange);
  const [ageRange, setAgeRange] = useState(filters.ageRange);

  const handleApply = () => {
    setFilters(prev => ({
      ...prev,
      marketCapRange,
      volumeRange,
      ageRange,
    }));
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      hasSocials: false,
      lpBurned: false,
      mintAuthDisabled: false,
      freezeDisabled: false,
      migrated: false,
      onCurveOnly: false,
      fairLaunchOnly: false,
      marketCapRange: [0, 1000000],
      volumeRange: [0, 100000],
      ageRange: [0, 86400],
      bondingProgressRange: [0, 100],
      sortBy: 'marketCap',
    };
    setFilters(defaultFilters);
    setMarketCapRange(defaultFilters.marketCapRange);
    setVolumeRange(defaultFilters.volumeRange);
    setAgeRange(defaultFilters.ageRange);
    setSearch('');
  };

  const toggleFilter = (key: keyof FilterState) => {
    if (typeof filters[key] === 'boolean') {
      setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return `${value}`;
  };

  const formatAge = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    if (hours >= 24) return `${Math.floor(hours / 24)}d`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const FilterContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
        <div>
          <h2 className="text-xl font-bold gradient-text-cyan-pink">🔍 Filters</h2>
          <p className="text-xs text-cyan-400/60 mt-1">{resultCount} results</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-cyan-400 hover:text-pink-400 transition-colors text-2xl leading-none"
          aria-label="Close filters"
        >
          ×
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            🔎 Search Token
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or address..."
            className="w-full px-3 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 panel-shadow"
          />
        </div>

        {/* Boolean Filters */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-3">
            ✅ Security Checks
          </label>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasSocials}
                onChange={() => toggleFilter('hasSocials')}
                className="w-4 h-4 rounded border-cyan-500/50 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                Has Socials 🌐
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.lpBurned}
                onChange={() => toggleFilter('lpBurned')}
                className="w-4 h-4 rounded border-cyan-500/50 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                LP Burned 🔥
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.mintAuthDisabled}
                onChange={() => toggleFilter('mintAuthDisabled')}
                className="w-4 h-4 rounded border-cyan-500/50 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                Mint Auth Disabled 🔒
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.freezeDisabled}
                onChange={() => toggleFilter('freezeDisabled')}
                className="w-4 h-4 rounded border-cyan-500/50 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                Freeze Disabled ❄️
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.migrated}
                onChange={() => toggleFilter('migrated')}
                className="w-4 h-4 rounded border-cyan-500/50 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                Migrated to Raydium 🚀
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.onCurveOnly}
                onChange={() => toggleFilter('onCurveOnly')}
                className="w-4 h-4 rounded border-cyan-500/50 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                On Bonding Curve 📈
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.fairLaunchOnly}
                onChange={() => toggleFilter('fairLaunchOnly')}
                className="w-4 h-4 rounded border-cyan-500/50 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                Fair Launch Only ✨
              </span>
            </label>
          </div>
        </div>

        {/* Bonding Progress Range */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            📈 Bonding Progress
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span>{filters.bondingProgressRange?.[0] ?? 0}%</span>
            <span className="flex-1 text-center">to</span>
            <span>{filters.bondingProgressRange?.[1] ?? 100}%</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.bondingProgressRange?.[0] ?? 0}
              onChange={(e) => {
                const newRange: [number, number] = [
                  Number(e.target.value),
                  filters.bondingProgressRange?.[1] ?? 100
                ];
                setFilters(prev => ({ ...prev, bondingProgressRange: newRange }));
              }}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.bondingProgressRange?.[1] ?? 100}
              onChange={(e) => {
                const newRange: [number, number] = [
                  filters.bondingProgressRange?.[0] ?? 0,
                  Number(e.target.value)
                ];
                setFilters(prev => ({ ...prev, bondingProgressRange: newRange }));
              }}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-pink"
            />
          </div>
        </div>

        {/* Market Cap Range */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            💰 Market Cap
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span>{formatMarketCap(marketCapRange[0])}</span>
            <span className="flex-1 text-center">to</span>
            <span>{formatMarketCap(marketCapRange[1])}</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={marketCapRange[0]}
              onChange={(e) => setMarketCapRange([Number(e.target.value), marketCapRange[1]])}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={marketCapRange[1]}
              onChange={(e) => setMarketCapRange([marketCapRange[0], Number(e.target.value)])}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-pink"
            />
          </div>
        </div>

        {/* Volume Range */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            📊 Volume 24h
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span>{formatVolume(volumeRange[0])}</span>
            <span className="flex-1 text-center">to</span>
            <span>{formatVolume(volumeRange[1])}</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={volumeRange[0]}
              onChange={(e) => setVolumeRange([Number(e.target.value), volumeRange[1]])}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={volumeRange[1]}
              onChange={(e) => setVolumeRange([volumeRange[0], Number(e.target.value)])}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-pink"
            />
          </div>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            ⏱️ Token Age
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span>{formatAge(ageRange[0])}</span>
            <span className="flex-1 text-center">to</span>
            <span>{formatAge(ageRange[1])}</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="86400"
              step="300"
              value={ageRange[0]}
              onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
            <input
              type="range"
              min="0"
              max="86400"
              step="300"
              value={ageRange[1]}
              onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
              className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer slider-pink"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-cyan-500/30 space-y-2">
        <button
          onClick={handleApply}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 btn-neon"
        >
          ✅ Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="w-full py-2.5 bg-gray-800/50 border border-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-700/50 hover:border-gray-600 hover:text-white transition-all duration-200"
        >
          🔄 Reset All
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      <div className="md:hidden">
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={onClose}
          />
        )}

        {/* Bottom Sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-cyan-500/30 rounded-t-2xl z-50 transition-transform duration-300 max-h-[85vh] flex flex-col ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{
            boxShadow: '0 -4px 20px rgba(0, 245, 255, 0.3)',
          }}
        >
          <FilterContent />
        </div>
      </div>

      {/* Desktop: Left Sidebar */}
      <div className="hidden md:block">
        <div
          className={`fixed left-0 top-0 h-screen bg-gray-900 border-r border-cyan-500/30 z-30 transition-transform duration-300 w-80 flex flex-col ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            boxShadow: '4px 0 20px rgba(0, 245, 255, 0.2)',
          }}
        >
          <FilterContent />
        </div>

        {/* Desktop Backdrop (optional, for consistency) */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 animate-fadeIn"
            onClick={onClose}
          />
        )}
      </div>

      {/* Custom slider styles */}
      <style>{`
        .slider-cyan::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00F5FF, #00D4E6);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0, 245, 255, 0.6);
        }

        .slider-cyan::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00F5FF, #00D4E6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(0, 245, 255, 0.6);
        }

        .slider-pink::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF41D6, #E91E63);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(255, 65, 214, 0.6);
        }

        .slider-pink::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF41D6, #E91E63);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(255, 65, 214, 0.6);
        }

        .slider-cyan::-webkit-slider-track,
        .slider-pink::-webkit-slider-track {
          background: rgba(0, 245, 255, 0.1);
          border: 1px solid rgba(0, 245, 255, 0.3);
        }

        .slider-cyan::-moz-range-track,
        .slider-pink::-moz-range-track {
          background: rgba(0, 245, 255, 0.1);
          border: 1px solid rgba(0, 245, 255, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
