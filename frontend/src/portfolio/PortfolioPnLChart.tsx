/**
 * PortfolioPnLChart Component (D12)
 * 
 * Neon line chart showing PnL over time with spray-paint aesthetics
 * Features:
 * - Neon cyan line with pink shadow
 * - Spray gradient fill under line
 * - Graffiti label tags
 * - Pulsing highlight on peaks
 * - SVG rendering with neon effects
 */

import React, { useMemo } from 'react';
import { usePortfolioEngine, formatUSD } from './portfolioEngine';

interface PnLDataPoint {
  timestamp: number;
  value: number;
  label: string;
}

export const PortfolioPnLChart: React.FC = () => {
  const portfolio = usePortfolioEngine();

  // Generate mock historical PnL data from current state
  const pnlHistory = useMemo((): PnLDataPoint[] => {
    const now = Date.now();
    const points: PnLDataPoint[] = [];
    const currentPnL = portfolio.pnlAllTime;
    
    // Generate 30 data points over the last 30 days
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      // Simulate growth curve from 0 to current PnL
      const progress = (30 - i) / 30;
      const value = currentPnL * Math.pow(progress, 1.5) * (1 + Math.sin(i * 0.5) * 0.15);
      
      const date = new Date(timestamp);
      const label = i === 30 ? '30d ago' : i === 15 ? '15d ago' : i === 0 ? 'Now' : `${i}d`;
      
      points.push({ timestamp, value, label });
    }
    
    return points;
  }, [portfolio.pnlAllTime]);

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 40, right: 60, bottom: 50, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate min/max for scaling
  const minValue = Math.min(...pnlHistory.map(d => d.value), 0);
  const maxValue = Math.max(...pnlHistory.map(d => d.value), 1000);
  const valueRange = maxValue - minValue;

  // Scale functions
  const scaleX = (index: number) => (index / (pnlHistory.length - 1)) * chartWidth;
  const scaleY = (value: number) => chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Generate SVG path for line
  const linePath = useMemo(() => {
    const points = pnlHistory.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`);
    return `M ${points.join(' L ')}`;
  }, [pnlHistory]);

  // Generate SVG path for area fill
  const areaPath = useMemo(() => {
    const points = pnlHistory.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`);
    return `M ${points.join(' L ')} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;
  }, [pnlHistory]);

  // Find peak and valley
  const peakIndex = pnlHistory.reduce((max, d, i, arr) => 
    d.value > arr[max].value ? i : max, 0);
  const valleyIndex = pnlHistory.reduce((min, d, i, arr) => 
    d.value < arr[min].value ? i : min, 0);

  return (
    <>
      <style>
        {`
          @keyframes peakPulse {
            0%, 100% {
              r: 8;
              fill: #00FF55;
              filter: drop-shadow(0 0 10px #00FF55);
            }
            50% {
              r: 12;
              fill: #00FFAA;
              filter: drop-shadow(0 0 20px #00FF55);
            }
          }

          @keyframes valleyPulse {
            0%, 100% {
              r: 8;
              fill: #FF3EBF;
              filter: drop-shadow(0 0 10px #FF3EBF);
            }
            50% {
              r: 12;
              fill: #FF66CC;
              filter: drop-shadow(0 0 20px #FF3EBF);
            }
          }

          @keyframes sprayFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .pnl-chart-container {
            background: #0A0A0F;
            border: 3px solid;
            border-image: linear-gradient(135deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%) 1;
            border-radius: 24px;
            padding: 32px;
            animation: sprayFadeIn 0.5s ease;
          }

          .pnl-chart-title {
            font-size: 28px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            background: linear-gradient(135deg, #00E4FF 0%, #FF3EBF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 24px;
            text-shadow: 0 0 20px rgba(0,228,255,0.5);
          }

          .pnl-chart-svg {
            width: 100%;
            height: auto;
            filter: drop-shadow(0 0 20px rgba(0,228,255,0.2));
          }

          .grid-line {
            stroke: rgba(255,255,255,0.05);
            stroke-width: 1;
            stroke-dasharray: 5,5;
          }

          .axis-line {
            stroke: rgba(255,255,255,0.1);
            stroke-width: 2;
          }

          .axis-label {
            fill: rgba(255,255,255,0.6);
            font-size: 12px;
            font-weight: 600;
            text-anchor: middle;
          }

          .value-label {
            fill: rgba(255,255,255,0.6);
            font-size: 12px;
            font-weight: 600;
            text-anchor: end;
          }

          .pnl-line {
            fill: none;
            stroke: #00E4FF;
            stroke-width: 3;
            filter: drop-shadow(0 0 8px rgba(0,228,255,0.8)) drop-shadow(0 4px 12px rgba(255,62,191,0.4));
          }

          .pnl-area {
            fill: url(#pnlGradient);
            opacity: 0.3;
          }

          .peak-marker {
            animation: peakPulse 2s ease-in-out infinite;
          }

          .valley-marker {
            animation: valleyPulse 2s ease-in-out infinite;
          }

          .graffiti-tag {
            font-size: 11px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .tag-background {
            fill: rgba(0,0,0,0.8);
            stroke: currentColor;
            stroke-width: 2;
            rx: 6;
          }

          .zero-line {
            stroke: rgba(255,255,255,0.2);
            stroke-width: 2;
            stroke-dasharray: 10,5;
          }
        `}
      </style>

      <div className="pnl-chart-container">
        <h2 className="pnl-chart-title">📈 PnL Trajectory</h2>

        <svg
          className="pnl-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="pnlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E4FF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#9B00FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF3EBF" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Chart group with padding offset */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <line
                key={fraction}
                className="grid-line"
                x1="0"
                y1={chartHeight * fraction}
                x2={chartWidth}
                y2={chartHeight * fraction}
              />
            ))}

            {/* Zero line (if PnL goes negative) */}
            {minValue < 0 && (
              <line
                className="zero-line"
                x1="0"
                y1={scaleY(0)}
                x2={chartWidth}
                y2={scaleY(0)}
              />
            )}

            {/* Area fill */}
            <path className="pnl-area" d={areaPath} />

            {/* PnL line */}
            <path className="pnl-line" d={linePath} />

            {/* Peak marker */}
            <circle
              className="peak-marker"
              cx={scaleX(peakIndex)}
              cy={scaleY(pnlHistory[peakIndex].value)}
            />

            {/* Peak tag */}
            <g transform={`translate(${scaleX(peakIndex)}, ${scaleY(pnlHistory[peakIndex].value) - 25})`}>
              <rect
                className="tag-background"
                x="-35"
                y="-12"
                width="70"
                height="20"
                style={{ stroke: '#00FF55' }}
              />
              <text
                className="graffiti-tag"
                x="0"
                y="2"
                textAnchor="middle"
                fill="#00FF55"
              >
                🔥 PEAK
              </text>
            </g>

            {/* Valley marker */}
            {valleyIndex !== peakIndex && (
              <>
                <circle
                  className="valley-marker"
                  cx={scaleX(valleyIndex)}
                  cy={scaleY(pnlHistory[valleyIndex].value)}
                />

                {/* Valley tag */}
                <g transform={`translate(${scaleX(valleyIndex)}, ${scaleY(pnlHistory[valleyIndex].value) + 35})`}>
                  <rect
                    className="tag-background"
                    x="-40"
                    y="-12"
                    width="80"
                    height="20"
                    style={{ stroke: '#FF3EBF' }}
                  />
                  <text
                    className="graffiti-tag"
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fill="#FF3EBF"
                  >
                    ❄️ VALLEY
                  </text>
                </g>
              </>
            )}

            {/* X-axis */}
            <line
              className="axis-line"
              x1="0"
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
            />

            {/* X-axis labels */}
            {[0, Math.floor(pnlHistory.length / 2), pnlHistory.length - 1].map((index) => (
              <text
                key={index}
                className="axis-label"
                x={scaleX(index)}
                y={chartHeight + 25}
              >
                {pnlHistory[index].label}
              </text>
            ))}

            {/* Y-axis */}
            <line
              className="axis-line"
              x1="0"
              y1="0"
              x2="0"
              y2={chartHeight}
            />

            {/* Y-axis labels */}
            {[maxValue, maxValue * 0.5, 0, minValue].map((value, i) => (
              <text
                key={i}
                className="value-label"
                x="-10"
                y={scaleY(value) + 4}
              >
                {formatUSD(value)}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </>
  );
};

export default PortfolioPnLChart;
