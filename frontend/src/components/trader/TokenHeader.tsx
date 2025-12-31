/**
 * TokenHeader Component
 * 
 * Graffiti-styled header row for trader terminal
 * Features:
 * - Token info (icon, name, symbol, stats)
 * - Market metrics (price, MC, volume, changes)
 * - LP/Authority tags with neon badges
 * - BUY/SELL/SNIPE action buttons
 * - Pink→Purple→Cyan gradient styling
 */

import React from 'react';
import { SnipeButton } from '../SnipeButton';

// =============================================
// TYPES
// =============================================

interface TokenHeaderProps {
  tokenData: {
    mint: string;
    symbol: string;
    name: string;
    image?: string;
    price: number;
    marketCap: number;
    volume24h: number;
    priceChange5m: number;
    priceChange1h: number;
    priceChange24h: number;
    age: number;
    liquidity: number;
    holderCount: number;
    bondingProgress: number;
    lpLocked: boolean;
    lpBurned: boolean;
    isRenounced: boolean;
    authorityRisk: boolean;
    createdAt?: number;
  };
  onBuy: () => void;
  onSell: () => void;
}

// =============================================
// HELPERS
// =============================================

function formatPrice(price: number): string {
  if (price < 0.000001) return `$${price.toFixed(10)}`;
  if (price < 0.01) return `$${price.toFixed(8)}`;
  if (price < 1) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(4)}`;
}

function formatMarketCap(mc: number): string {
  if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(2)}M`;
  if (mc >= 1_000) return `$${(mc / 1_000).toFixed(1)}K`;
  return `$${mc.toFixed(0)}`;
}

function formatAge(ageSeconds: number): string {
  if (ageSeconds < 60) return `${Math.floor(ageSeconds)}s`;
  if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)}m`;
  if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)}h`;
  return `${Math.floor(ageSeconds / 86400)}d`;
}

// =============================================
// COMPONENT
// =============================================

