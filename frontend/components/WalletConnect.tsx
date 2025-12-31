import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletConnect: React.FC = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    balance, 
    chainId, 
    connect, 
    disconnect,
    switchNetwork 
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return `Chain ${chainId}`;
    }
  };

  const getNetworkColor = (chainId: number | null) => {
    switch (chainId) {
      case 1: return '#627eea';
      case 5: 
      case 11155111: return '#f6b73c';
      case 137: return '#8247e5';
      case 56: return '#f3ba2f';
      default: return '#6b7280';
    }
  };

  if (!isConnected) {
    return (
      <div style={{ 
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
          🔗 Connect Wallet
        </h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Connect your wallet to interact with tokens and view your portfolio
        </p>
        <button
          onClick={connect}
          disabled={isConnecting}
          style={{
            padding: '12px 24px',
            background: isConnecting ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>
          💼 Wallet Connected
        </h3>
        <button
          onClick={disconnect}
          style={{
            padding: '6px 12px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Disconnect
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        {/* Wallet Address */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Address
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#333',
            fontFamily: 'monospace'
          }}>
            {formatAddress(account!)}
          </div>
        </div>

        {/* Balance */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            ETH Balance
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#333'
          }}>
            {formatBalance(balance)} ETH
          </div>
        </div>

        {/* Network */}
        <div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Network
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: getNetworkColor(chainId),
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getNetworkColor(chainId),
              marginRight: '8px'
            }} />
            {getNetworkName(chainId)}
          </div>
        </div>
      </div>

      {/* Network Switching */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Switch Network:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 1, name: 'Ethereum' },
            { id: 137, name: 'Polygon' },
            { id: 56, name: 'BSC' },
            { id: 11155111, name: 'Sepolia' }
          ].map((network) => (
            <button
              key={network.id}
              onClick={() => switchNetwork(network.id)}
              disabled={chainId === network.id}
              style={{
                padding: '6px 12px',
                background: chainId === network.id ? '#10b981' : '#f3f4f6',
                color: chainId === network.id ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: chainId === network.id ? 'default' : 'pointer'
              }}
            >
              {network.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};