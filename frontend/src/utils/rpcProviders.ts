// src/utils/rpcProviders.ts
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { JsonRpcProvider } from 'ethers';

export function getSolanaConnection(): Connection {
  const network = (import.meta.env.VITE_NETWORK as string) || 'mainnet-beta';
  const custom = (import.meta.env as any).VITE_SOLANA_RPC_URL as string | undefined;
  const url = custom && custom.startsWith('http') ? custom : clusterApiUrl(network);
  return new Connection(url, 'confirmed');
}

export function getEvmProvider() {
  const url = (import.meta.env as any).VITE_EVM_RPC_URL as string | undefined;
  if (!url) {
    console.warn('[rpcProviders] VITE_EVM_RPC_URL not set; using default may be rate-limited');
  }
  return new JsonRpcProvider(url);
}