export function TokenHeader({ tokenData, onBuy, onSell }: TokenHeaderProps) {
  const {
    mint,
    symbol,
    name,
    image,
    price,
    marketCap,
    volume24h,
    priceChange5m,
    priceChange1h,
    priceChange24h,
    age,
    liquidity,
    holderCount,
    bondingProgress,
    lpLocked,
    lpBurned,
    isRenounced,
    authorityRisk,
    createdAt,
  } = tokenData;

  return (
    <>
      <style>
        {`
          @keyframes headerGlow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(0,228,255,0.3), 0 4px 30px rgba(255,62,191,0.2);
            }
            50% {
              box-shadow: 0 0 35px rgba(0,228,255,0.5), 0 4px 40px rgba(255,62,191,0.4);
            }
          }

          @keyframes dripFall {
            0% {
              transform: translateY(0);
              opacity: 0.8;
            }
            100% {
              transform: translateY(8px);
              opacity: 0;
            }
          }

          @keyframes pulseBadge {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
        `}
      </style>

      <div
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(255,62,191,0.12), rgba(155,0,255,0.1), rgba(0,228,255,0.08))',
          borderBottom: '3px solid rgba(0,228,255,0.6)',
          animation: 'headerGlow 4s ease-in-out infinite',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Top gradient line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
            filter: 'blur(2px)',
          }}
        />

        {/* Spray drips */}
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '15%',
            width: '4px',
            height: '10px',
            background: 'rgba(0,228,255,0.8)',
            borderRadius: '0 0 2px 2px',
            filter: 'drop-shadow(0 0 4px rgba(0,228,255,0.9))',
            animation: 'dripFall 3s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            left: '45%',
            width: '3px',
            height: '12px',
            background: 'rgba(155,0,255,0.8)',
            borderRadius: '0 0 2px 2px',
            filter: 'drop-shadow(0 0 4px rgba(155,0,255,0.9))',
            animation: 'dripFall 2.5s ease-in-out infinite 0.5s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -7,
            left: '75%',
            width: '4px',
            height: '11px',
            background: 'rgba(255,62,191,0.8)',
            borderRadius: '0 0 2px 2px',
            filter: 'drop-shadow(0 0 4px rgba(255,62,191,0.9))',
            animation: 'dripFall 3.5s ease-in-out infinite 1s',
          }}
        />

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Token Icon + Name */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: '300px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: image ? `url(${image})` : 'linear-gradient(135deg, #FF3EBF, #9B00FF)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid rgba(0,228,255,0.6)',
                boxShadow: '0 0 20px rgba(0,228,255,0.5)',
              }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'Impact, Anton, Arial Black, sans-serif',
                  letterSpacing: '1.5px',
                  background: 'linear-gradient(135deg, #FF3EBF, #9B00FF, #00E4FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 15px rgba(0,228,255,0.8)',
                  filter: 'drop-shadow(0 0 8px rgba(255,62,191,0.6))',
                }}
              >
                ${symbol}
              </h1>
              <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>{name}</div>
              <div
                style={{
                  fontSize: '10px',
                  opacity: 0.5,
                  fontFamily: 'monospace',
                  marginTop: '4px',
                }}
              >
                {mint.slice(0, 8)}...{mint.slice(-6)}
              </div>
            </div>
          </div>

          {/* Market Stats Grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {/* Price */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>PRICE</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#00E4FF',
                  textShadow: '0 0 10px rgba(0,228,255,0.8)',
                }}
              >
                {formatPrice(price)}
              </div>
            </div>

            {/* Market Cap */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>MARKET CAP</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#9B00FF',
                  textShadow: '0 0 10px rgba(155,0,255,0.8)',
                }}
              >
                {formatMarketCap(marketCap)}
              </div>
            </div>

            {/* Volume 24h */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>VOLUME 24H</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FF3EBF',
                  textShadow: '0 0 10px rgba(255,62,191,0.8)',
                }}
              >
                {formatMarketCap(volume24h)}
              </div>
            </div>

            {/* Age */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>AGE</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: age < 300 ? '#FF3EBF' : '#00FF8C',
                  textShadow: `0 0 10px ${age < 300 ? 'rgba(255,62,191,0.8)' : 'rgba(0,255,140,0.8)'}`,
                }}
              >
                {formatAge(age)}
              </div>
            </div>

            {/* 5m Change */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>5M</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: priceChange5m >= 0 ? '#00FF8C' : '#FF3E3E',
                  textShadow: `0 0 10px ${priceChange5m >= 0 ? 'rgba(0,255,140,0.8)' : 'rgba(255,62,62,0.8)'}`,
                }}
              >
                {priceChange5m >= 0 ? '+' : ''}{priceChange5m.toFixed(1)}%
              </div>
            </div>

            {/* 1h Change */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>1H</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: priceChange1h >= 0 ? '#00FF8C' : '#FF3E3E',
                  textShadow: `0 0 10px ${priceChange1h >= 0 ? 'rgba(0,255,140,0.8)' : 'rgba(255,62,62,0.8)'}`,
                }}
              >
                {priceChange1h >= 0 ? '+' : ''}{priceChange1h.toFixed(1)}%
              </div>
            </div>

            {/* 24h Change */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>24H</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: priceChange24h >= 0 ? '#00FF8C' : '#FF3E3E',
                  textShadow: `0 0 10px ${priceChange24h >= 0 ? 'rgba(0,255,140,0.8)' : 'rgba(255,62,62,0.8)'}`,
                }}
              >
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(1)}%
              </div>
            </div>

            {/* Liquidity */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>LIQUIDITY</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#00E4FF',
                  textShadow: '0 0 10px rgba(0,228,255,0.8)',
                }}
              >
                {formatMarketCap(liquidity)}
              </div>
            </div>

            {/* Holders */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>HOLDERS</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{holderCount.toLocaleString()}</div>
            </div>

            {/* Bonding Progress */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>BONDING</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: bondingProgress >= 100 ? '#00FF8C' : bondingProgress >= 70 ? '#FFD700' : '#FF8C00',
                  textShadow: `0 0 10px ${bondingProgress >= 100 ? 'rgba(0,255,140,0.8)' : 'rgba(255,140,0,0.8)'}`,
                }}
              >
                {bondingProgress.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Tags + Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
            {/* Security Tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {lpLocked && (
                <div
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(0,255,140,0.2)',
                    border: '1px solid rgba(0,255,140,0.6)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#00FF8C',
                    textShadow: '0 0 8px rgba(0,255,140,0.8)',
                    animation: 'pulseBadge 2s ease-in-out infinite',
                  }}
                >
                  🔒 LP LOCKED
                </div>
              )}
              {lpBurned && (
                <div
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(255,140,0,0.2)',
                    border: '1px solid rgba(255,140,0,0.6)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#FF8C00',
                    textShadow: '0 0 8px rgba(255,140,0,0.8)',
                  }}
                >
                  🔥 LP BURNED
                </div>
              )}
              {isRenounced && (
                <div
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(0,228,255,0.2)',
                    border: '1px solid rgba(0,228,255,0.6)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#00E4FF',
                    textShadow: '0 0 8px rgba(0,228,255,0.8)',
                  }}
                >
                  ✅ RENOUNCED
                </div>
              )}
              {authorityRisk && (
                <div
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(255,62,62,0.2)',
                    border: '1px solid rgba(255,62,62,0.6)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#FF3E3E',
                    textShadow: '0 0 8px rgba(255,62,62,0.8)',
                    animation: 'pulseBadge 1.5s ease-in-out infinite',
                  }}
                >
                  ⚠️ AUTHORITY RISK
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onBuy}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, rgba(0,255,140,0.8), rgba(0,228,255,0.7))',
                  border: '2px solid rgba(0,255,140,0.8)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#000',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0,255,140,0.5)',
                  transition: 'all 0.15s ease',
                  textShadow: '0 0 8px rgba(0,255,140,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,140,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,140,0.5)';
                }}
              >
                🟢 BUY
              </button>

              <button
                onClick={onSell}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, rgba(255,62,62,0.8), rgba(255,62,191,0.7))',
                  border: '2px solid rgba(255,62,62,0.8)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#000',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(255,62,62,0.5)',
                  transition: 'all 0.15s ease',
                  textShadow: '0 0 8px rgba(255,62,62,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(255,62,62,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255,62,62,0.5)';
                }}
              >
                🔴 SELL
              </button>
            </div>

            {/* Snipe Button */}
            <SnipeButton tokenMint={mint} createdAt={createdAt} />
          </div>
        </div>
      </div>
    </>
  );
}

export default TokenHeader;
