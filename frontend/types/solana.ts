// TypeScript interfaces for Solana token data

export interface SolanaTokenInfo {
  mintAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  age: number;
  liquidityLocked: boolean;
  isVerified: boolean;
}

export interface TokenPriceUpdate {
  mintAddress: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  timestamp: number;
}

export interface NewMintEvent {
  mintAddress: string;
  symbol: string;
  name: string;
  timestamp: number;
  initialLiquidity?: number;
  totalSupply?: string;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  bondingProgress?: number;
  liquidity?: number;
  age?: number;
  holders?: number;
  isVerified?: boolean;
  riskScore?: number;
}

export interface AuthorityEvent {
  mintAddress: string;
  symbol?: string;
  type: 'mint_authority_change' | 'freeze_authority_change' | 'mint_revoked' | 'freeze_revoked';
  eventType?: 'freeze' | 'mint';
  authority: string | null;
  description?: string;
  timestamp: number;
}

export interface LiquidityEvent {
  mintAddress: string;
  type: 'add' | 'remove';
  amount: number;
  poolAddress: string;
  timestamp: number;
}

export interface TokenData {
  mintAddress: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  bondingProgress?: number;
  timestamp: number;
}

export interface SnipeOpportunity {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string;
  price: number;
  marketCap: number;
  liquidity: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  timestamp: number;
}
