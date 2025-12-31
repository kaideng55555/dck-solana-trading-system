import React, { useState, useMemo, useCallback, memo } from 'react';
import { useLiveFeed } from '../hooks/useLiveFeed';
import { MobileTabs } from '../components/MobileTabs';
import { FeedList } from '../components/FeedList';
import { CoinCard } from '../components/CoinCard';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopTopBar } from '../components/DesktopTopBar';
import { WalletConnect } from '../components/WalletConnect';

/**
 * TopBar component - Mobile only
 * Memoized to prevent unnecessary re-renders
 * Only visible on mobile (< md)
 */
const TopBar: React.FC = memo(() => (
  <div className="md:hidden sticky top-0 z-40 bg-[#0a0d11]/95 backdrop-blur-sm border-b border-[#18333b] px-4 py-3 space-y-3">
    <h1 className="text-2xl font-bold text-[#00F5FF]" style={{
      textShadow: '0 0 10px rgba(0, 245, 255, 0.8), 0 0 20px rgba(0, 245, 255, 0.4)'
    }}>
      💎 DCK$ Live Feed
    </h1>
    
    {/* Mobile Wallet Connect */}
    <WalletConnect variant="mobile" />
  </div>
));

TopBar.displayName = 'TopBar';

interface CoinInfo {
  address: string;
  name: string;
  logo: string;
  age: number;
  marketCap: number;
  price: number;
  bondingProgress: number;
  alive: boolean;
}

/**
 * Desktop Feed Column Component
 * Independent scrolling column with themed header
 * Memoized to prevent re-renders when other columns update
 */
interface FeedColumnProps {
  title: string;
  emoji: string;
  coins: CoinInfo[];
  accentColor: string;
  glowColor: string;
}

const FeedColumn: React.FC<FeedColumnProps> = memo(({ title, emoji, coins, accentColor, glowColor }) => (
  <div className="flex flex-col h-full border-r border-[#18333b]/50 last:border-r-0">
    {/* Column Header */}
    <div 
      className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
      style={{
        background: `linear-gradient(180deg, ${glowColor}15, transparent)`,
        borderBottom: `2px solid ${accentColor}40`
      }}
    >
      <h2 
        className="text-lg font-bold flex items-center gap-2"
        style={{
          color: accentColor,
          textShadow: `0 0 10px ${glowColor}80, 0 0 20px ${glowColor}40`
        }}
      >
        <span className="text-2xl">{emoji}</span>
        {title}
        <span className="ml-auto text-sm opacity-60">({coins.length})</span>
      </h2>
    </div>

    {/* Scrollable Coin List */}
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {coins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <span className="text-4xl mb-2">🔍</span>
          <p>No coins yet</p>
        </div>
      ) : (
        coins.map((coin, index) => (
          <div
            key={coin.address}
            className="animate-[fadeIn_0.3s_ease-out]"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CoinCard coin={coin} />
          </div>
        ))
      )}
    </div>
  </div>
), (prevProps, nextProps) => {
  // Custom comparison: only re-render if coins array reference changes
  return prevProps.coins === nextProps.coins;
});

FeedColumn.displayName = 'FeedColumn';

/**
 * Dashboard Component
 * Responsive layout:
 * - MOBILE (< md): Single view with bottom tabs + swipe animations (ONLY renders active feed)
 * - DESKTOP (>= md): 3-column side-by-side layout
 */
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const { newCoins, midCoins, gradCoins, isLoading } = useLiveFeed();

  // Tab order for animation direction calculation
  const tabOrder = ['new', 'mid', 'grad'];

  // Memoize active feed data to prevent unnecessary FeedList re-renders
  const activeFeedData = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return { title: '🔥 New Creations', coins: newCoins };
      case 'mid':
        return { title: '🎓 Graduating Soon', coins: midCoins };
      case 'grad':
        return { title: '🟡 Graduated', coins: gradCoins };
      default:
        return { title: '🔥 New Creations', coins: newCoins };
    }
  }, [activeTab, newCoins, midCoins, gradCoins]);

  // Handle tab change with animation direction (memoized)
  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === activeTab) return;

    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);

    // Determine slide direction
    setDirection(newIndex > currentIndex ? 'left' : 'right');
    setActiveTab(newTab);
  }, [activeTab, tabOrder]);

  // Handle sidebar navigation (desktop)
  const handleSidebarNavigate = useCallback((itemId: string) => {
    // Map sidebar items to tab IDs
    const tabMap: Record<string, string> = {
      'dashboard': 'new',
      'new': 'new',
      'graduating': 'mid',
      'graduated': 'grad',
    };
    
    const targetTab = tabMap[itemId];
    if (targetTab) {
      setActiveTab(targetTab);
    }
    // TODO: Handle other navigation items (explorer, wallet, settings)
  }, []);

  // Handle top bar actions (desktop)
  const handleSearch = useCallback((query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  }, []);

  const handleNetworkChange = useCallback((network: string) => {
    console.log('Network changed to:', network);
    // TODO: Implement network switching
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing data...');
    // TODO: Trigger data refresh
    window.location.reload();
  }, []);

  const handleFilterToggle = useCallback(() => {
    console.log('Toggle filters');
    // TODO: Show/hide filter panel
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0d11] via-[#0d1117] to-purple-900/10">
      {/* MOBILE LAYOUT: Single view with bottom tabs - ONLY RENDERS ACTIVE FEED */}
      <div className="md:hidden">
        <TopBar />
        
        <div className="relative overflow-hidden h-[calc(100vh-64px-64px)]">
          {/* Feed container */}
          <div className="relative h-full">
            {/* Only render the active feed to save CPU */}
            <div className="absolute inset-0 h-full overflow-y-auto pb-6">
              <FeedList title={activeFeedData.title} coins={activeFeedData.coins} />
            </div>
          </div>

          <MobileTabs active={activeTab} setActive={handleTabChange} />
        </div>
      </div>

      {/* DESKTOP LAYOUT: Sidebar + TopBar + 3-column grid */}
      <div className="hidden md:block">
        <DesktopSidebar 
          activeItem={activeTab} 
          onNavigate={handleSidebarNavigate}
        />

        {/* Main Content - Offset for sidebar */}
        <div className="ml-64">
          <DesktopTopBar
            onSearch={handleSearch}
            onNetworkChange={handleNetworkChange}
            onRefresh={handleRefresh}
            onFilterToggle={handleFilterToggle}
            searchPlaceholder="Search tokens by name or address..."
          />
          
          {/* 3-column grid with independent scrolling */}
          <div className="grid grid-cols-3 gap-4 h-screen overflow-hidden pt-16">
            <FeedList title="🔥 New Creations" coins={newCoins} desktop />
            <FeedList title="🎓 Graduating Soon" coins={midCoins} desktop />
            <FeedList title="🟡 Graduated" coins={gradCoins} desktop />
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">💎</div>
            <p className="text-[#00F5FF] font-bold" style={{
              textShadow: '0 0 10px rgba(0, 245, 255, 0.8)'
            }}>
              Loading live feed...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
