import { useState, useEffect } from 'react';

interface CoinInfo {
  address: string;
  name: string;
  logo: string;
  age: number;
  marketCap: number;
  price: number;
  bondingProgress: number;
  alive: boolean;
}

interface LiveFeedResult {
  newCoins: CoinInfo[];
  midCoins: CoinInfo[];
  gradCoins: CoinInfo[];
  isLoading: boolean;
}

export const useLiveFeed = (): LiveFeedResult => {
  const [newCoins, setNewCoins] = useState<CoinInfo[]>([]);
  const [midCoins, setMidCoins] = useState<CoinInfo[]>([]);
  const [gradCoins, setGradCoins] = useState<CoinInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/live`);
        
        if (!response.ok) {
          console.error(`API error: ${response.status}`);
          return;
        }

        const coins: CoinInfo[] = await response.json();

        // Filter out dead coins
        const aliveCoins = coins.filter(coin => coin.alive !== false);

        // Classify coins into buckets
        const newBucket: CoinInfo[] = [];
        const midBucket: CoinInfo[] = [];
        const gradBucket: CoinInfo[] = [];

        aliveCoins.forEach(coin => {
          if (coin.marketCap < 11000) {
            newBucket.push(coin);
          } else if (coin.bondingProgress < 100) {
            midBucket.push(coin);
          } else {
            gradBucket.push(coin);
          }
        });

        // Sort each bucket
        // newCoins: newest first (higher age = older, so DESC puts newest first)
        newBucket.sort((a, b) => b.age - a.age);

        // midCoins: lowest bondingProgress first
        midBucket.sort((a, b) => a.bondingProgress - b.bondingProgress);

        // gradCoins: highest market cap last (ascending order)
        gradBucket.sort((a, b) => a.marketCap - b.marketCap);

        setNewCoins(newBucket);
        setMidCoins(midBucket);
        setGradCoins(gradBucket);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch live feed:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchCoins();

    // Set up auto-refresh every 4 seconds
    const interval = setInterval(fetchCoins, 4000);

    return () => clearInterval(interval);
  }, []);

  return { newCoins, midCoins, gradCoins, isLoading };
};
