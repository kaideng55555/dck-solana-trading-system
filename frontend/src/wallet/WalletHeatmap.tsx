/**
 * WalletHeatmap Component (D11)
 * 
 * 7x24 activity heatmap grid showing trading activity
 * Features:
 * - Pink cells = buys
 * - Cyan cells = sells
 * - Purple cells = snipes
 * - Tooltip with timestamp + description
 * - Neon spray-paint glow on active cells
 */

import React, { useState } from 'react';
import { useMultiWalletEngine } from '../walletTerminal/multiWalletEngine';
import type { WalletHistoryEntry } from '../walletTerminal/walletTypes';

interface HeatmapCell {
  day: number;
  hour: number;
  activity: WalletHistoryEntry[];
  intensity: number;
}

export const WalletHeatmap: React.FC = () => {
  const { wallets } = useMultiWalletEngine();
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate 7x24 grid (last 7 days, 24 hours each)
  const generateHeatmapData = (): HeatmapCell[][] => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const hourInMs = 60 * 60 * 1000;
    
    const grid: HeatmapCell[][] = [];

    for (let day = 0; day < 7; day++) {
      const dayData: HeatmapCell[] = [];
      const dayStart = now - (day * dayInMs);

      for (let hour = 0; hour < 24; hour++) {
        const hourStart = dayStart - (hour * hourInMs);
        const hourEnd = hourStart + hourInMs;

        // Collect all activity in this hour across all wallets
        const activity: WalletHistoryEntry[] = [];
        wallets.forEach((wallet) => {
          wallet.history.forEach((entry) => {
            if (entry.timestamp >= hourStart && entry.timestamp < hourEnd) {
              activity.push(entry);
            }
          });
        });

        // Calculate intensity (0-1) based on activity count
        const intensity = Math.min(activity.length / 10, 1);

        dayData.push({ day, hour, activity, intensity });
      }

      grid.push(dayData);
    }

    return grid;
  };

  const heatmapData = generateHeatmapData();

  const getCellColor = (cell: HeatmapCell): string => {
    if (cell.activity.length === 0) return 'rgba(255,255,255,0.05)';

    // Count action types
    const buyCount = cell.activity.filter((a) => a.action === 'BUY').length;
    const sellCount = cell.activity.filter((a) => a.action === 'SELL').length;
    const snipeCount = cell.activity.filter((a) => a.action === 'SNIPE').length;

    // Determine dominant action
    if (snipeCount > buyCount && snipeCount > sellCount) {
      return `rgba(155,0,255,${0.3 + cell.intensity * 0.7})`;
    } else if (buyCount > sellCount) {
      return `rgba(0,255,85,${0.3 + cell.intensity * 0.7})`;
    } else {
      return `rgba(0,228,255,${0.3 + cell.intensity * 0.7})`;
    }
  };

  const getCellGlow = (cell: HeatmapCell): string => {
    if (cell.activity.length === 0) return 'none';

    const intensity = cell.intensity;
    const buyCount = cell.activity.filter((a) => a.action === 'BUY').length;
    const sellCount = cell.activity.filter((a) => a.action === 'SELL').length;
    const snipeCount = cell.activity.filter((a) => a.action === 'SNIPE').length;

    if (snipeCount > buyCount && snipeCount > sellCount) {
      return `0 0 ${8 + intensity * 12}px rgba(155,0,255,${intensity})`;
    } else if (buyCount > sellCount) {
      return `0 0 ${8 + intensity * 12}px rgba(0,255,85,${intensity})`;
    } else {
      return `0 0 ${8 + intensity * 12}px rgba(0,228,255,${intensity})`;
    }
  };

  const handleCellHover = (cell: HeatmapCell, e: React.MouseEvent) => {
    if (cell.activity.length > 0) {
      setHoveredCell(cell);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getDayLabel = (day: number) => {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <>
      <style>
        {`
          .heatmap-container {
            background: #0A0A0F;
            border: 2px solid rgba(255,62,191,0.3);
            border-radius: 16px;
            padding: 20px;
            overflow-x: auto;
          }

          .heatmap-title {
            font-size: 18px;
            font-weight: 700;
            color: #FF3EBF;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }

          .heatmap-legend {
            display: flex;
            gap: 20px;
            margin-bottom: 16px;
            font-size: 12px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
          }

          .legend-color.buy {
            background: rgba(0,255,85,0.7);
            box-shadow: 0 0 8px rgba(0,255,85,0.6);
          }

          .legend-color.sell {
            background: rgba(0,228,255,0.7);
            box-shadow: 0 0 8px rgba(0,228,255,0.6);
          }

          .legend-color.snipe {
            background: rgba(155,0,255,0.7);
            box-shadow: 0 0 8px rgba(155,0,255,0.6);
          }

          .legend-label {
            color: rgba(255,255,255,0.7);
          }

          .heatmap-grid {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 800px;
          }

          .heatmap-row {
            display: flex;
            gap: 2px;
            align-items: center;
          }

          .heatmap-day-label {
            width: 40px;
            font-size: 11px;
            color: rgba(255,255,255,0.6);
            text-align: right;
            padding-right: 8px;
          }

          .heatmap-cell {
            width: 30px;
            height: 30px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(255,255,255,0.1);
          }

          .heatmap-cell:hover {
            transform: scale(1.2);
            z-index: 10;
            border-color: rgba(255,255,255,0.4);
          }

          .heatmap-hour-labels {
            display: flex;
            gap: 2px;
            margin-bottom: 4px;
            padding-left: 48px;
          }

          .heatmap-hour-label {
            width: 30px;
            font-size: 9px;
            color: rgba(255,255,255,0.4);
            text-align: center;
          }

          .heatmap-tooltip {
            position: fixed;
            background: #131318;
            border: 2px solid #FF3EBF;
            border-radius: 12px;
            padding: 12px;
            pointer-events: none;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 0 20px rgba(255,62,191,0.6);
          }

          .tooltip-header {
            font-size: 12px;
            font-weight: 700;
            color: #00E4FF;
            margin-bottom: 8px;
          }

          .tooltip-activity {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .tooltip-item {
            font-size: 11px;
            color: rgba(255,255,255,0.8);
            display: flex;
            justify-content: space-between;
            gap: 12px;
          }

          .tooltip-action {
            font-weight: 600;
          }

          .tooltip-action.buy {
            color: #00FF55;
          }

          .tooltip-action.sell {
            color: #00E4FF;
          }

          .tooltip-action.snipe {
            color: #9B00FF;
          }
        `}
      </style>

      <div className="heatmap-container">
        <div className="heatmap-title">📊 Activity Heatmap (Last 7 Days)</div>

        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-color buy"></div>
            <div className="legend-label">Buy</div>
          </div>
          <div className="legend-item">
            <div className="legend-color sell"></div>
            <div className="legend-label">Sell</div>
          </div>
          <div className="legend-item">
            <div className="legend-color snipe"></div>
            <div className="legend-label">Snipe</div>
          </div>
        </div>

        <div className="heatmap-hour-labels">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="heatmap-hour-label">
              {i % 6 === 0 ? `${i}h` : ''}
            </div>
          ))}
        </div>

        <div className="heatmap-grid">
          {heatmapData.map((dayData, dayIdx) => (
            <div key={dayIdx} className="heatmap-row">
              <div className="heatmap-day-label">{getDayLabel(dayIdx)}</div>
              {dayData.map((cell, hourIdx) => (
                <div
                  key={hourIdx}
                  className="heatmap-cell"
                  style={{
                    background: getCellColor(cell),
                    boxShadow: getCellGlow(cell),
                  }}
                  onMouseEnter={(e) => handleCellHover(cell, e)}
                  onMouseLeave={handleCellLeave}
                />
              ))}
            </div>
          ))}
        </div>

        {hoveredCell && hoveredCell.activity.length > 0 && (
          <div
            className="heatmap-tooltip"
            style={{
              left: tooltipPos.x + 15,
              top: tooltipPos.y + 15,
            }}
          >
            <div className="tooltip-header">
              {getDayLabel(hoveredCell.day)} • {hoveredCell.hour}:00 - {hoveredCell.hour + 1}:00
            </div>
            <div className="tooltip-activity">
              {hoveredCell.activity.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="tooltip-item">
                  <span className={`tooltip-action ${activity.action}`}>
                    {activity.action.toUpperCase()}
                  </span>
                  <span>{activity.tokenSymbol}</span>
                  <span>{formatTime(activity.timestamp)}</span>
                </div>
              ))}
              {hoveredCell.activity.length > 5 && (
                <div className="tooltip-item" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  +{hoveredCell.activity.length - 5} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WalletHeatmap;
