// DCK Neon Graffiti Theme - Cyberpunk Street Art Vibes
export const dckTheme = {
  colors: {
    // Neon Primary Colors
    neonCyan: '#00FFFF',         // Electric Cyan
    neonPink: '#FF00FF',         // Hot Pink
    neonBlue: '#0080FF',         // Electric Blue
    neonPurple: '#8A2BE2',       // Blue Violet
    neonOrange: '#FF6600',       // Neon Orange
    neonYellow: '#FFFF00',       // Electric Yellow
    
    // DCK Brand Neons
    primary: '#00FFAA',          // DCK Neon Teal
    primaryGlow: '#00FFAA80',    // DCK Teal Glow
    secondary: '#FF0080',        // Hot Pink Accent
    gradientPrimary: 'linear-gradient(135deg, #00FFAA 0%, #00CCFF 100%)',
    
    // Dark Cyberpunk Background
    bg: '#000000',               // Pure Black
    bgCard: '#0A0A0A',          // Dark Card
    bgHover: '#111111',         // Hover Dark
    bgAccent: '#1A1A1A',        // Accent Dark
    bgGlass: '#00000080',       // Glass Effect
    
    // Text Colors
    textPrimary: '#FFFFFF',
    textNeon: '#00FFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    textGraffiti: '#FF00FF',
    
    // Status Neon Colors
    success: '#39FF14',          // Acid Green
    danger: '#FF073A',           // Neon Red
    warning: '#FFFF00',          // Electric Yellow
    info: '#00BFFF',            // Deep Sky Blue
    
    // Borders
    border: '#333333',
    borderNeon: '#00FFAA',
    borderGlow: '#00FFAA80',
  },
  
  shadows: {
    // Neon Glow Effects
    neonCyan: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
    neonPink: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF',
    neonBlue: '0 0 10px #0080FF, 0 0 20px #0080FF, 0 0 30px #0080FF',
    neonDCK: '0 0 10px #00FFAA, 0 0 20px #00FFAA, 0 0 30px #00FFAA, 0 0 40px #00FFAA',
    
    // Standard shadows
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(0, 245, 255, 0.5)',
    glowDanger: '0 0 20px rgba(255, 20, 147, 0.5)',
    
    // Text Shadows
    textGlow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
    textGlowStrong: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor, 0 0 35px currentColor',
    
    // Card Shadows
    cardGlow: '0 0 20px rgba(0, 255, 170, 0.3), 0 0 40px rgba(0, 255, 170, 0.1)',
    cardHover: '0 0 30px rgba(0, 255, 170, 0.5), 0 0 60px rgba(0, 255, 170, 0.2)',
    
    // Button Shadows
    buttonGlow: '0 0 15px rgba(0, 255, 170, 0.8), inset 0 0 15px rgba(0, 255, 170, 0.2)',
    buttonHover: '0 0 25px rgba(0, 255, 170, 1), inset 0 0 25px rgba(0, 255, 170, 0.3)',
  },
  
  gradients: {
    // Neon Gradients
    neonPrimary: 'linear-gradient(135deg, #00FFAA 0%, #00CCFF 50%, #FF00AA 100%)',
    neonDanger: 'linear-gradient(135deg, #FF073A 0%, #FF6600 100%)',
    neonSuccess: 'linear-gradient(135deg, #39FF14 0%, #00FF80 100%)',
    cyberpunkCard: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
    
    // Graffiti Style Gradients
    graffitiText: 'linear-gradient(45deg, #FF00FF 0%, #00FFFF 25%, #39FF14 50%, #FFFF00 75%, #FF00FF 100%)',
    glitchEffect: 'linear-gradient(90deg, #FF00FF 0%, transparent 50%, #00FFFF 100%)',
  },
  
  fonts: {
    primary: '"Orbitron", "JetBrains Mono", monospace',
    graffiti: '"Permanent Marker", cursive',
    cyber: '"Share Tech Mono", monospace',
    display: '"Audiowide", cursive',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
};

// Neon Graffiti Styled Components
export const dckStyles = {
  // Main container with cyberpunk grid
  container: {
    background: `
      ${dckTheme.colors.bg},
      radial-gradient(circle at 25% 25%, ${dckTheme.colors.primary}15 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, ${dckTheme.colors.secondary}10 0%, transparent 50%)
    `,
    color: dckTheme.colors.textPrimary,
    fontFamily: dckTheme.fonts.primary,
    minHeight: '100vh',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  
  // Neon card with glow effects
  neonCard: {
    background: dckTheme.gradients.cyberpunkCard,
    border: `1px solid ${dckTheme.colors.borderNeon}`,
    borderRadius: dckTheme.borderRadius.md,
    boxShadow: dckTheme.shadows.cardGlow,
    padding: dckTheme.spacing.lg,
    backdropFilter: 'blur(10px)',
    position: 'relative' as const,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  
  // Graffiti title with neon effects
  graffitiTitle: {
    fontSize: '48px',
    fontWeight: '900',
    fontFamily: dckTheme.fonts.display,
    background: dckTheme.gradients.graffitiText,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: dckTheme.shadows.textGlowStrong,
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    margin: 0,
  },
  
  // Electric neon button
  neonButton: {
    background: 'transparent',
    border: `2px solid ${dckTheme.colors.primary}`,
    borderRadius: dckTheme.borderRadius.sm,
    color: dckTheme.colors.primary,
    fontWeight: '700',
    fontSize: '14px',
    padding: '12px 32px',
    cursor: 'pointer',
    fontFamily: dckTheme.fonts.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    position: 'relative' as const,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: dckTheme.shadows.neonDCK,
  },
  
  // Cyberpunk input field
  cyberInput: {
    background: `${dckTheme.colors.bgAccent}80`,
    border: `1px solid ${dckTheme.colors.borderNeon}`,
    borderRadius: dckTheme.borderRadius.sm,
    color: dckTheme.colors.textNeon,
    fontSize: '14px',
    padding: '12px 16px',
    outline: 'none',
    fontFamily: dckTheme.fonts.cyber,
    transition: 'all 0.3s ease',
    boxShadow: `inset 0 0 10px ${dckTheme.colors.primary}20`,
  },
  
  // Neon header with glass effect
  neonHeader: {
    background: `${dckTheme.colors.bgGlass}`,
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${dckTheme.colors.borderNeon}`,
    boxShadow: `0 0 20px ${dckTheme.colors.primary}30`,
    padding: `${dckTheme.spacing.lg} ${dckTheme.spacing.xl}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
  },
  
  // Status indicators with glow
  statusNew: {
    color: dckTheme.colors.neonPink,
    textShadow: dckTheme.shadows.textGlow,
    fontWeight: '700',
  },
  
  statusGreen: {
    color: dckTheme.colors.success,
    textShadow: dckTheme.shadows.textGlow,
    fontWeight: '700',
  },
  
  statusRed: {
    color: dckTheme.colors.danger,
    textShadow: dckTheme.shadows.textGlow,
    fontWeight: '700',
  },
  
  // Graffiti accent text
  graffitiAccent: {
    fontFamily: dckTheme.fonts.graffiti,
    fontSize: '18px',
    color: dckTheme.colors.neonPink,
    textShadow: dckTheme.shadows.neonPink,
    transform: 'rotate(-1deg)',
    letterSpacing: '1px',
  },
  
  // Header styles
  header: {
    background: `${dckTheme.colors.bgGlass}`,
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${dckTheme.colors.borderNeon}`,
    boxShadow: `0 0 20px ${dckTheme.colors.primary}30`,
    padding: `${dckTheme.spacing.lg} ${dckTheme.spacing.xl}`,
  },
  
  // Tab styles
  tab: {
    padding: '10px 20px',
    borderRadius: dckTheme.borderRadius.sm,
    border: '2px solid transparent',
    background: 'rgba(0, 245, 255, 0.05)',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    whiteSpace: 'nowrap' as const,
  },
  
  tabActive: {
    border: `2px solid ${dckTheme.colors.neonCyan}`,
    background: `linear-gradient(135deg, ${dckTheme.colors.neonCyan}20, ${dckTheme.colors.neonPink}20)`,
    color: dckTheme.colors.neonCyan,
    boxShadow: `0 0 20px ${dckTheme.colors.neonCyan}40`,
    textShadow: dckTheme.shadows.textGlow,
  },
  
  // Button styles
  button: {
    padding: '10px 20px',
    borderRadius: dckTheme.borderRadius.sm,
    border: `2px solid ${dckTheme.colors.primary}`,
    background: 'transparent',
    color: dckTheme.colors.primary,
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: dckTheme.fonts.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
    boxShadow: dckTheme.shadows.neonDCK,
  },
};