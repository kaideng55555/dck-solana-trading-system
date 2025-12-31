import React, { useEffect, useState } from 'react';
import { dckNeonTheme } from '../styles/dckNeonTheme';
import { wsService } from '../services/websocket';
import TokenCard from './TokenCard';
import type { NewMintEvent } from '../types/solana';

// Token interface for display - extends NewMintEvent with guaranteed fields
interface Token extends NewMintEvent {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

interface TokenFeedProps {
  type: 'newest' | 'bonding' | 'graduated';
  title: string;
}

const TokenFeed: React.FC<TokenFeedProps> = ({ type, title }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect WebSocket
    const socket = wsService.connect();
    
    socket.on('connect', () => {
      setIsConnected(true);
      setIsLoading(false);
      console.log(`Connected to ${type} feed`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log(`Disconnected from ${type} feed`);
    });

    // Subscribe to appropriate feed based on type
    if (type === 'newest') {
      wsService.subscribeToNewMints((tokenData) => {
        // Ensure required fields are present
        if (!tokenData.price || !tokenData.marketCap) return;
        
        const token = tokenData as Token;
        setTokens(prev => {
          // Add new token to top, keep last 20
          const exists = prev.find(t => t.mintAddress === token.mintAddress);
          if (exists) return prev;
          setIsLoading(false);
          return [token, ...prev.slice(0, 19)];
        });
      });

      // Also subscribe to tokens less than 24 hours old
      wsService.subscribeToTokensByAge(24, (tokensData) => {
        const validTokens = tokensData.filter(t => t.price && t.marketCap) as Token[];
        setTokens(validTokens.slice(0, 20));
        setIsLoading(false);
      });
    } else if (type === 'bonding') {
      wsService.subscribeToBondingCurve((tokenData) => {
        if (!tokenData.price || !tokenData.marketCap) return;
        
        const token = tokenData as Token;
        setTokens(prev => {
          const existingIndex = prev.findIndex(t => t.mintAddress === token.mintAddress);
          if (existingIndex !== -1) {
            // Update existing token
            const newTokens = [...prev];
            newTokens[existingIndex] = token;
            return newTokens;
          }
          // Add new token approaching bonding curve completion
          if (token.bondingProgress && token.bondingProgress >= 70) {
            return [token, ...prev.slice(0, 19)];
          }
          return prev;
        });
        setIsLoading(false);
      });
    } else if (type === 'graduated') {
      wsService.subscribeToGraduatedTokens((tokenData) => {
        if (!tokenData.price || !tokenData.marketCap) return;
        
        const token = tokenData as Token;
        setTokens(prev => {
          const exists = prev.find(t => t.mintAddress === token.mintAddress);
          if (exists) return prev;
          return [token, ...prev.slice(0, 19)];
        });
        setIsLoading(false);
      });
    }

    // Simulate initial data load (remove in production)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      // Cleanup subscriptions
      socket.disconnect();
      clearTimeout(timer);
    };
  }, [type]);

  const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, rgba(13, 17, 23, 0.8) 0%, rgba(25, 30, 40, 0.8) 100%)',
    borderRadius: '16px',
    border: `2px solid ${dckNeonTheme.colors.neonCyan}30`,
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: `2px solid ${dckNeonTheme.colors.neonCyan}30`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: dckNeonTheme.colors.neonCyan,
    textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
    marginBottom: '8px',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const statusDotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isConnected ? dckNeonTheme.colors.neonCyan : dckNeonTheme.colors.neonPink,
    boxShadow: isConnected 
      ? `0 0 8px ${dckNeonTheme.colors.neonCyan}` 
      : `0 0 8px ${dckNeonTheme.colors.neonPink}`,
    animation: 'pulse 2s infinite',
  };

  const feedContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '8px',
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: dckNeonTheme.colors.neonCyan,
    textShadow: dckNeonTheme.textEffects.neonGlow.textShadow,
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#666',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={subtitleStyle}>
          <div style={statusDotStyle} />
          <span>{isConnected ? 'Live Feed' : 'Connecting...'}</span>
          {tokens.length > 0 && (
            <span style={{ marginLeft: 'auto', color: dckNeonTheme.colors.neonCyan }}>
              {tokens.length} tokens
            </span>
          )}
        </div>
      </div>

      {/* Feed Content */}
      <div style={feedContainerStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <div style={{ 
              fontSize: '48px', 
              animation: 'spin 2s linear infinite',
            }}>
              ⚡
            </div>
            <div style={{ marginTop: '16px' }}>Loading {title.toLowerCase()}...</div>
          </div>
        ) : tokens.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👀</div>
            <div>No tokens yet</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              Waiting for new {type === 'newest' ? 'creations' : type === 'bonding' ? 'opportunities' : 'graduations'}...
            </div>
          </div>
        ) : (
          tokens.map(token => (
            <TokenCard
              key={token.mintAddress}
              token={token}
              showChart={true}
              showVolume={true}
              bondingProgress={type === 'bonding' ? token.bondingProgress : undefined}
            />
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(0, 245, 255, 0.1);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb {
          background: ${dckNeonTheme.colors.neonCyan};
          border-radius: 3px;
          box-shadow: 0 0 6px ${dckNeonTheme.colors.neonCyan};
        }
        div::-webkit-scrollbar-thumb:hover {
          background: ${dckNeonTheme.colors.neonPink};
        }
      `}</style>
    </div>
  );
};

export default TokenFeed;
