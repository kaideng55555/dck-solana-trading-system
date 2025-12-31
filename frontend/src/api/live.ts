/**
 * Mock API endpoint for live coin feed
 * Returns 20 fake coins with randomized data
 * Allows UI testing before real Solana integration
 */

export interface CoinInfo {
  address: string;
  name: string;
  logo: string;
  age: number; // in seconds
  marketCap: number;
  price: number;
  bondingProgress: number;
  alive: boolean;
}

// Pool of cyberpunk/anime themed token names
const TOKEN_NAMES = [
  'CYBER', 'NEON', 'AKIRA', 'DEGEN', 'GHOST', 'SYNTH', 'PUNK', 'BLADE',
  'TOKYO', 'SAMURAI', 'SHINJI', 'SPIKE', 'VASH', 'GOKU', 'LUFFY', 'NARUTO',
  'MECHA', 'PIXEL', 'CHAOS', 'SHADOW', 'VOLT', 'NOVA', 'ZERO', 'ALPHA',
  'BETA', 'GAMMA', 'DELTA', 'OMEGA', 'SIGMA', 'THETA', 'ZENITH', 'APEX'
];

// Emoji pool for placeholder logos
const LOGO_EMOJIS = [
  '🚀', '💎', '⚡', '🔥', '🌙', '⭐', '💫', '🎯',
  '🎨', '🎭', '👾', '🤖', '🦾', '🧬', '⚛️', '🔮',
  '💊', '🌊', '🌈', '☄️', '🎪', '🎰', '🎲', '🃏'
];

/**
 * Generate a random Solana-like address
 */
function generateRandomAddress(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

/**
 * Generate a random token name (avoid duplicates in same batch)
 */
function generateTokenName(usedNames: Set<string>): string {
  const availableNames = TOKEN_NAMES.filter(name => !usedNames.has(name));
  if (availableNames.length === 0) {
    // Fallback: add random number suffix
    return `TOKEN${Math.floor(Math.random() * 9999)}`;
  }
  const name = availableNames[Math.floor(Math.random() * availableNames.length)];
  usedNames.add(name);
  return name;
}

/**
 * Generate a random emoji logo
 */
function generateLogo(): string {
  return LOGO_EMOJIS[Math.floor(Math.random() * LOGO_EMOJIS.length)];
}

/**
 * Generate random age (0-500 minutes = 0-30000 seconds)
 */
function generateAge(): number {
  return Math.floor(Math.random() * 30000); // 0-500 minutes in seconds
}

/**
 * Generate random market cap (1000-200000)
 */
function generateMarketCap(): number {
  return Math.floor(Math.random() * 199000) + 1000; // 1000-200000
}

/**
 * Generate random price (realistic crypto decimals)
 */
function generatePrice(): number {
  // Random between 0.000001 and 10
  const exp = Math.random() * 7 - 6; // -6 to 1
  return parseFloat((Math.pow(10, exp) * (Math.random() * 9 + 1)).toFixed(8));
}

/**
 * Generate random bonding progress (0-100)
 */
function generateBondingProgress(): number {
  return Math.floor(Math.random() * 101); // 0-100
}

/**
 * Generate random alive status (70% true, 30% false)
 */
function generateAlive(): boolean {
  return Math.random() < 0.7;
}

/**
 * Generate a single fake coin
 */
function generateFakeCoin(usedNames: Set<string>): CoinInfo {
  return {
    address: generateRandomAddress(),
    name: generateTokenName(usedNames),
    logo: generateLogo(),
    age: generateAge(),
    marketCap: generateMarketCap(),
    price: generatePrice(),
    bondingProgress: generateBondingProgress(),
    alive: generateAlive()
  };
}

/**
 * Mock GET /api/live endpoint
 * Returns array of 20 fake coins
 */
export async function getLiveCoins(): Promise<CoinInfo[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const usedNames = new Set<string>();
  const coins: CoinInfo[] = [];
  
  for (let i = 0; i < 20; i++) {
    coins.push(generateFakeCoin(usedNames));
  }
  
  return coins;
}

/**
 * Express-style mock endpoint (if you want to mount this in a server)
 */
export async function handleLiveRequest(): Promise<Response> {
  const coins = await getLiveCoins();
  return new Response(JSON.stringify(coins), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Default export for convenience
export default {
  getLiveCoins,
  handleLiveRequest
};
