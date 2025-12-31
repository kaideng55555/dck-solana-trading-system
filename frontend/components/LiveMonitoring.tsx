import React, { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import type { SnipeOpportunity, NewMintEvent, AuthorityEvent } from '../types/solana';

interface LiveMonitoringProps {
  isConnected?: boolean;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({
  isConnected = false,
}) => {
  const [opportunities, setOpportunities] = useState<SnipeOpportunity[]>([]);
  const [mintEvents, setMintEvents] = useState<NewMintEvent[]>([]);
  const [freezeEvents, setFreezeEvents] = useState<AuthorityEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (isConnected) {
      // Connect to WebSocket
      const socket = wsService.connect();

      socket.on('connect', () => {
        setConnectionStatus('connected');
      });

      socket.on('disconnect', () => {
        setConnectionStatus('disconnected');
      });

      socket.on('connect_error', () => {
        setConnectionStatus('connecting');
      });

      // Subscribe to snipe opportunities
      wsService.subscribeToSnipeOpportunities((opportunity) => {
        setOpportunities(prev => [opportunity, ...prev.slice(0, 9)]); // Keep last 10
      });

      // Subscribe to mint events
      wsService.subscribeToNewMints((event) => {
        setMintEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20
      });

      // Subscribe to freeze events
      wsService.subscribeToAuthorityEvents((event) => {
        setFreezeEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20
      });

      return () => {
        wsService.disconnect();
      };
    }
    // Connection status will be updated by socket events, not here
  }, [isConnected]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toString();
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Connection Status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          backgroundColor: getStatusColor(),
          marginRight: '8px'
        }} />
        <span style={{ fontWeight: 'bold' }}>
          WebSocket: {connectionStatus.toUpperCase()}
        </span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Snipe Opportunities */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            🎯 Snipe Opportunities
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {opportunities.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No opportunities detected
              </div>
            ) : (
              opportunities.map((opp, index) => (
                <div key={index} style={{ 
                  padding: '10px',
                  margin: '8px 0',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${getRiskColor(opp.risk)}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {opp.tokenSymbol} - {opp.tokenName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        ${opp.price.toFixed(8)} | MC: ${formatNumber(opp.marketCap)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>
                        {opp.reason}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        color: getRiskColor(opp.risk)
                      }}>
                        {opp.risk}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {formatTime(opp.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Mint Events */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            🆕 New Token Mints
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {mintEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No recent mints
              </div>
            ) : (
              mintEvents.map((event, index) => (
                <div key={index} style={{ 
                  padding: '8px',
                  margin: '6px 0',
                  background: '#f0f9ff',
                  borderRadius: '6px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {event.symbol || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Supply: {event.totalSupply ? formatNumber(Number(event.totalSupply)) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Freeze/Lock Events */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
            🔒 Freeze/Lock Events
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {freezeEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No recent freeze events
              </div>
            ) : (
              freezeEvents.map((event, index) => (
                <div key={index} style={{ 
                  padding: '8px',
                  margin: '6px 0',
                  background: event.eventType === 'freeze' ? '#fef2f2' : '#f0fdf4',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${event.eventType === 'freeze' ? '#ef4444' : '#10b981'}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {event.symbol || 'Unknown'} - {event.eventType?.toUpperCase() || event.type.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {event.description || `Authority: ${event.authority || 'Revoked'}`}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
