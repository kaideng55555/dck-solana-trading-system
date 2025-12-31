import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DCKNeonLogo } from '../../../components/DCKNeonLogo';
import { dckNeonTheme } from '../../../styles/dckNeonTheme';
import { useSFX } from '../../sfx/useSFX';

interface NavTab {
  id: string;
  label: string;
  path: string;
}

const NAV_TABS: NavTab[] = [
  { id: 'explorer', label: 'Explorer', path: '/explorer' },
  { id: 'terminal', label: 'Terminal', path: '/terminal' },
  { id: 'wallets', label: 'Wallets', path: '/wallets' },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio' },
  { id: 'alerts', label: 'Alerts', path: '/alerts' },
  { id: 'creator', label: 'Creator', path: '/creator' },
  { id: 'nft', label: 'NFT', path: '/nft' },
  { id: 'sniper', label: 'Sniper', path: '/sniper' },
];

const GlobalHeader: React.FC = () => {
  const location = useLocation();
  const { play } = useSFX();

  const handleNavClick = () => {
    // Navigation click - no sound for now
  };

  const isActiveTab = (path: string): boolean => {
    if (path === '/terminal') {
      return location.pathname.startsWith('/terminal');
    }
    return location.pathname === path;
  };

  // Inject CSS animation on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes headerSlideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
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
    <header
      style={{
        animation: 'headerSlideIn 0.35s ease-out forwards',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: `2px solid transparent`,
        borderImage: `linear-gradient(to right, ${dckNeonTheme.colors.neonPink}, ${dckNeonTheme.colors.neonPurple}, ${dckNeonTheme.colors.neonCyan}) 1`,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Left Section: Logo + Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '200px',
        }}
      >
        <div style={{ transform: 'scale(0.7)' }}>
          <DCKNeonLogo />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h1
            className="dck-header-drip"
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 900,
              background: `linear-gradient(to right, ${dckNeonTheme.colors.neonPink}, ${dckNeonTheme.colors.neonCyan})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '1px',
            }}
          >
            DCK TOOLS
          </h1>
          <span
            style={{
              fontSize: '9px',
              color: dckNeonTheme.colors.textSecondary,
              letterSpacing: '1.5px',
              fontWeight: 600,
            }}
          >
            NEON TRADING TERMINAL
          </span>
        </div>
      </div>

      {/* Center Section: Navigation Tabs */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          justifyContent: 'center',
          overflow: 'auto',
          padding: '0 20px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="nav-tabs-scroll"
      >
        {NAV_TABS.map((tab) => {
          const isActive = isActiveTab(tab.path);
          return (
            <Link
              key={tab.id}
              to={tab.path}
              onClick={handleNavClick}
              className="dck-neon-jitter"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                position: 'relative',
                color: isActive
                  ? dckNeonTheme.colors.neonCyan
                  : dckNeonTheme.colors.textSecondary,
                background: isActive
                  ? `linear-gradient(to right, ${dckNeonTheme.colors.neonPink}20, ${dckNeonTheme.colors.neonCyan}20)`
                  : 'transparent',
                borderBottom: isActive
                  ? `2px solid ${dckNeonTheme.colors.neonCyan}`
                  : '2px solid transparent',
                boxShadow: isActive
                  ? `0 0 15px ${dckNeonTheme.colors.neonCyan}60`
                  : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.textShadow = `0 0 10px ${dckNeonTheme.colors.neonCyan}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Section: SFX Toggle + Wallet Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '150px',
          justifyContent: 'flex-end',
        }}
      >
        {/* SFX Toggle Placeholder */}
        <div
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: dckNeonTheme.colors.textSecondary,
            border: `1px solid ${dckNeonTheme.colors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = dckNeonTheme.colors.neonCyan;
            e.currentTarget.style.color = dckNeonTheme.colors.neonCyan;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = dckNeonTheme.colors.border;
            e.currentTarget.style.color = dckNeonTheme.colors.textSecondary;
          }}
        >
          SFX
        </div>

        {/* Wallet Status Placeholder */}
        <div
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: dckNeonTheme.colors.textPrimary,
            background: `linear-gradient(135deg, ${dckNeonTheme.colors.neonPink}20, ${dckNeonTheme.colors.neonPurple}20)`,
            border: `1px solid ${dckNeonTheme.colors.neonPink}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: `0 0 10px ${dckNeonTheme.colors.neonPink}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 0 20px ${dckNeonTheme.colors.neonPink}80`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 0 10px ${dckNeonTheme.colors.neonPink}40`;
          }}
        >
          WALLET
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .nav-tabs-scroll::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1024px) {
          .nav-tabs-scroll {
            justify-content: flex-start;
            overflow-x: auto;
          }
        }
      `}</style>
    </header>
  );
};

export default GlobalHeader;
