// DCK Neon Graffiti Theme - Inspired by the logo
export const dckNeonTheme = {
  bgGradient: "linear-gradient(180deg, #050505 0%, #0d0d15 100%)",
  textMain: "#2FD9FF",
  accent: "#FF41D6",
  fontFamily: "'Rubik Glitch', 'Bangers', Orbitron, 'Segoe UI', sans-serif",
  graffitiFont: "'Rubik Glitch', cursive",
  buttonGlow: "0 0 6px rgba(47,217,255,0.6), 0 0 14px rgba(255,65,214,0.3)",
  panelGlow: "0 0 12px rgba(47,217,255,0.2)",
  border: "1px solid rgba(47,217,255,0.25)",
  hover: {
    background: "rgba(255,65,214,0.1)",
    color: "#FF41D6",
  },
  colors: {
    // Neon DCK Brand Colors (from the logo)
    neonCyan: '#00F5FF',      // Bright neon cyan
    neonBlue: '#1E90FF',      // Electric blue
    neonPink: '#FF1493',      // Hot pink accent
    neonPurple: '#8A2BE2',    // Blue violet
    neonOrange: '#FF9500',    // Neon orange for warnings
    neonYellow: '#FFD700',    // Gold/yellow for highlights
    
    // Background Colors (dark like the dashboard)
    bg: '#0B0B0F',            // Deep dark background
    bgCard: '#161621',        // Card background
    bgHover: '#1D1D2A',       // Hover states
    bgAccent: '#252533',      // Accent background
    
    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#B8BCC8',
    textMuted: '#6B7280',
    textNeon: '#00F5FF',      // Neon text
    
    // Chart Colors (matching the attached image)
    chartBullish: '#00F5FF',  // Neon cyan for bullish
    chartBearish: '#FF1493',  // Hot pink for bearish
    chartVolume: '#8A2BE2',   // Purple for volume
    chartGrid: '#2A2A3A',     // Dark grid lines
    
    // Status Colors
    success: '#00F5FF',       // Neon cyan
    danger: '#FF1493',        // Hot pink
    warning: '#FFD700',       // Gold
    info: '#1E90FF',          // Electric blue
    
    // Borders and Effects
    border: '#2A2A3A',
    borderNeon: '#00F5FF',
    glowCyan: '0 0 20px rgba(0, 245, 255, 0.5)',
    glowPink: '0 0 20px rgba(255, 20, 147, 0.5)',
  },
  
  // Graffiti/Neon text effects
  textEffects: {
    neonGlow: {
      textShadow: '0 0 5px #00F5FF, 0 0 10px #00F5FF, 0 0 15px #00F5FF, 0 0 20px #00F5FF',
      color: '#00F5FF',
    },
    pinkGlow: {
      textShadow: '0 0 5px #FF1493, 0 0 10px #FF1493, 0 0 15px #FF1493',
      color: '#FF1493',
    },
    graffiti: {
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      filter: 'drop-shadow(2px 2px 0px #1E90FF) drop-shadow(-2px -2px 0px #FF1493)',
    }
  }
};

export default dckNeonTheme;