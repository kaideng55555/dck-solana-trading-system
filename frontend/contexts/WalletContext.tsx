/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers, BrowserProvider, Signer } from 'ethers';

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);

  const isConnected = !!account && !!provider;

  const updateBalance = useCallback(async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    }
  }, [provider, account]);

  const updateChainId = useCallback(async () => {
    if (provider) {
      try {
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      } catch (error) {
        console.error('Failed to update chain ID:', error);
      }
    }
  }, [provider]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setBalance('0');
    } else if (accounts[0] !== account) {
      // User switched accounts
      setAccount(accounts[0]);
    }
  }, [account]);

  const handleChainChanged = useCallback(() => {
    // Reload the page on chain change as recommended by MetaMask
    window.location.reload();
  }, []);

  const handleDisconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setChainId(null);
  }, []);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setAccount(accounts[0].address);
            setProvider(provider);
            setSigner(signer);
          }
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    };

    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect]);

  useEffect(() => {
    if (provider && account) {
      updateBalance();
      updateChainId();
    }
  }, [provider, account, updateBalance, updateChainId]);

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to connect your wallet');
      return;
    }

    try {
      setIsConnecting(true);
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      
      setAccount(account);
      setProvider(provider);
      setSigner(signer);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setChainId(null);
  }, []);

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: unknown) {
      // This error code indicates that the chain has not been added to MetaMask
      const err = error as { code?: number };
      if (err.code === 4902) {
        // Add network logic here if needed
        console.error('Network not added to wallet');
      } else {
        console.error('Error switching network:', error);
      }
    }
  };

  const value: WalletContextType = {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    balance,
    chainId,
    connect,
    disconnect,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Types for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (accounts: string[]) => void) => void;
      removeListener: (event: string, handler: (accounts: string[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}