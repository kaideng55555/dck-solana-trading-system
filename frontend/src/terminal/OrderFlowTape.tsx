/**
 * OrderFlowTape Component (Trader Terminal Module)
 * 
 * Real-time neon "Order Flow Tape" component for DCK Tools Trader Terminal
 * 
 * Features:
 * - Vertical scrolling list with newest events at bottom
 * - Auto-scroll upward as events arrive
 * - Max 150 events in memory
 * - Neon glow effects per trade type (BUY/SELL/SNIPE)
 * - Sound effects via D10 SFX system
 * - Spray texture backgrounds
 * - Slide-in animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useToken } from '../data/tokenDataStore';
import { useSFX } from '../sfx/useSFX';

// =============================================
// TYPES
// =============================================

interface OrderEvent {
  side: 'buy' | 'sell' | 'snipe';
  amountSol: number;
  priceUsd: number;
  timestamp: number;
  id: string; // Unique ID for React key
}

interface OrderFlowTapeProps {
  /** Token mint address */
  mint: string;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Format timestamp to HH:MM:SS
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format SOL amount with proper decimals
 */
function formatSol(amount: number): string {
  if (amount >= 1) return amount.toFixed(2);
  if (amount >= 0.1) return amount.toFixed(3);
  return amount.toFixed(4);
}

/**
 * Format USD price with proper decimals
 */
function formatPrice(price: number): string {
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
}

/**
 * Get emoji icon for trade side
 */
function getIcon(side: 'buy' | 'sell' | 'snipe'): string {
  switch (side) {
    case 'buy': return '🟢';
    case 'sell': return '🔴';
    case 'snipe': return '⚡';
  }
}

// =============================================
// COMPONENT
// =============================================

export const OrderFlowTape: React.FC<OrderFlowTapeProps> = ({ mint }) => {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEventsLengthRef = useRef(0);
  
  const token = useToken(mint);
  const { play } = useSFX();

  // Inject CSS animations (run once)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes wobble {
        from { transform: translateX(0); }
        50% { transform: translateX(2px); }
        to { transform: translateX(0); }
      }
      
      .order-flow-event:hover {
        animation: wobble 0.3s ease;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Monitor token data for new events
  // NOTE: Since Token type doesn't have history array, we'll simulate events
  // In production, this would subscribe to a WebSocket feed or token.history
  useEffect(() => {
    if (!token) return;

    // Simulate order flow events based on token market activity
    // In production, replace this with actual WebSocket subscription:
    // wsService.subscribeToTokenTrades(mint, handleNewTrade);
    
    const interval = setInterval(() => {
      // Generate mock events for demonstration
      // Remove this in production and use real data
      const mockSide: 'buy' | 'sell' | 'snipe' = 
        Math.random() > 0.7 ? 'snipe' : 
        Math.random() > 0.5 ? 'buy' : 'sell';
      
      const mockEvent: OrderEvent = {
        side: mockSide,
        amountSol: Math.random() * 2 + 0.1,
        priceUsd: token.market.price * (0.98 + Math.random() * 0.04),
        timestamp: Date.now(),
        id: `${Date.now()}-${Math.random()}`,
      };

      // Add event
      setEvents(prev => {
        const updated = [...prev, mockEvent];
        // Keep only last 150 events
        return updated.slice(-150);
      });

      // Play sound
      if (mockSide === 'buy') {
        play('buy');
      } else if (mockSide === 'sell') {
        play('sell');
      } else {
        play('shotgun'); // snipe
      }
    }, 3000); // New event every 3 seconds (adjust as needed)

    return () => clearInterval(interval);
  }, [token, mint, play]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (events.length > prevEventsLengthRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    prevEventsLengthRef.current = events.length;
  }, [events]);

  // =============================================
  // RENDER
  // =============================================

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const containerHeight = isMobile ? 220 : (window.innerWidth < 768 ? 200 : 300);

  return (
    <div
      style={{
        height: containerHeight,
        border: '2px solid transparent',
        borderRadius: '12px',
        background: 'linear-gradient(#0B0B0F, #0B0B0F) padding-box, linear-gradient(135deg, #00E4FF 0%, #8A2BE2 100%) border-box',
        padding: isMobile ? '10px' : '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        boxShadow: isMobile ? 'none' : '0 0 20px rgba(0,245,255,0.2)',
      }}
    >
      {/* Header */}
      <div
        className="dck-header-drip"
        style={{
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 700,
          color: '#00F5FF',
          textShadow: '0 0 10px rgba(0,245,255,0.8)',
          marginBottom: '8px',
          letterSpacing: '0.5px',
          textAlign: isMobile ? 'center' : 'left',
        }}
      >
        📊 ORDER FLOW TAPE
      </div>

      {/* Event list */}
      <div
        ref={containerRef}
        className="dck-glow-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          paddingRight: '4px',
        }}
      >
        {events.length === 0 ? (
          <div
            style={{
              color: '#6B7280',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            Waiting for trades...
          </div>
        ) : (
          events.map((event) => (
            <OrderEventRow key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
};

// =============================================
// EVENT ROW SUB-COMPONENT
// =============================================

interface OrderEventRowProps {
  event: OrderEvent;
}

const OrderEventRow: React.FC<OrderEventRowProps> = ({ event }) => {
  const { side, amountSol, priceUsd, timestamp } = event;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  // Determine colors based on side
  let glowColor: string;
  let textColor: string;
  let stripColor: string;
  
  switch (side) {
    case 'buy':
      glowColor = 'rgba(0,245,255,0.3)';
      textColor = '#00F5FF';
      stripColor = '#00F5FF';
      break;
    case 'sell':
      glowColor = 'rgba(255,62,191,0.3)';
      textColor = '#FF3EBF';
      stripColor = '#FF3EBF';
      break;
    case 'snipe':
      glowColor = 'rgba(155,0,255,0.3)';
      textColor = '#9B00FF';
      stripColor = '#9B00FF';
      break;
  }

  return (
    <div
      className="order-flow-event"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '6px' : '8px',
        padding: isMobile ? '8px 6px' : '6px 8px',
        borderRadius: '6px',
        background: `linear-gradient(90deg, ${glowColor} 0%, rgba(22,22,33,0.5) 100%)`,
        borderLeft: `2px solid ${stripColor}`,
        boxShadow: `0 0 8px ${glowColor}`,
        fontSize: isMobile ? '13px' : '12px',
        fontWeight: 500,
        animation: 'slideInRight 0.3s ease-out',
        cursor: 'default',
        transition: 'all 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Spray texture overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <span style={{ fontSize: '14px', flexShrink: 0 }}>
        {getIcon(side)}
      </span>

      {/* Side label */}
      <span
        style={{
          color: textColor,
          textShadow: `0 0 6px ${glowColor}`,
          fontWeight: 700,
          minWidth: '42px',
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '0.5px',
        }}
      >
        {side}
      </span>

      {/* Amount */}
      <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
        {formatSol(amountSol)} SOL
      </span>

      {/* Price (if not snipe) */}
      {side !== 'snipe' && (
        <>
          <span style={{ color: '#6B7280' }}>@</span>
          <span style={{ color: '#B8BCC8' }}>
            ${formatPrice(priceUsd)}
          </span>
        </>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Timestamp */}
      <span
        style={{
          color: '#6B7280',
          fontSize: '10px',
          fontWeight: 400,
          textShadow: `0 0 4px ${glowColor}`,
        }}
      >
        {formatTime(timestamp)}
      </span>
    </div>
  );
};

export default OrderFlowTape;
