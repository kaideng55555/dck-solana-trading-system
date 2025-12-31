import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VolumeData {
  timestamp: number;
  volume: number;
  value: number;
}

interface TokenVolumeChartProps {
  data: VolumeData[];
  tokenSymbol: string;
  isLoading?: boolean;
}

export const TokenVolumeChart: React.FC<TokenVolumeChartProps> = ({
  data,
  tokenSymbol,
  isLoading = false,
}) => {
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'volume') {
      return [value.toLocaleString(), 'Volume'];
    }
    if (name === 'value') {
      return [`$${value.toLocaleString()}`, 'Value (USD)'];
    }
    return [value, name];
  };

  if (isLoading) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>Loading volume data...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        {tokenSymbol} Volume Chart
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis}
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={(timestamp) => 
              new Date(Number(timestamp) * 1000).toLocaleString()
            }
          />
          <Bar dataKey="volume" fill="#10b981" name="Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
