import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import GlobalHeader from './GlobalHeader';
import GlobalSidebar from './GlobalSidebar';
import { dckNeonTheme } from '../../../styles/dckNeonTheme';

const AppLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Inject CSS animations on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes mainFadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className="dck-spray-noise"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        background: dckNeonTheme.colors.bg,
        color: dckNeonTheme.colors.textPrimary,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '84px 1fr',
        gridTemplateRows: 'auto 1fr',
        overflow: 'hidden',
      }}
    >
      {/* Global Header - Spans both columns */}
      <div
        style={{
          gridColumn: isMobile ? '1' : '1 / -1',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <GlobalHeader />
      </div>

      {/* Global Sidebar - Desktop only */}
      {!isMobile && (
        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <GlobalSidebar />
        </div>
      )}

      {/* Main Content Area */}
      <main
        style={{
          gridColumn: isMobile ? '1' : '2',
          gridRow: '2',
          padding: '20px',
          maxWidth: '100vw',
          overflowX: 'hidden',
          overflowY: 'auto',
          animation: 'mainFadeIn 0.35s ease-out forwards',
          marginTop: '70px', // Account for fixed header
          marginLeft: isMobile ? '0' : '84px', // Account for fixed sidebar
          minHeight: 'calc(100vh - 70px)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
