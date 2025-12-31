import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Connection } from "@solana/web3.js";
import { FeedBoot } from "./data/FeedBoot";
import GlobalLoadingScreen from "./components/GlobalLoadingScreen";
import { NeonTransitionLayer } from "./ui/NeonTransitionLayer";
import AppLayout from "./components/layout/AppLayout";
import ExplorerDesktop from "./pages/ExplorerDesktop";
import TraderTerminal from "./pages/TraderTerminal";
import WalletDashboard from "./wallet/WalletDashboard";
import PortfolioDashboard from "./portfolio/PortfolioDashboard";
import AlertHistoryPanel from "./components/AlertHistoryPanel";
import NFTCreator from "./components/NFTCreator";
import SniperBot from "./components/SniperBot";
import SwapModal from "./components/SwapModal";
import { useSwapStore } from "./stores/swapStore";
import AlertCenter from "./components/AlertCenter";
import { useFeedControls } from "./feed/useLiveTokens";

// Solana connection (devnet for development)
const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Placeholder component for Token Creator page
const TokenCreatorPlaceholder: React.FC = () => {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      color: '#00F5FF',
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🎨 Token Creator</h1>
      <p style={{ color: '#B8BCC8' }}>Token creator interface coming soon...</p>
    </div>
  );
};

// Home page component (redirects to explorer)
const Home: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/explorer');
  }, [navigate]);
  
  return null;
};

// Keyboard shortcuts handler component
const AppKeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // H key → navigate to /alerts
      if (e.key === 'h' || e.key === 'H') {
        navigate('/alerts');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return null;
};

export default function App() {
  const { isSwapOpen, closeSwap, selectedInput, selectedOutput } = useSwapStore();
  const { start } = useFeedControls();
  const [bootReady, setBootReady] = useState(false);
  const [bootLoadingCount, setBootLoadingCount] = useState(0);

  // Start FeedBoot on app mount
  useEffect(() => {
    console.log('[App] Starting FeedBoot...');
    FeedBoot.start();

    // Poll FeedBoot state until ready
    const checkInterval = setInterval(() => {
      setBootLoadingCount(FeedBoot.loadingCount);
      
      if (FeedBoot.ready && !bootReady) {
        console.log('[App] FeedBoot ready with', FeedBoot.loadingCount, 'tokens');
        setBootReady(true);
        clearInterval(checkInterval);
      }
    }, 100); // Check every 100ms

    return () => {
      clearInterval(checkInterval);
      console.log('[App] App unmounting');
    };
  }, [bootReady]);

  // Start global live feed on app mount
  useEffect(() => {
    console.log('[App] Starting global live feed engine...');
    start();
    
    return () => {
      console.log('[App] App unmounting - feed engine will persist');
    };
  }, [start]);

  // Show global loading screen until FeedBoot is ready
  if (!bootReady) {
    return (
      <GlobalLoadingScreen
        loadingCount={bootLoadingCount}
        ready={bootReady}
      />
    );
  }

  // Trigger neon transition when feed is ready
  const feedReady = bootReady;

  return (
    <>
      {/* Neon Spray-Paint Transition */}
      <NeonTransitionLayer active={feedReady} />

      <BrowserRouter>
        <AppKeyboardShortcuts />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explorer" element={<ExplorerDesktop />} />
            <Route path="/terminal/:mint" element={<TraderTerminal />} />
            <Route path="/wallets" element={<WalletDashboard />} />
            <Route path="/portfolio" element={<PortfolioDashboard />} />
            <Route path="/alerts" element={<AlertHistoryPanel />} />
            <Route path="/nft" element={<NFTCreator />} />
            <Route path="/creator" element={<TokenCreatorPlaceholder />} />
            <Route path="/sniper" element={<SniperBot />} />
          </Route>
        </Routes>

        {/* Global Swap Modal */}
        <SwapModal
          open={isSwapOpen}
          onClose={closeSwap}
          defaultInputToken={selectedInput}
          defaultOutputToken={selectedOutput}
          connection={connection}
          onSwapComplete={(result) => {
            console.log('Swap completed:', result);
            // Optional: Show success notification
          }}
        />

        {/* Global Alert Center (D13) */}
        <AlertCenter />
      </BrowserRouter>
    </>
  );
}