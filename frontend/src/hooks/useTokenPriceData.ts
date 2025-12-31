import { useState, useEffect } from 'react';
import { tokenAPI } from '../services/api';
import { wsService } from '../services/websocket';
import { TokenPriceUpdate } from '../types/solana';

interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

export const useTokenPriceData = (mintAddress: string) => {
  const [data, setData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!mintAddress) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch initial historical data
        const historicalData = await tokenAPI.getTokenPrice(mintAddress);
        if (isMounted) {
          // Assuming historicalData is an array of price points
          setData(historicalData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
        console.error('Failed to fetch historical price data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Subscribe to real-time updates
    wsService.connect();
    wsService.subscribeToTokenPrice(mintAddress, (priceUpdate: TokenPriceUpdate) => {
      if (isMounted) {
        setData(prevData => [...prevData, {
          timestamp: priceUpdate.timestamp,
          price: priceUpdate.price,
          volume: priceUpdate.volume24h,
        }]);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
      wsService.unsubscribeFromToken(mintAddress);
      // Consider if we should disconnect here or manage it globally
      // wsService.disconnect(); 
    };
  }, [mintAddress]);

  return { data, isLoading, error };
};
