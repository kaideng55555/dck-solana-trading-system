/**
 * ExplorerQuickFilters - Desktop-only quick filter sidebar
 * Provides fast access to common filters with neon pill-style toggles
 * Mobile: hidden (filters accessed via main filter button)
 */

import React, { useState } from 'react';
import type { FilterState } from '../hooks/useExplorerFilters';

interface ExplorerQuickFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const ExplorerQuickFilters: React.FC<ExplorerQuickFiltersProps> = ({
  filters,
  setFilters,
}) => {
  // Local state for range inputs
  const [marketCapMin, setMarketCapMin] = useState(filters.marketCapRange[0]);
  const [marketCapMax, setMarketCapMax] = useState(filters.marketCapRange[1]);
  const [volumeMin, setVolumeMin] = useState(filters.volumeRange[0]);
  const [volumeMax, setVolumeMax] = useState(filters.volumeRange[1]);
  const [ageMinHours, setAgeMinHours] = useState(Math.floor(filters.ageRange[0] / 3600));
  const [ageMaxHours, setAgeMaxHours] = useState(Math.floor(filters.ageRange[1] / 3600));

  // Toggle pill handler
  const toggleFilter = (key: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Apply range filter with debounce-like behavior (on blur)
  const applyMarketCapRange = () => {
    setFilters(prev => ({
      ...prev,
      marketCapRange: [marketCapMin, marketCapMax],
    }));
  };

  const applyVolumeRange = () => {
    setFilters(prev => ({
      ...prev,
      volumeRange: [volumeMin, volumeMax],
    }));
  };

  const applyAgeRange = () => {
    setFilters(prev => ({
      ...prev,
      ageRange: [ageMinHours * 3600, ageMaxHours * 3600],
    }));
  };

  // Pill button component
  const FilterPill: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-200
        border
        ${
          active
            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(0,245,255,0.5)]'
            : 'bg-gray-900/40 border-gray-700/40 text-gray-400 hover:border-cyan-500/30 hover:text-cyan-400'
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <aside
      className="hidden md:block w-64 shrink-0 sticky top-4 h-fit"
      style={{ maxHeight: 'calc(100vh - 2rem)' }}
    >
      <div
        className="
          bg-gradient-to-br from-gray-900 via-black to-gray-900
          border border-cyan-500/20 rounded-lg p-4
          shadow-lg overflow-y-auto
        "
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="mb-4 pb-3 border-b border-cyan-500/20">
          <h3 className="text-lg font-bold text-cyan-400 text-glow-cyan">
            ⚡ Quick Filters
          </h3>
        </div>

        {/* Quick Toggle Pills */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Security & Status
          </h4>
          <div className="flex flex-col gap-2">
            <FilterPill
              label="LP Burned"
              active={filters.lpBurned}
              onClick={() => toggleFilter('lpBurned')}
            />
            <FilterPill
              label="Mint Auth Disabled"
              active={filters.mintAuthDisabled}
              onClick={() => toggleFilter('mintAuthDisabled')}
            />
            <FilterPill
              label="Freeze Disabled"
              active={filters.freezeDisabled}
              onClick={() => toggleFilter('freezeDisabled')}
            />
            <FilterPill
              label="Migrated"
              active={filters.migrated}
              onClick={() => toggleFilter('migrated')}
            />
            <FilterPill
              label="Has Socials"
              active={filters.hasSocials}
              onClick={() => toggleFilter('hasSocials')}
            />
          </div>
        </div>

        {/* Market Cap Range */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Market Cap
          </h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400">Min ($)</label>
              <input
                type="number"
                value={marketCapMin}
                onChange={(e) => setMarketCapMin(Number(e.target.value))}
                onBlur={applyMarketCapRange}
                className="
                  w-full px-3 py-1.5 mt-1
                  bg-gray-900/60 border border-gray-700/40
                  rounded text-sm text-gray-200
                  focus:border-cyan-500/60 focus:outline-none
                  transition-colors
                "
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max ($)</label>
              <input
                type="number"
                value={marketCapMax}
                onChange={(e) => setMarketCapMax(Number(e.target.value))}
                onBlur={applyMarketCapRange}
                className="
                  w-full px-3 py-1.5 mt-1
                  bg-gray-900/60 border border-gray-700/40
                  rounded text-sm text-gray-200
                  focus:border-cyan-500/60 focus:outline-none
                  transition-colors
                "
                placeholder="1000000"
              />
            </div>
          </div>
        </div>

        {/* Volume 24h Range */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Volume 24h
          </h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400">Min ($)</label>
              <input
                type="number"
                value={volumeMin}
                onChange={(e) => setVolumeMin(Number(e.target.value))}
                onBlur={applyVolumeRange}
                className="
                  w-full px-3 py-1.5 mt-1
                  bg-gray-900/60 border border-gray-700/40
                  rounded text-sm text-gray-200
                  focus:border-cyan-500/60 focus:outline-none
                  transition-colors
                "
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max ($)</label>
              <input
                type="number"
                value={volumeMax}
                onChange={(e) => setVolumeMax(Number(e.target.value))}
                onBlur={applyVolumeRange}
                className="
                  w-full px-3 py-1.5 mt-1
                  bg-gray-900/60 border border-gray-700/40
                  rounded text-sm text-gray-200
                  focus:border-cyan-500/60 focus:outline-none
                  transition-colors
                "
                placeholder="100000"
              />
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Token Age (hours)
          </h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400">Min (hours)</label>
              <input
                type="number"
                value={ageMinHours}
                onChange={(e) => setAgeMinHours(Number(e.target.value))}
                onBlur={applyAgeRange}
                className="
                  w-full px-3 py-1.5 mt-1
                  bg-gray-900/60 border border-gray-700/40
                  rounded text-sm text-gray-200
                  focus:border-cyan-500/60 focus:outline-none
                  transition-colors
                "
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max (hours)</label>
              <input
                type="number"
                value={ageMaxHours}
                onChange={(e) => setAgeMaxHours(Number(e.target.value))}
                onBlur={applyAgeRange}
                className="
                  w-full px-3 py-1.5 mt-1
                  bg-gray-900/60 border border-gray-700/40
                  rounded text-sm text-gray-200
                  focus:border-cyan-500/60 focus:outline-none
                  transition-colors
                "
                placeholder="24"
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setFilters({
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
              sortBy: filters.sortBy, // Keep current sort
            });
            setMarketCapMin(0);
            setMarketCapMax(1000000);
            setVolumeMin(0);
            setVolumeMax(100000);
            setAgeMinHours(0);
            setAgeMaxHours(24);
          }}
          className="
            w-full px-4 py-2 mt-4
            bg-gray-800/60 border border-gray-700/40
            rounded-lg text-sm font-medium text-gray-400
            hover:border-cyan-500/40 hover:text-cyan-400
            transition-all duration-200
          "
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
};
