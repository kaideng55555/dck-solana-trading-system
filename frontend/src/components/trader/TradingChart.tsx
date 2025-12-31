/**
 * TradingChart.tsx
 * 
 * Chart area with LiveChart integration
 * Features:
 * - LiveChart component with lightweight-charts
 * - Candlestick chart for price action
 * - Volume histogram
 * - Bonding curve overlay
 * - Auto-update every 3 seconds
 * - Responsive design (candlestick on desktop, line on mobile)
 * - DCK neon styling
 */

import React from 'react';
import { LiveChart } from '../../charts/LiveChart';

// =============================================
// TYPES
// =============================================

interface TradingChartProps {
  tokenMint: string;
  tokenData?: {
    symbol?: string;
    bondingProgress?: number;
    bondingVelocity?: number;
    liquidityHealth?: number;
    authorityRisk?: boolean;
  };
}

// =============================================
// COMPONENT
// =============================================

export const TradingChart: React.FC<TradingChartProps> = ({ tokenMint, tokenData }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <LiveChart
        token={{
          mint: tokenMint,
          symbol: tokenData?.symbol,
          bondingProgress: tokenData?.bondingProgress,
          bondingVelocity: tokenData?.bondingVelocity,
          liquidityHealth: tokenData?.liquidityHealth,
          authorityRisk: tokenData?.authorityRisk,
        }}
      />
    </div>
  );
};
