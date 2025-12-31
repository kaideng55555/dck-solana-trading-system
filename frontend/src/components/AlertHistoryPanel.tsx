/**
 * AlertHistoryPanel Component (D14 A4)
 * 
 * Full alerts history panel with graffiti neon HUD styling
 * Features:
 * - Graffiti header with spray paint drips
 * - Filter bar (search, category chips, date range tabs)
 * - Grouped history display (Today, Yesterday, This Week, Earlier)
 * - Clearing controls with sound effects
 * - No mock data - uses alertsStore
 */

import React, { useState } from 'react';
import { useAlertsStore, type AlertItem, type AlertType, type DateRange } from '../stores/alertsStore';
import { AlertTag } from './AlertTag';
import { useSFX } from '../sfx/useSFX';

type HistoryGroups = {
  today: AlertItem[];
  yesterday: AlertItem[];
  thisWeek: AlertItem[];
  earlier: AlertItem[];
};

const CATEGORY_OPTIONS: AlertType[] = ['sniper', 'wallet', 'lp', 'rug', 'pnl', 'system'];
const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All' },
];

export const AlertHistoryPanel: React.FC = () => {
  const history = useAlertsStore((s) => s.history);
  const getGroupedHistory = useAlertsStore((s) => s.getGroupedHistory);
  const setSearch = useAlertsStore((s) => s.setSearch);
  const setCategories = useAlertsStore((s) => s.setCategories);
  const filters = useAlertsStore((s) => s.filters);
  const setDateRange = useAlertsStore((s) => s.setDateRange);
  const clearCategory = useAlertsStore((s) => s.clearCategory);
  const clearHistory = useAlertsStore((s) => s.clearHistory);
  const { play } = useSFX();

  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(true);

  const groupedHistory = getGroupedHistory();

  const handleSearchChange = (text: string) => {
    setSearchInput(text);
    setSearch(text);
  };

  const toggleCategory = (category: AlertType) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setCategories(newCategories);
  };

  const handleClearCategory = (category: AlertType) => {
    clearCategory(category);
    play('alert');
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all alert history? This cannot be undone.')) {
      clearHistory();
      play('shotgun');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes sprayDrip {
            0%, 100% { transform: translateY(-5px); opacity: 0.8; }
            50% { transform: translateY(5px); opacity: 1; }
          }

          @keyframes sprayBurst {
            0% { transform: scale(0.8) rotate(0deg); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: scale(1.5) rotate(180deg); opacity: 0; }
          }

          @keyframes neonPulse {
            0%, 100% { box-shadow: 0 0 10px rgba(0,228,255,0.4); }
            50% { box-shadow: 0 0 20px rgba(0,228,255,0.8); }
          }

          .alert-history-container {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            background: #07070A;
            border-radius: 24px;
            overflow: hidden;
          }

          .graffiti-header {
            padding: 32px 32px 24px;
            background: linear-gradient(135deg, rgba(255,62,191,0.1) 0%, rgba(155,0,255,0.1) 50%, rgba(0,228,255,0.1) 100%);
            border-bottom: 2px solid rgba(0,228,255,0.4);
            position: relative;
          }

          .graffiti-header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00E4FF, transparent);
            box-shadow: 0 0 10px #00E4FF;
          }

          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .graffiti-title {
            font-size: 48px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-shadow: 0 0 20px rgba(255,62,191,0.5);
            position: relative;
          }

          .spray-drips {
            position: absolute;
            bottom: -20px;
            left: 0;
            width: 100%;
            display: flex;
            gap: 40px;
            pointer-events: none;
          }

          .drip {
            width: 8px;
            height: 20px;
            background: linear-gradient(180deg, #FF3EBF, transparent);
            border-radius: 4px;
            filter: blur(2px);
            animation: sprayDrip 3s ease-in-out infinite;
          }

          .drip:nth-child(2) {
            height: 15px;
            animation-delay: 0.5s;
          }

          .drip:nth-child(3) {
            height: 25px;
            animation-delay: 1s;
          }

          .total-count {
            font-size: 18px;
            font-weight: 700;
            color: #00E4FF;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .filters-toggle {
            padding: 12px 24px;
            background: rgba(0,228,255,0.1);
            border: 2px solid #00E4FF;
            border-radius: 12px;
            color: #00E4FF;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .filters-toggle:hover {
            background: rgba(0,228,255,0.2);
            box-shadow: 0 0 20px rgba(0,228,255,0.4);
          }

          .filter-bar {
            padding: 24px 32px;
            background: rgba(10,10,15,0.8);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .search-box {
            position: relative;
          }

          .search-input {
            width: 100%;
            padding: 14px 48px 14px 20px;
            background: rgba(0,0,0,0.4);
            border: 2px solid rgba(0,228,255,0.3);
            border-radius: 12px;
            color: #FFFFFF;
            font-size: 14px;
            transition: all 0.3s ease;
          }

          .search-input:focus {
            outline: none;
            border-color: #00E4FF;
            box-shadow: 0 0 20px rgba(0,228,255,0.4);
          }

          .search-input::placeholder {
            color: rgba(255,255,255,0.4);
          }

          .search-icon {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
            color: #00E4FF;
            pointer-events: none;
          }

          .category-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }

          .chip {
            padding: 8px 16px;
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 20px;
            color: rgba(255,255,255,0.7);
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .chip:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.4);
          }

          .chip.active {
            background: linear-gradient(135deg, rgba(255,62,191,0.3) 0%, rgba(155,0,255,0.3) 100%);
            border-color: #FF3EBF;
            color: #FFFFFF;
            box-shadow: 0 0 15px rgba(255,62,191,0.4);
          }

          .chip.active::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,62,191,0.4) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            animation: sprayBurst 0.6s ease-out;
          }

          .date-tabs {
            display: flex;
            gap: 12px;
          }

          .date-tab {
            flex: 1;
            padding: 12px 20px;
            background: rgba(255,255,255,0.03);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .date-tab:hover {
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.2);
          }

          .date-tab.active {
            background: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 100%);
            border-color: #FF3EBF;
            color: #FFFFFF;
            box-shadow: 0 0 20px rgba(255,62,191,0.4);
          }

          .history-content {
            padding: 24px 32px;
            max-height: 600px;
            overflow-y: auto;
          }

          .history-content::-webkit-scrollbar {
            width: 8px;
          }

          .history-content::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 4px;
          }

          .history-content::-webkit-scrollbar-thumb {
            background: rgba(0,228,255,0.4);
            border-radius: 4px;
          }

          .history-content::-webkit-scrollbar-thumb:hover {
            background: rgba(0,228,255,0.6);
          }

          .history-section {
            margin-bottom: 32px;
          }

          .section-title {
            font-size: 20px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            color: #00E4FF;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid rgba(0,228,255,0.3);
            text-shadow: 0 0 10px rgba(0,228,255,0.5);
          }

          .alerts-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .empty-state {
            padding: 40px 20px;
            text-align: center;
            color: rgba(255,255,255,0.4);
            font-size: 16px;
          }

          .controls-bar {
            padding: 24px 32px;
            background: rgba(10,10,15,0.8);
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }

          .control-btn {
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid;
          }

          .control-btn.danger {
            background: linear-gradient(135deg, rgba(255,62,191,0.2) 0%, rgba(255,122,0,0.2) 100%);
            border-color: #FF3EBF;
            color: #FF3EBF;
          }

          .control-btn.danger:hover {
            background: linear-gradient(135deg, rgba(255,62,191,0.3) 0%, rgba(255,122,0,0.3) 100%);
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
            transform: scale(0.97);
          }

          .control-btn.danger:active {
            transform: scale(0.95);
          }

          @media (max-width: 768px) {
            .alert-history-container {
              border-radius: 0;
            }

            .graffiti-title {
              font-size: 32px;
            }

            .filter-bar,
            .history-content,
            .controls-bar {
              padding: 16px 20px;
            }

            .date-tabs {
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="alert-history-container">
        {/* Graffiti Header */}
        <div className="graffiti-header">
          <div className="header-top">
            <div className="total-count">🔥 TOTAL: {history.length}</div>
            <button
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
            </button>
          </div>
          
          <h1 className="graffiti-title">
            ALERT HISTORY
            <div className="spray-drips">
              <div className="drip"></div>
              <div className="drip"></div>
              <div className="drip"></div>
            </div>
          </h1>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="filter-bar">
            {/* Search Box */}
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search alerts..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            {/* Category Chips */}
            <div className="category-chips">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  className={`chip ${filters.categories.includes(category) ? 'active' : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Date Range Tabs */}
            <div className="date-tabs">
              {DATE_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`date-tab ${filters.dateRange === option.value ? 'active' : ''}`}
                  onClick={() => setDateRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grouped History Display */}
        <div className="history-content">
          {history.length === 0 ? (
            <div className="empty-state">
              No alerts in history yet. Alerts will appear here as they are triggered.
            </div>
          ) : (
            <>
              {/* Today Section */}
              {groupedHistory.today.length > 0 && (
                <div className="history-section">
                  <h2 className="section-title">TODAY</h2>
                  <div className="alerts-list">
                    {groupedHistory.today.map((alert) => (
                      <AlertTag key={alert.id} alert={alert} />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday Section */}
              {groupedHistory.yesterday.length > 0 && (
                <div className="history-section">
                  <h2 className="section-title">YESTERDAY</h2>
                  <div className="alerts-list">
                    {groupedHistory.yesterday.map((alert) => (
                      <AlertTag key={alert.id} alert={alert} />
                    ))}
                  </div>
                </div>
              )}

              {/* This Week Section */}
              {groupedHistory.thisWeek.length > 0 && (
                <div className="history-section">
                  <h2 className="section-title">THIS WEEK</h2>
                  <div className="alerts-list">
                    {groupedHistory.thisWeek.map((alert) => (
                      <AlertTag key={alert.id} alert={alert} />
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier Section */}
              {groupedHistory.earlier.length > 0 && (
                <div className="history-section">
                  <h2 className="section-title">EARLIER</h2>
                  <div className="alerts-list">
                    {groupedHistory.earlier.map((alert) => (
                      <AlertTag key={alert.id} alert={alert} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Clearing Controls */}
        {history.length > 0 && (
          <div className="controls-bar">
            {filters.categories.length === 1 && (
              <button
                className="control-btn danger"
                onClick={() => handleClearCategory(filters.categories[0])}
              >
                Clear {filters.categories[0]} Alerts
              </button>
            )}
            <button
              className="control-btn danger"
              onClick={handleClearAll}
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AlertHistoryPanel;
