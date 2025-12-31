/**
 * Mobile bottom navigation bar for feed tabs
 * Shows New 🔥 | Graduating 🎓 | Graduated 🟡
 * Hidden on desktop (md+ breakpoint)
 */

import React from 'react';

interface MobileTabsProps {
  active: string;
  setActive: (tab: string) => void;
}

interface Tab {
  id: string;
  label: string;
  emoji: string;
}

const TABS: Tab[] = [
  { id: 'new', label: 'New', emoji: '🔥' },
  { id: 'mid', label: 'Graduating', emoji: '🎓' },
  { id: 'grad', label: 'Graduated', emoji: '🟡' }
];

export const MobileTabs: React.FC<MobileTabsProps> = ({ active, setActive }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0d11] border-t border-[#18333b] md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full
                transition-all duration-200
                ${isActive 
                  ? 'border-t-2 border-[#00F5FF] text-[#00F5FF]' 
                  : 'border-t-2 border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
              style={isActive ? {
                textShadow: '0 0 10px rgba(0, 245, 255, 0.8), 0 0 20px rgba(0, 245, 255, 0.4)',
                filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.6))'
              } : undefined}
            >
              <span className="text-2xl mb-1">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabs;
