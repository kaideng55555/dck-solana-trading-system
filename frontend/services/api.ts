import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Solana token analysis endpoints
export const tokenAPI = {
  // Get SPL token metadata and security info
  getSolanaTokenInfo: async (mintAddress: string) => {
    const response = await apiClient.get(`/solana/tokens/${mintAddress}`);
    return response.data;
  },

  // Get new token mints by age
  getNewTokens: async (maxAgeHours = 1) => {
    const response = await apiClient.get('/solana/tokens/new', {
      params: { maxAgeHours }
    });
    return response.data;
  },

  // Get token mint/freeze/authority events
  getTokenEvents: async (mintAddress: string, limit = 100) => {
    const response = await apiClient.get(`/solana/tokens/${mintAddress}/events`, {
      params: { limit }
    });
    return response.data;
  },

  // Get token price data from Jupiter/Raydium
  getTokenPrice: async (mintAddress: string, timeframe = '1h') => {
    const response = await apiClient.get(`/solana/tokens/${mintAddress}/price`, {
      params: { timeframe }
    });
    return response.data;
  },

  // Get liquidity pool information
  getLiquidityPools: async (mintAddress: string) => {
    const response = await apiClient.get(`/solana/tokens/${mintAddress}/pools`);
    return response.data;
  },

  // Get snipe opportunities (new tokens with potential)
  getSnipeOpportunities: async (minLiquidity = 1000) => {
    const response = await apiClient.get('/solana/snipe/opportunities', {
      params: { minLiquidity }
    });
    return response.data;
  },

  // Monitor token for changes
  monitorToken: async (mintAddress: string) => {
    const response = await apiClient.post(`/solana/monitor/${mintAddress}`);
    return response.data;
  },

  // Search tokens by symbol or name
  searchTokens: async (query: string) => {
    const response = await apiClient.get('/solana/tokens/search', {
      params: { q: query }
    });
    return response.data;
  },
};

// Solana market data endpoints
export const marketAPI = {
  // Get trending Solana tokens
  getTrendingTokens: async (timeframe = '24h') => {
    const response = await apiClient.get('/solana/market/trending', {
      params: { timeframe }
    });
    return response.data;
  },

  // Get Solana market overview
  getMarketOverview: async () => {
    const response = await apiClient.get('/solana/market/overview');
    return response.data;
  },

  // Get token holders count and distribution
  getTokenHolders: async (mintAddress: string) => {
    const response = await apiClient.get(`/solana/tokens/${mintAddress}/holders`);
    return response.data;
  },
};

export default apiClient;