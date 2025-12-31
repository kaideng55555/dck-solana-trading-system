import React, { useState, useMemo } from 'react';
import type { TokenStatusResult } from '../utils/tokenStatus';

export interface CoinInfo {
  address: string;
  name: string;
  symbol: string; // Token symbol (e.g., "DEGEN")
  logo: string;
  age: number; // in seconds
  marketCap: number;
  price: number;
  bondingProgress: number; // 0-100
  alive: boolean;
  // Explorer-specific fields
  hasSocials?: boolean;
  hasTwitter?: boolean;
  hasTelegram?: boolean;
  lpBurned?: boolean;
  mintDisabled?: boolean;
  freezeDisabled?: boolean;
  volume24h?: number;
  // Token status (enhanced security info)
  tokenStatus?: TokenStatusResult;
  // Computed fields
  isMigrated?: boolean; // True if graduated + authorities renounced
  isOnCurve?: boolean; // True until graduation (bondingProgress < 100)
  isFairLaunch?: boolean; // True if no presale/team allocation
  launchAgeMinutes?: number; // Time since launch in minutes
  launchTimestamp?: number; // Unix timestamp of token launch
}

export interface FilterState {
  hasSocials: boolean;
  lpBurned: boolean;
  mintAuthDisabled: boolean;
  freezeDisabled: boolean;
  migrated: boolean;
  onCurveOnly: boolean; // Filter to only bonding curve tokens
  fairLaunchOnly: boolean; // Filter to only fair launch tokens
  marketCapRange: [number, number];
  volumeRange: [number, number];
  ageRange: [number, number]; // in seconds
  bondingProgressRange: [number, number]; // 0-100
  sortBy: 'marketCap' | 'volume' | 'ageAsc' | 'ageDesc' | 'bonding' | 'launchAge';
}

export interface ExplorerFiltersResult {
  filteredResults: CoinInfo[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  sort: FilterState['sortBy'];
  setSort: (sort: FilterState['sortBy']) => void;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const DEFAULT_FILTERS: FilterState = {
  hasSocials: false,
  lpBurned: false,
  mintAuthDisabled: false,
  freezeDisabled: false,
  migrated: false,
  onCurveOnly: false,
  fairLaunchOnly: false,
  marketCapRange: [0, 1000000],
  volumeRange: [0, 100000],
  ageRange: [0, 86400], // 0 to 24 hours
  bondingProgressRange: [0, 100],
  sortBy: 'marketCap',
};

export const useExplorerFilters = (rawCoins: CoinInfo[]): ExplorerFiltersResult => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState<string>('');

  // Helper to update sort
  const setSort = (sort: FilterState['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy: sort }));
  };

  // Enrich coins with computed fields
  const enrichedCoins = useMemo(() => {
    return rawCoins.map(coin => {
      const now = Date.now();
      const launchTimestamp = coin.launchTimestamp || (now - coin.age * 1000);
      const launchAgeMinutes = Math.floor((now - launchTimestamp) / 60000);
      
      return {
        ...coin,
        // Computed fields
        isMigrated: coin.bondingProgress >= 100 && coin.lpBurned && coin.mintDisabled && coin.freezeDisabled,
        isOnCurve: coin.bondingProgress < 100,
        isFairLaunch: coin.isFairLaunch ?? (Math.random() > 0.3), // Mock: 70% fair launch
        launchAgeMinutes,
        launchTimestamp,
      };
    });
  }, [rawCoins]);

  // Apply filters and sorting with useMemo optimization
  const filteredResults = useMemo(() => {
    let result = [...enrichedCoins];

    // Search filter (ticker or address)
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        coin =>
          coin.name.toLowerCase().includes(query) ||
          coin.address.toLowerCase().includes(query)
      );
    }

    // Boolean filters
    if (filters.hasSocials) {
      result = result.filter(coin => coin.hasSocials === true);
    }
    if (filters.lpBurned) {
      result = result.filter(coin => coin.lpBurned === true);
    }
    if (filters.mintAuthDisabled) {
      result = result.filter(coin => coin.mintDisabled === true);
    }
    if (filters.freezeDisabled) {
      result = result.filter(coin => coin.freezeDisabled === true);
    }
    if (filters.migrated) {
      result = result.filter(coin => coin.isMigrated === true);
    }
    if (filters.onCurveOnly) {
      result = result.filter(coin => coin.isOnCurve === true);
    }
    if (filters.fairLaunchOnly) {
      result = result.filter(coin => coin.isFairLaunch === true);
    }

    // Range filters
    result = result.filter(
      coin =>
        coin.marketCap >= filters.marketCapRange[0] &&
        coin.marketCap <= filters.marketCapRange[1]
    );

    result = result.filter(
      coin =>
        coin.age >= filters.ageRange[0] &&
        coin.age <= filters.ageRange[1]
    );

    result = result.filter(
      coin =>
        (coin.volume24h ?? 0) >= filters.volumeRange[0] &&
        (coin.volume24h ?? 0) <= filters.volumeRange[1]
    );

    result = result.filter(
      coin =>
        coin.bondingProgress >= filters.bondingProgressRange[0] &&
        coin.bondingProgress <= filters.bondingProgressRange[1]
    );

    // Sorting
    switch (filters.sortBy) {
      case 'marketCap':
        result.sort((a, b) => b.marketCap - a.marketCap);
        break;
      case 'volume':
        result.sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
        break;
      case 'ageAsc':
        result.sort((a, b) => a.age - b.age);
        break;
      case 'ageDesc':
        result.sort((a, b) => b.age - a.age);
        break;
      case 'bonding':
        result.sort((a, b) => b.bondingProgress - a.bondingProgress);
        break;
      case 'launchAge':
        result.sort((a, b) => (a.launchAgeMinutes ?? 0) - (b.launchAgeMinutes ?? 0));
        break;
    }

    return result;
  }, [enrichedCoins, search, filters]);

  return {
    filteredResults,
    filters,
    setFilters,
    sort: filters.sortBy,
    setSort,
    search,
    setSearch,
  };
};

