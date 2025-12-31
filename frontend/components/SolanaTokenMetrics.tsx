import React from 'react';

interface SolanaTokenInfo {
  mintAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  holders: number;
  marketCap: number;
  price: number;
  volume24h: number;
  priceChange24h: number;
  createdAt: number;
  age: number; // in seconds
  liquidityLocked: boolean;
  isVerified: boolean;
}

interface SolanaTokenMetricsProps {
  tokenInfo: SolanaTokenInfo | null;
  isLoading?: boolean;
}

export const SolanaTokenMetrics: React.FC<SolanaTokenMetricsProps> = ({
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
        Loading Solana token metrics...
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
        No Solana token data available
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

  const formatAge = (ageInSeconds: number) => {
    if (ageInSeconds < 60) return `${Math.floor(ageInSeconds)}s`;
    if (ageInSeconds < 3600) return `${Math.floor(ageInSeconds / 60)}m`;
    if (ageInSeconds < 86400) return `${Math.floor(ageInSeconds / 3600)}h`;
    return `${Math.floor(ageInSeconds / 86400)}d`;
  };

  const getAgeColor = (ageInSeconds: number) => {
    if (ageInSeconds < 300) return '#ef4444'; // Red for very new (< 5 min)
    if (ageInSeconds < 3600) return '#f59e0b'; // Orange for new (< 1 hour)
    if (ageInSeconds < 86400) return '#10b981'; // Green for established (< 1 day)
    return '#6b7280'; // Gray for old
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
        {tokenInfo.isVerified && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ Verified</span>}
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
            ${tokenInfo.price.toFixed(8)}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: tokenInfo.priceChange24h >= 0 ? '#10b981' : '#ef4444' 
          }}>
            {tokenInfo.priceChange24h >= 0 ? '+' : ''}
            {tokenInfo.priceChange24h.toFixed(2)}% (24h)
          </div>
        </div>

        {/* Token Age */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Token Age
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: getAgeColor(tokenInfo.age)
          }}>
            {formatAge(tokenInfo.age)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {tokenInfo.age < 3600 ? '🔥 BRAND NEW' : tokenInfo.age < 86400 ? '⚡ Fresh' : '📈 Established'}
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

        {/* Supply */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Total Supply
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            {formatNumber(parseFloat(tokenInfo.totalSupply))}
          </div>
        </div>

        {/* Mint Authority */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Mint Authority
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: tokenInfo.mintAuthority ? '#ef4444' : '#10b981'
          }}>
            {tokenInfo.mintAuthority ? '⚠️ Active' : '✅ Renounced'}
          </div>
        </div>

        {/* Freeze Authority */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Freeze Authority
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: tokenInfo.freezeAuthority ? '#ef4444' : '#10b981'
          }}>
            {tokenInfo.freezeAuthority ? '⚠️ Can Freeze' : '✅ No Freeze'}
          </div>
        </div>

        {/* Liquidity */}
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
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        Mint Address: {tokenInfo.mintAddress}
      </div>
      
      {tokenInfo.age < 300 && (
        <div style={{ 
          marginTop: '10px', 
          padding: '8px 12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#dc2626'
        }}>
          🚨 EXTREMELY NEW TOKEN - Exercise extreme caution when trading!
        </div>
      )}
    </div>
  );
};