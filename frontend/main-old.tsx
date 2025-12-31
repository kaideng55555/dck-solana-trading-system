/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { WalletProvider } from './contexts/WalletContext';
import { WalletConnect } from './components/WalletConnect';
import { TokenPriceChart } from './components/TokenPriceChart';
import { TokenVolumeChart } from './components/TokenVolumeChart';
import { SolanaTokenMetrics } from './components/SolanaTokenMetrics';
import { LiveMonitoring } from './components/LiveMonitoring';
import { tokenAPI } from './services/api';

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

interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
}

function TokenAnalysisTab() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<SolanaTokenInfo | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [volumeData, setVolumeData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeToken = async () => {
    if (!tokenAddress) return;
    
    setIsLoading(true);
    try {
      const [info, price, volume] = await Promise.all([
        tokenAPI.getSolanaTokenInfo(tokenAddress),
        tokenAPI.getTokenPrice(tokenAddress, '24h'),
        tokenAPI.getTokenPrice(tokenAddress, '24h') // Placeholder for volume
      ]);
      
      setTokenInfo(info);
      setPriceData(price.data || []);
      setVolumeData(volume.data || []);
    } catch (error) {
      console.error('Error analyzing Solana token:', error);
      // Set mock data for development
      const mockTokenInfo: SolanaTokenInfo = {
        mintAddress: tokenAddress,
        symbol: 'DEMO',
        name: 'Demo Solana Token',
        decimals: 6,
        totalSupply: '1000000000',
        mintAuthority: null,
        freezeAuthority: null,
        holders: 1234,
        marketCap: 5000000,
        price: 0.000123,
        volume24h: 125000,
        priceChange24h: 12.5,
        createdAt: Date.now() / 1000 - 3600, // 1 hour ago
        age: 3600, // 1 hour old
        liquidityLocked: true,
        isVerified: false
      };
      setTokenInfo(mockTokenInfo);
      
      // Mock price data
      const mockData: PriceData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: Date.now() / 1000 - (24 - i) * 3600,
        price: 0.000123 * (1 + (Math.random() - 0.5) * 0.1),
        volume: Math.random() * 10000
      }));
      setPriceData(mockData);
      setVolumeData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
        🔍 Solana Token Analysis
      </h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Enter Solana token mint address..."
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          style={{
            flex: 1,
            minWidth: '300px',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={handleAnalyzeToken}
          disabled={!tokenAddress || isLoading}
          style={{
            padding: '10px 20px',
            background: (!tokenAddress || isLoading) ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: (!tokenAddress || isLoading) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Token'}
        </button>
      </div>

      {(tokenInfo || isLoading) && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <SolanaTokenMetrics tokenInfo={tokenInfo} isLoading={isLoading} />
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
            gap: '20px' 
          }}>
            <TokenPriceChart 
              data={priceData} 
              tokenSymbol={tokenInfo?.symbol || 'TOKEN'} 
              isLoading={isLoading}
            />
            <TokenVolumeChart 
              data={volumeData.map(d => ({ ...d, value: d.price * d.volume }))} 
              tokenSymbol={tokenInfo?.symbol || 'TOKEN'} 
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('analysis');

  const tabs = [
    { id: 'analysis', label: '🔍 Token Analysis', component: <TokenAnalysisTab /> },
    { id: 'monitoring', label: '📊 Live Monitoring', component: <LiveMonitoring isConnected={true} /> },
    { id: 'wallet', label: '💼 Wallet', component: <WalletConnect /> }
  ];

  return (
    <WalletProvider>
      <div style={{ 
        minHeight: '100vh',
        background: '#f8f9fa',
        fontFamily: 'sans-serif'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <h1 style={{ 
            margin: 0, 
            color: '#333',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            📊 DCK Tools Cop - Solana Token Analysis
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#666',
            fontSize: '16px'
          }}>
            Professional Solana token sniping and analysis platform - From brand new to established
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 20px'
        }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  background: activeTab === tab.id ? '#2563eb' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#666',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '0' }}>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </WalletProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);