import React, { useEffect, useState } from 'react';
import { dckNeonTheme } from '../styles/dckNeonTheme';
import { wsService } from '../services/websocket';

interface TokenCardProps {
  token: {
    mintAddress: string;
    symbol: string;
    name: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    bondingProgress?: number;
    liquidity?: number;
    age?: number; // in seconds
    holders?: number;
    isVerified?: boolean;
    riskScore?: number;
  };
  showChart?: boolean;
  showVolume?: boolean;
  bondingProgress?: number;
}

const TokenCard: React.FC<TokenCardProps> = ({ 
  token, 
  showChart = true, 
  showVolume = true,
  bondingProgress 
}) => {
  const [livePrice, setLivePrice] = useState(token.price);
  const [priceHistory, setPriceHistory] = useState<number[]>([token.price]);

  useEffect(() => {
    // Subscribe to real-time price updates
    wsService.subscribeToTokenPrice(token.mintAddress, (data) => {
      setLivePrice(data.price);
      setPriceHistory(prev => [...prev.slice(-20), data.price]);
    });

    return () => {
      wsService.unsubscribeFromToken(token.mintAddress);
    };
  }, [token.mintAddress]);

  const formatPrice = (price: number) => {
    if (price < 0.00000001) return price.toFixed(10);
    if (price < 0.0001) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(4);
  };

  const formatMarketCap = (mc: number) => {
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

  const getRiskColor = (risk?: number) => {
    if (!risk) return dckNeonTheme.colors.neonCyan;
    if (risk > 70) return dckNeonTheme.colors.neonPink;
    if (risk > 40) return dckNeonTheme.colors.neonOrange;
    return dckNeonTheme.colors.neonCyan;
  };

  const getAgeDisplay = (ageSeconds?: number) => {
    if (!ageSeconds) return '';
    if (ageSeconds < 60) return `${ageSeconds}s old`;
    if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)}m old`;
    if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)}h old`;
    return `${Math.floor(ageSeconds / 86400)}d old`;
  };

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(13, 17, 23, 0.95) 0%, rgba(25, 30, 40, 0.95) 100%)',
    border: `1px solid ${dckNeonTheme.colors.neonCyan}40`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 12px rgba(0, 245, 255, 0.1)`,
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const symbolStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: dckNeonTheme.colors.neonCyan,
    textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
    fontFamily: 'monospace',
  };

  const priceStyle: React.CSSProperties = {
    fontSize: '18px',
    color: dckNeonTheme.colors.neonCyan,
    fontWeight: 'bold',
  };

  const changeStyle: React.CSSProperties = {
    fontSize: '14px',
    color: token.priceChange24h >= 0 ? dckNeonTheme.colors.neonCyan : dckNeonTheme.colors.neonPink,
    fontWeight: 'bold',
  };

  const statsRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '12px',
  };

  const statStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#888',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '14px',
    color: dckNeonTheme.colors.neonCyan,
    fontWeight: 'bold',
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 245, 255, 0.2)`;
        e.currentTarget.style.borderColor = dckNeonTheme.colors.neonCyan;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 245, 255, 0.1)`;
        e.currentTarget.style.borderColor = `${dckNeonTheme.colors.neonCyan}40`;
      }}
    >
      {/* Risk Badge */}
      {token.riskScore !== undefined && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          backgroundColor: `${getRiskColor(token.riskScore)}20`,
          color: getRiskColor(token.riskScore),
          border: `1px solid ${getRiskColor(token.riskScore)}`,
        }}>
          {token.riskScore > 70 ? '🚨 HIGH' : token.riskScore > 40 ? '⚠️ MED' : '✅ LOW'}
        </div>
      )}

      {/* Header */}
      <div style={headerStyle}>
        <div>
          <div style={symbolStyle}>
            {token.isVerified && '✓ '}${token.symbol}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {token.name}
            {token.age && ` • ${getAgeDisplay(token.age)}`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={priceStyle}>${formatPrice(livePrice)}</div>
          <div style={changeStyle}>
            {token.priceChange24h >= 0 ? '↗' : '↘'} {Math.abs(token.priceChange24h).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      {showChart && priceHistory.length > 1 && (
        <div style={{ 
          height: '60px', 
          marginBottom: '12px',
          position: 'relative',
        }}>
          <svg width="100%" height="60" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id={`gradient-${token.mintAddress}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={dckNeonTheme.colors.neonCyan} stopOpacity="0.3" />
                <stop offset="100%" stopColor={dckNeonTheme.colors.neonCyan} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={priceHistory.map((p, i) => {
                const x = (i / (priceHistory.length - 1)) * 100;
                const minPrice = Math.min(...priceHistory);
                const maxPrice = Math.max(...priceHistory);
                const range = maxPrice - minPrice || 1;
                const y = 60 - ((p - minPrice) / range) * 50;
                return `${x}%,${y}`;
              }).join(' ')}
              fill="none"
              stroke={dckNeonTheme.colors.neonCyan}
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))' }}
            />
            <polyline
              points={priceHistory.map((p, i) => {
                const x = (i / (priceHistory.length - 1)) * 100;
                const minPrice = Math.min(...priceHistory);
                const maxPrice = Math.max(...priceHistory);
                const range = maxPrice - minPrice || 1;
                const y = 60 - ((p - minPrice) / range) * 50;
                return `${x}%,${y}`;
              }).join(' ') + ' 100%,60 0,60'}
              fill={`url(#gradient-${token.mintAddress})`}
            />
          </svg>
        </div>
      )}

      {/* Bonding Curve Progress */}
      {bondingProgress !== undefined && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#888',
            marginBottom: '4px',
          }}>
            <span>Bonding Progress</span>
            <span style={{ color: dckNeonTheme.colors.neonCyan, fontWeight: 'bold' }}>
              {bondingProgress.toFixed(1)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(0, 245, 255, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${bondingProgress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${dckNeonTheme.colors.neonCyan}, ${dckNeonTheme.colors.neonPink})`,
              boxShadow: `0 0 8px ${dckNeonTheme.colors.neonCyan}`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={statsRowStyle}>
        <div>
          <div style={statStyle}>Market Cap</div>
          <div style={statValueStyle}>{formatMarketCap(token.marketCap)}</div>
        </div>
        {showVolume && (
          <div>
            <div style={statStyle}>24h Volume</div>
            <div style={statValueStyle}>{formatMarketCap(token.volume24h)}</div>
          </div>
        )}
        {token.liquidity !== undefined && (
          <div>
            <div style={statStyle}>Liquidity</div>
            <div style={statValueStyle}>{formatMarketCap(token.liquidity)}</div>
          </div>
        )}
        {token.holders !== undefined && (
          <div>
            <div style={statStyle}>Holders</div>
            <div style={statValueStyle}>{token.holders}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCard;
