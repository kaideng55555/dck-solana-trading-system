import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dckNeonTheme } from '../../../styles/dckNeonTheme';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'explorer', icon: '🔍', label: 'Explorer', path: '/explorer' },
  { id: 'terminal', icon: '📊', label: 'Terminal', path: '/terminal' },
  { id: 'wallets', icon: '💰', label: 'Wallets', path: '/wallets' },
  { id: 'portfolio', icon: '📈', label: 'Portfolio', path: '/portfolio' },
  { id: 'alerts', icon: '🔔', label: 'Alerts', path: '/alerts' },
  { id: 'creator', icon: '🎨', label: 'Creator', path: '/creator' },
  { id: 'nft', icon: '🖼️', label: 'NFT', path: '/nft' },
  { id: 'sniper', icon: '🎯', label: 'Sniper', path: '/sniper' },
];

const GlobalSidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === '/terminal') {
      return location.pathname.startsWith('/terminal');
    }
    return location.pathname === path;
  };

  return (
    <aside
      className="dck-glow-scrollbar global-sidebar"
      style={{
        position: 'fixed',
        left: 0,
        top: '70px',
        bottom: 0,
        width: '84px',
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRight: `1px solid ${dckNeonTheme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        gap: '12px',
        zIndex: 40,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.id}
            to={item.path}
            className="dck-neon-jitter"
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              borderRadius: '12px',
              textDecoration: 'none',
              background: active
                ? `linear-gradient(135deg, ${dckNeonTheme.colors.neonPink}15, ${dckNeonTheme.colors.neonCyan}15)`
                : 'transparent',
              border: active
                ? `1px solid ${dckNeonTheme.colors.neonCyan}`
                : '1px solid transparent',
              boxShadow: active
                ? `0 0 20px ${dckNeonTheme.colors.neonCyan}40`
                : 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.borderColor = dckNeonTheme.colors.neonCyan;
              e.currentTarget.style.boxShadow = `0 0 20px ${dckNeonTheme.colors.neonCyan}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              if (!active) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: active ? dckNeonTheme.colors.neonCyan : dckNeonTheme.colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Hide scrollbar */}
      <style>{`
        .global-sidebar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </aside>
  );
};

export default GlobalSidebar;
