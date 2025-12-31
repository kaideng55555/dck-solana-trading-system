/**
 * Alerts Store (D13 + D14 A1)
 * 
 * Global alerts system for DCK Tools
 * Features:
 * - Alert queue management
 * - Auto-dismiss with configurable timeout
 * - Mute/unmute functionality
 * - Type-based filtering and styling
 * - Compatible with D10 SFX system
 * - History tracking with localStorage persistence
 * - Advanced filtering (categories, search, date range)
 * - Grouped history by date buckets
 */

import { create } from 'zustand';

// =============================================
// TYPES
// =============================================

export type AlertType = 'sniper' | 'wallet' | 'lp' | 'rug' | 'pnl' | 'system';
export type AlertLevel = 'info' | 'warning' | 'danger' | 'success';
export type DateRange = 'today' | '7d' | '30d' | 'all';

export interface AlertItem {
  id: string;
  type: AlertType;
  level: AlertLevel;
  message: string;
  timestamp: number;
  data?: any;
  duration?: number; // Auto-dismiss after N milliseconds (default 5000)
}

export interface AlertFilters {
  categories: AlertType[];
  search: string;
  dateRange: DateRange;
}

export interface AlertsState {
  // State
  alerts: AlertItem[];
  queue: AlertItem[];
  muted: boolean;
  history: AlertItem[];
  maxHistory: number;
  filters: AlertFilters;
  
  // Actions - Core
  addAlert: (alert: Omit<AlertItem, 'id' | 'timestamp'>) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
  muteAlerts: () => void;
  unmuteAlerts: () => void;
  toggleMute: () => void;
  
  // Actions - History
  addToHistory: (alert: AlertItem) => void;
  clearHistory: () => void;
  clearCategory: (type: AlertType) => void;
  
  // Actions - Filters
  setSearch: (text: string) => void;
  setCategories: (categories: AlertType[]) => void;
  setDateRange: (range: DateRange) => void;
  applyFilters: () => AlertItem[];
  
  // Selectors
  getGroupedHistory: () => {
    today: AlertItem[];
    yesterday: AlertItem[];
    thisWeek: AlertItem[];
    earlier: AlertItem[];
  };
  getFilteredHistory: () => AlertItem[];
  getActiveFilters: () => {
    search: string;
    categories: AlertType[];
    dateRange: DateRange;
  };
}

// =============================================
// LOCALSTORAGE HELPERS
// =============================================

const STORAGE_KEY_HISTORY = 'dck_alerts_history_v1';
const STORAGE_KEY_FILTERS = 'dck_alerts_filters_v1';
const STORAGE_KEY_MUTED = 'dck_alerts_muted_v1';
const STORAGE_KEY_MAX_HISTORY = 'dck_alerts_maxHistory_v1';

// History
const loadHistoryFromStorage = (): AlertItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load alert history:', error);
    return [];
  }
};

const saveHistoryToStorage = (history: AlertItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save alert history:', error);
  }
};

// Filters
const loadFiltersFromStorage = (): Partial<AlertFilters> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed || {};
  } catch (error) {
    console.error('Failed to load alert filters:', error);
    return {};
  }
};

const saveFiltersToStorage = (filters: AlertFilters): void => {
  try {
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save alert filters:', error);
  }
};

// Muted
const loadMutedFromStorage = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MUTED);
    if (!stored) return false;
    return stored === 'true';
  } catch (error) {
    console.error('Failed to load muted state:', error);
    return false;
  }
};

const saveMutedToStorage = (muted: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
  } catch (error) {
    console.error('Failed to save muted state:', error);
  }
};

// Max History
const loadMaxHistoryFromStorage = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MAX_HISTORY);
    if (!stored) return 5000;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 5000 : parsed;
  } catch (error) {
    console.error('Failed to load maxHistory:', error);
    return 5000;
  }
};

const saveMaxHistoryToStorage = (maxHistory: number): void => {
  try {
    localStorage.setItem(STORAGE_KEY_MAX_HISTORY, String(maxHistory));
  } catch (error) {
    console.error('Failed to save maxHistory:', error);
  }
};

