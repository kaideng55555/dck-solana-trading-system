/**
 * PortfolioDistribution Component (D12)
 * 
 * Neon donut chart with graffiti spray-paint aesthetics
 * Features:
 * - Pink → purple → cyan arcs
 * - Drip effects on chart edges
 * - Hover glow increases
 * - Token icons float around chart
 * - % shown inside neon bubbles
 */

import React, { useState } from 'react';
import { usePortfolioEngine, formatUSD, formatPercent } from './portfolioEngine';

export const PortfolioDistribution: React.FC = () => {
  const portfolio = usePortfolioEngine();
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  // Calculate SVG arc paths for donut chart
  const generateArc = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number
  ): string => {
    const startX = Math.cos((startAngle * Math.PI) / 180) * outerRadius;
    const startY = Math.sin((startAngle * Math.PI) / 180) * outerRadius;
    const endX = Math.cos((endAngle * Math.PI) / 180) * outerRadius;
    const endY = Math.sin((endAngle * Math.PI) / 180) * outerRadius;
    const innerStartX = Math.cos((startAngle * Math.PI) / 180) * innerRadius;
    const innerStartY = Math.sin((startAngle * Math.PI) / 180) * innerRadius;
    const innerEndX = Math.cos((endAngle * Math.PI) / 180) * innerRadius;
    const innerEndY = Math.sin((endAngle * Math.PI) / 180) * innerRadius;

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${startX} ${startY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
      Z
    `;
  };

  const chartSize = 400;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const outerRadius = 160;
  const innerRadius = 100;

  // Calculate angles for each segment
  let currentAngle = -90; // Start at top
  const segments = portfolio.distributionData.map((data, idx) => {
    const angleSpan = (data.percent / 100) * 360;
    const segment = {
      ...data,
      startAngle: currentAngle,
      endAngle: currentAngle + angleSpan,
      midAngle: currentAngle + angleSpan / 2,
      path: generateArc(currentAngle, currentAngle + angleSpan, innerRadius, outerRadius),
      index: idx,
    };
    currentAngle += angleSpan;
    return segment;
  });

  return (
    <>
      <style>
        {`
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes dripEffect {
            0% { transform: translateY(-5px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(15px); opacity: 0; }
          }

          @keyframes rotateGlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .distribution-container {
            background: #0A0A0F;
            border: 3px solid;
            border-image: linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%) 1;
            border-radius: 24px;
            padding: 32px;
            position: relative;
            overflow: visible;
          }

          .distribution-title {
            font-size: 28px;
            font-weight: 900;
            font-family: 'Impact', 'Anton', sans-serif;
            background: linear-gradient(135deg, #FF3EBF 0%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 32px;
            text-shadow: 0 0 20px rgba(255,62,191,0.5);
          }

          .chart-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .donut-chart {
            position: relative;
          }

          .chart-segment {
            cursor: pointer;
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 8px currentColor);
          }

          .chart-segment:hover {
            filter: drop-shadow(0 0 20px currentColor);
            transform: scale(1.05);
          }

          .chart-center-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            pointer-events: none;
          }

          .center-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          .center-value {
            font-size: 32px;
            font-weight: 900;
            background: linear-gradient(135deg, #FF3EBF 0%, #00E4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .legend {
            margin-top: 32px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: rgba(255,255,255,0.03);
            border: 2px solid transparent;
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .legend-item:hover {
            background: rgba(255,255,255,0.08);
            border-color: currentColor;
            transform: translateX(4px);
          }

          .legend-color {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            box-shadow: 0 0 12px currentColor;
            flex-shrink: 0;
          }

          .legend-details {
            flex: 1;
          }

          .legend-name {
            font-size: 14px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 4px;
          }

          .legend-stats {
            font-size: 11px;
            color: rgba(255,255,255,0.6);
          }

          .floating-icon {
            position: absolute;
            animation: floatIcon 3s ease-in-out infinite;
            font-size: 24px;
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.6));
            pointer-events: none;
          }

          .drip-marker {
            position: absolute;
            width: 12px;
            height: 12px;
            background: currentColor;
            border-radius: 50%;
            filter: blur(6px);
            animation: dripEffect 2s ease-in-out infinite;
          }

          .glow-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 340px;
            height: 340px;
            border: 2px solid rgba(255,62,191,0.3);
            border-radius: 50%;
            animation: rotateGlow 8s linear infinite;
            pointer-events: none;
          }
        `}
      </style>

      <div className="distribution-container">
        <h2 className="distribution-title">🎨 Distribution</h2>

        <div className="chart-wrapper">
          {/* Rotating glow ring */}
          <div className="glow-ring" />

          {/* Donut Chart SVG */}
          <svg
            width={chartSize}
            height={chartSize}
            viewBox={`0 0 ${chartSize} ${chartSize}`}
            className="donut-chart"
          >
            <g transform={`translate(${centerX}, ${centerY})`}>
              {segments.map((segment) => (
                <path
                  key={segment.index}
                  d={segment.path}
                  fill={segment.color}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="2"
                  className="chart-segment"
                  style={{
                    opacity: hoveredSegment === null || hoveredSegment === segment.index ? 1 : 0.4,
                  }}
                  onMouseEnter={() => setHoveredSegment(segment.index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              ))}
            </g>

            {/* Center percentage bubbles */}
            {segments.map((segment) => {
              if (segment.percent < 5) return null; // Skip small segments
              const angle = (segment.midAngle * Math.PI) / 180;
              const radius = (outerRadius + innerRadius) / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;

              return (
                <g key={`label-${segment.index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="rgba(0,0,0,0.8)"
                    stroke={segment.color}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={segment.color}
                    fontSize="12"
                    fontWeight="700"
                  >
                    {segment.percent.toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="chart-center-text">
            <div className="center-label">Total Tokens</div>
            <div className="center-value">{portfolio.tokenHoldings.length}</div>
          </div>

          {/* Floating Icons */}
          {segments.slice(0, 3).map((segment, idx) => {
            const angle = (segment.midAngle * Math.PI) / 180;
            const radius = outerRadius + 60;
            const x = centerX + Math.cos(angle) * radius - 12;
            const y = centerY + Math.sin(angle) * radius - 12;

            return (
              <div
                key={`icon-${idx}`}
                className="floating-icon"
                style={{
                  left: x,
                  top: y,
                  color: segment.color,
                  animationDelay: `${idx * 0.5}s`,
                }}
              >
                💎
              </div>
            );
          })}

          {/* Drip Markers */}
          {segments.slice(0, 2).map((segment, idx) => {
            const angle = (segment.startAngle * Math.PI) / 180;
            const radius = outerRadius + 10;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            return (
              <div
                key={`drip-${idx}`}
                className="drip-marker"
                style={{
                  left: x,
                  top: y,
                  color: segment.color,
                  animationDelay: `${idx * 0.7}s`,
                }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="legend">
          {portfolio.distributionData.map((data, idx) => (
            <div
              key={idx}
              className="legend-item"
              style={{ color: data.color }}
              onMouseEnter={() => setHoveredSegment(idx)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className="legend-color"
                style={{ backgroundColor: data.color, color: data.color }}
              />
              <div className="legend-details">
                <div className="legend-name">{data.name}</div>
                <div className="legend-stats">
                  {formatUSD(data.value)} • {data.percent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PortfolioDistribution;
