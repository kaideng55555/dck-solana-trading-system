/**
 * Mock API - Temporary fake data source
 * Simulates backend API responses for development
 * Replace with real API endpoints in production
 */

import type { RawTokenData, ApiResponse } from './tokenTypes';

/**
 * Token name pools for realistic mock data
 */
const TOKEN_NAMES = [
  'CYBER', 'NEON', 'AKIRA', 'DEGEN', 'GHOST', 'SYNTH', 'PUNK', 'BLADE',
  'TOKYO', 'SAMURAI', 'SHINJI', 'SPIKE', 'VASH', 'GOKU', 'LUFFY', 'NARUTO',
  'COWBOY', 'BEBOP', 'CHAMPLOO', 'DANDY', 'MEGALO', 'PSYCHO', 'SERIAL',
  'LAIN', 'TRIGUN', 'OUTLAW', 'JOJO', 'STAND', 'HAMON', 'TITAN',
  'DRAGON', 'PHOENIX', 'RAIDEN', 'SHOGUN', 'RONIN', 'NINJA', 'SENSEI',
  'KAIJU', 'MECHA', 'GUNDAM', 'EVA', 'FRANXX', 'CODE', 'GEASS',
];

const EMOJI_LOGOS = [
  '🚀', '💎', '⚡', '🔥', '🌙', '⭐', '💫', '🎯', '👾', '🤖',
  '⚔️', '🗡️', '🛡️', '👑', '💀', '🌊', '🌸', '🎴', '🎲', '🎰',
];

/**
 * Generate a random Solana address
 */
function randomSolanaAddress(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

/**
 * Generate random number in range
 */
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer in range
 */
function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max));
}

/**
 * Generate a single mock token
 */
function generateMockToken(index: number): RawTokenData {
  const now = Date.now();
  const ageSeconds = randomInt(60, 86400); // 1 minute to 24 hours
  const createdAt = now - (ageSeconds * 1000);
  
  const name = TOKEN_NAMES[index % TOKEN_NAMES.length] + 
    (index >= TOKEN_NAMES.length ? randomInt(1, 999) : '');
  const symbol = name;
  
  const bondingProgress = randomInRange(0, 100);
  const isMigrated = bondingProgress >= 100 || Math.random() > 0.8;
  
  const price = parseFloat(randomInRange(0.000001, 10).toFixed(8));
  const liquidity = randomInRange(500, 500000);
  const volume24h = randomInRange(100, liquidity * 0.5);
  const marketCap = price * randomInRange(1000000, 1000000000);
  
  const lpBurned = Math.random() > 0.3;
  const mintDisabled = Math.random() > 0.4;
  const freezeDisabled = Math.random() > 0.4;
  
  const hasSocials = Math.random() > 0.4;
  const hasTwitter = hasSocials && Math.random() > 0.3;
  const hasTelegram = hasSocials && Math.random() > 0.3;
  
  return {
    mint: randomSolanaAddress(),
    name,
    symbol,
    image: EMOJI_LOGOS[index % EMOJI_LOGOS.length],
    decimals: 9,
    
    price,
    marketCap,
    liquidity,
    volume24h,
    priceChange24h: randomInRange(-50, 200),
    
    bondingProgress,
    migrated: isMigrated,
    
    mintAuthority: mintDisabled ? null : randomSolanaAddress(),
    freezeAuthority: freezeDisabled ? null : randomSolanaAddress(),
    
    lpBurned,
    
    twitter: hasTwitter ? `https://twitter.com/${name.toLowerCase()}` : undefined,
    telegram: hasTelegram ? `https://t.me/${name.toLowerCase()}` : undefined,
    
    createdAt,
    holders: randomInt(10, 5000),
    alive: true,
  };
}

/**
 * Mock API delay (simulates network latency)
 */
async function mockDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch all tokens from mock API
 * In production, replace with: fetch('/api/tokens')
 */
export async function fetchTokens(count: number = 100): Promise<ApiResponse<RawTokenData[]>> {
  try {
    await mockDelay(500); // Simulate network delay
    
    const tokens: RawTokenData[] = [];
    for (let i = 0; i < count; i++) {
      tokens.push(generateMockToken(i));
    }
    
    return {
      success: true,
      data: tokens,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tokens',
      timestamp: Date.now(),
    };
  }
}

/**
 * Fetch single token by mint address
 * In production, replace with: fetch(`/api/tokens/${mint}`)
 */
export async function fetchTokenByMint(mint: string): Promise<ApiResponse<RawTokenData>> {
  try {
    await mockDelay(200);
    
    // For demo, generate a token with the given mint
    const token = generateMockToken(0);
    token.mint = mint;
    
    return {
      success: true,
      data: token,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch token',
      timestamp: Date.now(),
    };
  }
}

/**
 * Fetch new tokens (created in last N minutes)
 * In production, replace with: fetch(`/api/tokens/new?minutes=${minutes}`)
 */
export async function fetchNewTokens(minutes: number = 60): Promise<ApiResponse<RawTokenData[]>> {
  try {
    await mockDelay(400);
    
    const now = Date.now();
    const cutoff = now - (minutes * 60 * 1000);
    
    const tokens: RawTokenData[] = [];
    const count = randomInt(5, 20);
    
    for (let i = 0; i < count; i++) {
      const token = generateMockToken(i);
      // Override createdAt to be recent
      token.createdAt = randomInt(cutoff, now);
      tokens.push(token);
    }
    
    return {
      success: true,
      data: tokens,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch new tokens',
      timestamp: Date.now(),
    };
  }
}

/**
 * Simulate price updates for existing tokens
 * Returns partial updates (only price + volume data)
 */
export async function fetchPriceUpdates(mints: string[]): Promise<ApiResponse<Partial<RawTokenData>[]>> {
  try {
    await mockDelay(150);
    
    const updates = mints.map(mint => ({
      mint,
      price: parseFloat(randomInRange(0.000001, 10).toFixed(8)),
      volume24h: randomInRange(100, 100000),
      priceChange24h: randomInRange(-30, 100),
    }));
    
    return {
      success: true,
      data: updates,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch price updates',
      timestamp: Date.now(),
    };
  }
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<ApiResponse<{ status: string }>> {
  await mockDelay(100);
  
  return {
    success: true,
    data: { status: 'ok' },
    timestamp: Date.now(),
  };
}