// Hydration
const hydrateFromStorage = () => {
  const history = loadHistoryFromStorage();
  const filters = loadFiltersFromStorage();
  const muted = loadMutedFromStorage();
  const maxHistory = loadMaxHistoryFromStorage();

  return {
    history,
    muted,
    maxHistory,
    filters: {
      categories: filters.categories || [],
      search: filters.search || '',
      dateRange: (filters.dateRange || 'all') as DateRange,
    },
  };
};

// =============================================
// STORE
// =============================================

export const useAlertsStore = create<AlertsState>((set, get) => {
  // Hydrate initial state from storage
  const hydrated = hydrateFromStorage();

  return {
    // Initial state with hydration
    alerts: [],
    queue: [],
    muted: hydrated.muted,
    history: hydrated.history,
    maxHistory: hydrated.maxHistory,
    filters: hydrated.filters,

    // Add alert to queue
    addAlert: (alert) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();
      const duration = alert.duration || 5000;

      const newAlert: AlertItem = {
        id,
        timestamp,
        duration,
        ...alert,
      };

      set((state) => ({
        alerts: [...state.alerts, newAlert],
        queue: [...state.queue, newAlert],
      }));

      // Add to history
      get().addToHistory(newAlert);

      // Auto-dismiss after duration
      setTimeout(() => {
        get().removeAlert(id);
      }, duration);
    },

    // Remove alert
    removeAlert: (id) => {
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
        queue: state.queue.filter((a) => a.id !== id),
      }));
    },

    // Clear all alerts
    clearAllAlerts: () => {
      set({ alerts: [], queue: [] });
    },

    // Mute alerts (still shows but no sound)
    muteAlerts: () => {
      set({ muted: true });
      saveMutedToStorage(true);
    },

    // Unmute alerts
    unmuteAlerts: () => {
      set({ muted: false });
      saveMutedToStorage(false);
    },

    // Toggle mute
    toggleMute: () => {
      const newMuted = !get().muted;
      set({ muted: newMuted });
      saveMutedToStorage(newMuted);
    },

    // Add to history
    addToHistory: (alert) => {
      set((state) => {
        const newHistory = [...state.history, alert];
        
        // Trim if exceeds maxHistory
        const trimmedHistory = newHistory.length > state.maxHistory
          ? newHistory.slice(-state.maxHistory)
          : newHistory;
        
        // Save to localStorage AFTER trimming
        saveHistoryToStorage(trimmedHistory);
        
        return { history: trimmedHistory };
      });
    },

    // Clear history
    clearHistory: () => {
      set({ history: [] });
      saveHistoryToStorage([]);
    },

    // Clear specific category
    clearCategory: (type) => {
      set((state) => {
        const filtered = state.history.filter((a) => a.type !== type);
        saveHistoryToStorage(filtered);
        return { history: filtered };
      });
    },

    // Set search filter
    setSearch: (text) => {
      set((state) => {
        const newFilters = { ...state.filters, search: text };
        saveFiltersToStorage(newFilters);
        return { filters: newFilters };
      });
    },

    // Set categories filter
    setCategories: (categories) => {
      set((state) => {
        const newFilters = { ...state.filters, categories };
        saveFiltersToStorage(newFilters);
        return { filters: newFilters };
      });
    },

    // Set date range filter
    setDateRange: (range) => {
      set((state) => {
        const newFilters = { ...state.filters, dateRange: range };
        saveFiltersToStorage(newFilters);
        return { filters: newFilters };
      });
    },

    // Apply filters
    applyFilters: () => {
      const state = get();
      const { history, filters } = state;
      
      let filtered = [...history];
      
      // Filter by categories
      if (filters.categories.length > 0) {
        filtered = filtered.filter((alert) => 
          filters.categories.includes(alert.type)
        );
      }
      
      // Filter by search (message, type, and stringified data)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter((alert) => {
          const messageMatch = alert.message.toLowerCase().includes(searchLower);
          const typeMatch = alert.type.toLowerCase().includes(searchLower);
          
          // Search in data if present
          let dataMatch = false;
          if (alert.data) {
            try {
              const dataString = typeof alert.data === 'string' 
                ? alert.data 
                : JSON.stringify(alert.data);
              dataMatch = dataString.toLowerCase().includes(searchLower);
            } catch {
              // Ignore stringify errors
            }
          }
          
          return messageMatch || typeMatch || dataMatch;
        });
      }
      
      // Filter by date range (timezone-safe)
      const now = new Date();
      const msInDay = 24 * 60 * 60 * 1000;
      
      switch (filters.dateRange) {
        case 'today': {
          // Today at 00:00 in user's local timezone
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ).getTime();
          filtered = filtered.filter((alert) => alert.timestamp >= todayStart);
          break;
        }
        case '7d': {
          // Last 7 days
          const sevenDaysAgo = now.getTime() - (7 * msInDay);
          filtered = filtered.filter((alert) => alert.timestamp >= sevenDaysAgo);
          break;
        }
        case '30d': {
          // Last 30 days
          const thirtyDaysAgo = now.getTime() - (30 * msInDay);
          filtered = filtered.filter((alert) => alert.timestamp >= thirtyDaysAgo);
          break;
        }
        case 'all':
        default:
          // No date filtering
          break;
      }
      
      return filtered;
    },

    // Get grouped history
    getGroupedHistory: () => {
      const state = get();
      const filtered = state.applyFilters();
      
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);
      const weekStart = todayStart - (7 * 24 * 60 * 60 * 1000);
      
      const groups = {
        today: [] as AlertItem[],
        yesterday: [] as AlertItem[],
        thisWeek: [] as AlertItem[],
        earlier: [] as AlertItem[],
      };
      
      filtered.forEach((alert) => {
        if (alert.timestamp >= todayStart) {
          // Today (from 00:00 today onwards)
          groups.today.push(alert);
        } else if (alert.timestamp >= yesterdayStart) {
          // Yesterday (00:00 yesterday to 00:00 today)
          groups.yesterday.push(alert);
        } else if (alert.timestamp >= weekStart) {
          // This Week (last 7 days, excluding today and yesterday)
          groups.thisWeek.push(alert);
        } else {
          // Earlier (anything older than 7 days)
          groups.earlier.push(alert);
        }
      });
      
      // Sort each group by timestamp DESC (newest first)
      groups.today.sort((a, b) => b.timestamp - a.timestamp);
      groups.yesterday.sort((a, b) => b.timestamp - a.timestamp);
      groups.thisWeek.sort((a, b) => b.timestamp - a.timestamp);
      groups.earlier.sort((a, b) => b.timestamp - a.timestamp);
      
      return groups;
    },

    // Get filtered history (selector)
    getFilteredHistory: () => {
      return get().applyFilters();
    },

    // Get active filters (selector)
    getActiveFilters: () => {
      const { filters } = get();
      return {
        search: filters.search,
        categories: filters.categories,
        dateRange: filters.dateRange,
      };
    },
  };
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Get alert color based on level
 */
export const getAlertColor = (level: AlertLevel): string => {
  switch (level) {
    case 'success':
      return '#00FF55';
    case 'info':
      return '#00E4FF';
    case 'warning':
      return '#FF7A00';
    case 'danger':
      return '#FF3EBF';
    default:
      return '#FFFFFF';
  }
};

/**
 * Get alert icon based on type
 */
export const getAlertIcon = (type: AlertType): string => {
  switch (type) {
    case 'sniper':
      return '🎯';
    case 'wallet':
      return '💰';
    case 'lp':
      return '💧';
    case 'rug':
      return '🚨';
    case 'pnl':
      return '📈';
    case 'system':
      return '⚙️';
    default:
      return '🔔';
  }
};

/**
 * Get sound effect for alert
 */
export const getAlertSound = (type: AlertType, level: AlertLevel): string | null => {
  // Map alerts to D10 SFX
  if (level === 'danger' || type === 'rug') {
    return 'shotgun'; // High threat
  }
  if (level === 'success' || type === 'pnl') {
    return 'alert'; // Positive event
  }
  if (type === 'sniper') {
    return 'snipe'; // Snipe action
  }
  return null; // No sound for info/system
};
