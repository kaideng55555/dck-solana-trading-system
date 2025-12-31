import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Page Imports
import ExplorerDesktop from '../pages/ExplorerDesktop';
import TraderTerminal from '../pages/TraderTerminal';
import WalletDashboard from '../wallet/WalletDashboard';
import PortfolioDashboard from '../portfolio/PortfolioDashboard';
import AlertHistoryPanel from '../components/AlertHistoryPanel';
import NFTCreator from '../components/NFTCreator';
import SniperBot from '../components/SniperBot';

// =============================================
// PAGE WRAPPER COMPONENT WITH CSS TRANSITIONS
// =============================================

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Inject keyframes for page transitions
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pageEnter {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pageExit {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);

    // Trigger enter animation
    setIsVisible(true);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        animation: isVisible ? 'pageEnter 0.25s ease-out forwards' : 'none',
      }}
    >
      {children}
    </div>
  );
};

// =============================================
// ANIMATED ROUTES COMPONENT
// =============================================

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    setDisplayLocation(location);
  }, [location]);

  return (
    <Routes location={displayLocation} key={displayLocation.pathname}>
        {/* Root - Redirect to Explorer */}
        <Route path="/" element={<Navigate to="/explorer" replace />} />

        {/* Explorer Route */}
        <Route
          path="/explorer"
          element={
            <PageWrapper>
              <ExplorerDesktop />
            </PageWrapper>
          }
        />

        {/* Terminal Route */}
        <Route
          path="/terminal/:mint"
          element={
            <PageWrapper>
              <TraderTerminal />
            </PageWrapper>
          }
        />

        {/* Wallets Route */}
        <Route
          path="/wallets"
          element={
            <PageWrapper>
              <WalletDashboard />
            </PageWrapper>
          }
        />

        {/* Portfolio Route */}
        <Route
          path="/portfolio"
          element={
            <PageWrapper>
              <PortfolioDashboard />
            </PageWrapper>
          }
        />

        {/* Alerts Route */}
        <Route
          path="/alerts"
          element={
            <PageWrapper>
              <AlertHistoryPanel />
            </PageWrapper>
          }
        />

        {/* Token Creator Route */}
        <Route
          path="/creator"
          element={
            <PageWrapper>
              <TokenCreatorPlaceholder />
            </PageWrapper>
          }
        />

        {/* NFT Creator Route */}
        <Route
          path="/nft"
          element={
            <PageWrapper>
              <NFTCreator />
            </PageWrapper>
          }
        />

        {/* Sniper Bot Route */}
        <Route
          path="/sniper"
          element={
            <PageWrapper>
              <SniperBot />
            </PageWrapper>
          }
        />

        {/* Catch-all - Redirect to Explorer */}
        <Route path="*" element={<Navigate to="/explorer" replace />} />
      </Routes>
  );
};

// =============================================
// PLACEHOLDER COMPONENTS
// =============================================

const TokenCreatorPlaceholder: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #050508 0%, #0a0a14 100%)',
        color: '#00E4FF',
        fontFamily: "'Inter', sans-serif",
        padding: '40px',
      }}
    >
      <div
        style={{
          fontSize: '48px',
          fontWeight: 900,
          marginBottom: '24px',
          textShadow: '0 0 20px rgba(0,228,255,0.8)',
          fontFamily: "'Impact', 'Anton', sans-serif",
        }}
      >
        🪙 TOKEN CREATOR
      </div>
      <div
        style={{
          fontSize: '18px',
          color: '#9B00FF',
          textAlign: 'center',
          maxWidth: '600px',
          lineHeight: 1.6,
        }}
      >
        Create and deploy custom SPL tokens on Solana with configurable supply, decimals, and metadata.
        Coming soon to DCK Tools.
      </div>
      <div
        style={{
          marginTop: '32px',
          padding: '12px 24px',
          border: '2px solid #9B00FF',
          borderRadius: '8px',
          background: 'rgba(155,0,255,0.1)',
          color: '#9B00FF',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        UNDER CONSTRUCTION
      </div>
    </div>
  );
};

// =============================================
// MAIN APP ROUTER COMPONENT
// =============================================

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
