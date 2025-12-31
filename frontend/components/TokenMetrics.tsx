import React from 'react';

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  totalSupply: string;
  isFrozen: boolean;
  isLocked: boolean;
  liquidityLocked: boolean;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  holders: number;
  marketCap: number;
  price: number;
  volume24h: number;
  priceChange24h: number;
}

interface TokenMetricsProps {
  tokenInfo: TokenInfo | null;
  isLoading?: boolean;
}

export const TokenMetrics: React.FC<TokenMetricsProps> = ({
  tokenInfo,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        Loading token metrics...
      </div>
    );
  }

  if (!tokenInfo) {
    return (
      <div style={{ 
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        No token data available
      </div>
    );
  }

  const getStatusColor = (status: boolean, isGood: boolean) => {
    if (isGood) {
      return status ? '#10b981' : '#ef4444'; // Green if good, red if bad
    } else {
      return status ? '#ef4444' : '#10b981'; // Red if bad, green if good
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toString();
  };

  return (
    <div style={{ 
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        {tokenInfo.name} ({tokenInfo.symbol})
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        {/* Price Info */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Current Price
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            ${tokenInfo.price.toFixed(6)}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: tokenInfo.priceChange24h >= 0 ? '#10b981' : '#ef4444' 
          }}>
            {tokenInfo.priceChange24h >= 0 ? '+' : ''}
            {tokenInfo.priceChange24h.toFixed(2)}% (24h)
          </div>
        </div>

        {/* Market Cap */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Market Cap
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            ${formatNumber(tokenInfo.marketCap)}
          </div>
        </div>

        {/* Volume */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            24h Volume
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            ${formatNumber(tokenInfo.volume24h)}
          </div>
        </div>

        {/* Holders */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Holders
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            {formatNumber(tokenInfo.holders)}
          </div>
        </div>

        {/* Security Status */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Freeze Status
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: getStatusColor(tokenInfo.isFrozen, false)
          }}>
            {tokenInfo.isFrozen ? '🔒 FROZEN' : '✅ Not Frozen'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Lock Status
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: getStatusColor(tokenInfo.isLocked, true)
          }}>
            {tokenInfo.isLocked ? '🔒 LOCKED' : '⚠️ Unlocked'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Liquidity
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: getStatusColor(tokenInfo.liquidityLocked, true)
          }}>
            {tokenInfo.liquidityLocked ? '🔒 Locked' : '⚠️ Unlocked'}
          </div>
        </div>

        {/* Mint Authority */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Mint Authority
          </div>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 'bold',
            color: tokenInfo.mintAuthority ? '#ef4444' : '#10b981'
          }}>
            {tokenInfo.mintAuthority ? '⚠️ Active' : '✅ Renounced'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        Contract: {tokenInfo.address}
      </div>
    </div>
  );
};