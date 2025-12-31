import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { dckNeonTheme } from '../../styles/dckNeonTheme';

/**
 * FeeDashboardChart - DEV/TESTING ONLY
 * 
 * This component is for development and testing purposes only.
 * Do not use in production builds.
 * 
 * Shows fee analytics across different categories with neon DCK styling.
 */

interface FeeData {
  timestamp: number;
  totalFees: number;
  tradingFees: number;
  networkFees: number;
  label?: string;
}

interface FeeDashboardChartProps {
  data: FeeData[];
  isLoading?: boolean;
  timeframe?: '1H' | '24H' | '7D' | '30D';
}

// Custom tooltip - defined outside render to avoid recreation
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>;
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
        {payload.map((entry, index: number) => {
          const labels: Record<string, string> = {
            totalFees: '💰 Total Fees',
            tradingFees: '📈 Trading Fees',
            networkFees: '🔗 Network Fees',
          };
          const labelText = labels[entry.dataKey || ''] || entry.name;
          
          return (
            <p key={index} style={{
              color: entry.color,
              margin: '4px 0',
              fontWeight: 'bold',
              textShadow: `0 0 10px ${entry.color}`,
            }}>
              {labelText}: ${Number(entry.value).toFixed(4)}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function FeeDashboardChart({
  data,
  isLoading = false,
  timeframe = '24H'
}: FeeDashboardChartProps) {
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
          Loading fee data...
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
    const date = new Date(timestamp * 1000);
    if (timeframe === '1H') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '24H') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
          💰 Fee Dashboard - {timeframe}
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
          <AreaChart data={data}>
            <defs>
              <linearGradient id="totalFeesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dckNeonTheme.colors.neonCyan} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={dckNeonTheme.colors.neonCyan} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="tradingFeesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dckNeonTheme.colors.neonPink} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={dckNeonTheme.colors.neonPink} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="networkFeesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dckNeonTheme.colors.neonPurple} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={dckNeonTheme.colors.neonPurple} stopOpacity={0}/>
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
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="totalFees"
              name="Total Fees"
              stroke={dckNeonTheme.colors.neonCyan}
              strokeWidth={2}
              fill="url(#totalFeesGradient)"
              filter="drop-shadow(0 0 8px rgba(0, 245, 255, 0.6))"
            />
            <Area
              type="monotone"
              dataKey="tradingFees"
              name="Trading Fees"
              stroke={dckNeonTheme.colors.neonPink}
              strokeWidth={2}
              fill="url(#tradingFeesGradient)"
              filter="drop-shadow(0 0 8px rgba(255, 20, 147, 0.6))"
            />
            <Area
              type="monotone"
              dataKey="networkFees"
              name="Network Fees"
              stroke={dckNeonTheme.colors.neonPurple}
              strokeWidth={2}
              fill="url(#networkFeesGradient)"
              filter="drop-shadow(0 0 8px rgba(138, 43, 226, 0.6))"
            />
          </AreaChart>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
      `}</style>
    </div>
  );
}

// Mock data for testing
const mockData = [
  { timestamp: 1732440000, totalFees: 1.23, tradingFees: 0.9, networkFees: 0.33 },
  { timestamp: 1732443600, totalFees: 1.45, tradingFees: 1.1, networkFees: 0.35 },
  { timestamp: 1732447200, totalFees: 1.78, tradingFees: 1.4, networkFees: 0.38 },
];

// Example usage
<FeeDashboardChart data={mockData} timeframe="24H" />;
