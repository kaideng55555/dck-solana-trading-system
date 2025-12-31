import React from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'scanner', label: 'Token Scanner', icon: '🔍' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'live-monitor', label: 'Live Monitor', icon: '📡' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const sidebarStyle: React.CSSProperties = {
    width: '256px',
    background: 'rgba(11, 14, 19, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid #2FD9FF33',
    padding: '24px',
    height: '100vh',
    position: 'relative',
  };

  const logoStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#2FD9FF80',
    marginTop: '4px',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    width: '100%',
    textAlign: 'left',
    padding: '12px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s',
    background: isActive
      ? 'linear-gradient(to right, #2FD9FF33, #FF41D633)'
      : 'transparent',
    border: isActive ? '1px solid #2FD9FF80' : '1px solid transparent',
    color: isActive ? '#2FD9FF' : '#2FD9FFB3',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: isActive ? '0 0 12px #2FD9FF33' : 'none',
  });

  const footerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    right: '24px',
  };

  const footerBoxStyle: React.CSSProperties = {
    padding: '12px',
    background: '#FF41D61A',
    border: '1px solid #FF41D64D',
    borderRadius: '8px',
  };

  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <img
          src="/src/assets/dck-logo.png"
          alt="DCK$ Tools"
          style={{
            width: "140px",
            marginBottom: "1rem",
            filter: "drop-shadow(0 0 6px rgba(47,217,255,0.6)) drop-shadow(0 0 12px rgba(255,65,214,0.4))"
          }}
        />
        <p style={subtitleStyle}>Cyberpunk Trading</p>
      </div>

      <nav style={navStyle}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            style={getButtonStyle(activeSection === section.id)}
            onMouseEnter={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.background = '#2FD9FF1A';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>{section.icon}</span>
            <span style={{ fontWeight: '500' }}>{section.label}</span>
          </button>
        ))}
      </nav>

      <div style={footerStyle}>
        <div style={footerBoxStyle}>
          <p style={{ fontSize: '12px', color: '#FF41D6B3' }}>
            💎 Connected to Solana
          </p>
          <p style={{ fontSize: '12px', color: '#2FD9FF80', marginTop: '4px' }}>
            Mainnet Beta
          </p>
        </div>
      </div>
    </aside>
  );
}
