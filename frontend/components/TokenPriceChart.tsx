import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTokenPriceData } from '../hooks/useTokenPriceData';

interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
}

interface TokenPriceChartProps {
  mintAddress: string;
  tokenSymbol: string;
}

export const TokenPriceChart: React.FC<TokenPriceChartProps> = ({
  mintAddress,
  tokenSymbol,
}) => {
  const { data, isLoading, error } = useTokenPriceData(mintAddress);

  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'price') {
      return [`$${value.toFixed(6)}`, 'Price'];
    }
    return [value, name];
  };

  if (isLoading) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>Loading price data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa',
        borderRadius: '8px',
        color: 'red',
      }}>
        <div>Error loading price data: {error.message}</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        {tokenSymbol} Price Chart
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis}
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={(timestamp) => 
              new Date(timestamp * 1000).toLocaleString()
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Price (USD)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};