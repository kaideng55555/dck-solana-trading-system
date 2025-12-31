import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { dckNeonTheme } from '../styles/dckNeonTheme';

interface NeonChartProps {
  data: Array<{
    timestamp: number;
    price: number;
    volume?: number;
  }>;
  tokenSymbol: string;
  isLoading?: boolean;
  chartType?: 'line' | 'area';
}

// Custom tooltip component - defined outside render to avoid recreation
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string | number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: `${dckNeonTheme.colors.bgCard}F0`,
        border: `1px solid ${dckNeonTheme.colors.neonCyan}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: dckNeonTheme.colors.glowCyan,
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{
          color: dckNeonTheme.colors.textSecondary,
          margin: '0 0 8px 0',
          fontSize: '12px',
        }}>
          {new Date(Number(label) * 1000).toLocaleString()}
        </p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{
            color: entry.color,
            margin: '4px 0',
            fontWeight: 'bold',
            textShadow: `0 0 10px ${entry.color}`,
          }}>
            {entry.name}: ${Number(entry.value).toFixed(8)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DCKNeonChart: React.FC<NeonChartProps> = ({
  data,
  tokenSymbol,
  isLoading = false,
  chartType = 'area'
}) => {
  if (isLoading) {
    return (
      <div style={{
        height: '400px',
        background: dckNeonTheme.colors.bgCard,
        borderRadius: '12px',
        border: `1px solid ${dckNeonTheme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Loading animation with neon effect */}
        <div style={{
          color: dckNeonTheme.colors.neonCyan,
          fontSize: '16px',
          textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
          animation: 'pulse 2s infinite',
        }}>
          Loading {tokenSymbol} chart...
        </div>
        
        {/* Animated background grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${dckNeonTheme.colors.chartGrid} 1px, transparent 1px),
            linear-gradient(90deg, ${dckNeonTheme.colors.chartGrid} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          opacity: 0.3,
          animation: 'gridMove 20s infinite linear',
        }} />
      </div>
    );
  }

  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Custom tooltip with neon styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: `${dckNeonTheme.colors.bgCard}F0`,
          border: `1px solid ${dckNeonTheme.colors.neonCyan}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: dckNeonTheme.colors.glowCyan,
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{
            color: dckNeonTheme.colors.textSecondary,
            margin: '0 0 8px 0',
            fontSize: '12px',
          }}>
            {new Date(label * 1000).toLocaleString()}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{
              color: entry.color,
              margin: '4px 0',
              fontWeight: 'bold',
              textShadow: `0 0 10px ${entry.color}`,
            }}>
              {entry.name}: ${entry.value.toFixed(8)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: dckNeonTheme.colors.bgCard,
      borderRadius: '12px',
      border: `1px solid ${dckNeonTheme.colors.border}`,
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Chart Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <h3 style={{
          margin: 0,
          color: dckNeonTheme.colors.textPrimary,
          fontSize: '18px',
          fontWeight: '700',
        }}>
          {tokenSymbol} Price Chart
        </h3>
        
        {/* Neon indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dckNeonTheme.colors.neonCyan,
            boxShadow: dckNeonTheme.colors.glowCyan,
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            color: dckNeonTheme.colors.neonCyan,
            fontSize: '12px',
            fontWeight: '600',
            textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
          }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dckNeonTheme.colors.neonCyan} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={dckNeonTheme.colors.neonCyan} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={dckNeonTheme.colors.chartGrid}
                opacity={0.3}
              />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: dckNeonTheme.colors.textMuted, fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: dckNeonTheme.colors.textMuted, fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(6)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={dckNeonTheme.colors.neonCyan}
                strokeWidth={2}
                fill="url(#priceGradient)"
                filter="drop-shadow(0 0 8px rgba(0, 245, 255, 0.6))"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={dckNeonTheme.colors.chartGrid}
                opacity={0.3}
              />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: dckNeonTheme.colors.textMuted, fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: dckNeonTheme.colors.textMuted, fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(6)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={dckNeonTheme.colors.neonCyan}
                strokeWidth={2}
                dot={false}
                filter="drop-shadow(0 0 8px rgba(0, 245, 255, 0.6))"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Glowing border effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '12px',
        border: `1px solid ${dckNeonTheme.colors.neonCyan}`,
        opacity: 0.1,
        pointerEvents: 'none',
        boxShadow: `inset ${dckNeonTheme.colors.glowCyan}`,
      }} />
    </div>
  );
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(20px, 20px); }
  }
`;
document.head.appendChild(style);