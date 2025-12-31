/**
 * DesktopSidebar - Navigation sidebar for desktop screens only
 * Hidden on mobile (< md breakpoint)
 * Fixed left sidebar with DCK neon theme
 */

import React, { memo } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'new', label: 'New Creations', icon: '🔥' },
  { id: 'graduating', label: 'Graduating Soon', icon: '🎓' },
  { id: 'graduated', label: 'Graduated', icon: '🟡' },
  { id: 'explorer', label: 'Explorer', icon: '🔍' },
  { id: 'wallet', label: 'Wallet', icon: '💎' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

interface DesktopSidebarProps {
  activeItem?: string;
  onNavigate?: (itemId: string) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = memo(({ 
  activeItem = 'dashboard',
  onNavigate 
}) => {
  const handleClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <aside className="hidden md:flex md:flex-col fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#0a0d11] via-[#0d1117] to-purple-900/20 border-r border-cyan-500/20 panel-shadow z-50">
      {/* Logo Header */}
      <div className="p-6 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center animate-glowPulse"
            style={{
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.4), 0 0 40px rgba(255, 65, 214, 0.2)',
            }}
          >
            <span className="text-2xl font-bold text-black">💎</span>
          </div>
          <div>
            <h1 
              className="text-xl font-bold gradient-text-cyan-pink text-glow-cyan"
            >
              DCK Tools
            </h1>
            <p className="text-xs text-gray-400">Solana Sniper</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 btn-neon panel-shadow
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-500/30 to-pink-500/20 border border-cyan-500/50 text-cyan-100'
                  : 'bg-gray-900/30 border border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-cyan-400 hover:border-cyan-500/30'
                }
              `}
              style={isActive ? {
                boxShadow: '0 0 15px rgba(0, 245, 255, 0.3), inset 0 0 10px rgba(0, 245, 255, 0.1)',
              } : undefined}
            >
              <span className="text-2xl">{item.icon}</span>
              <span 
                className={`flex-1 text-left font-medium ${
                  isActive ? 'text-cyan-100 text-glow-cyan' : 'text-gray-300'
                }`}
              >
                {item.label}
              </span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold bg-pink-500/30 text-pink-300 rounded-full border border-pink-500/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Network</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Mainnet</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Fast RPC • 24ms latency
          </div>
        </div>
      </div>

      {/* Neon glow effect on right edge */}
      <div 
        className="absolute top-0 right-0 w-px h-full"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(0, 245, 255, 0.3) 50%, transparent)',
          filter: 'blur(2px)',
        }}
      />
    </aside>
  );
});

DesktopSidebar.displayName = 'DesktopSidebar';

export default DesktopSidebar;
