/**
 * Multi-Wallet Terminal Theme (D11)
 * 
 * Cyberpunk × Graffiti color palette and effects
 */

// =============================================
// NEON COLORS
// =============================================

export const neonColors = {
  cyan: '#00E4FF',
  pink: '#FF3EBF',
  purple: '#9B00FF',
  green: '#00FF55',
  orange: '#FF7A00',
  gold: '#FFD700',
  red: '#FF0055',
};

// =============================================
// GRAFFITI COLORS
// =============================================

export const graffitiColors = {
  green: '#00FF55',
  orange: '#FF7A00',
  yellow: '#FFEE00',
  magenta: '#FF00FF',
};

// =============================================
// BACKGROUNDS
// =============================================

export const backgrounds = {
  dark: '#07070A',
  card: '#0A0A0F',
  panel: '#0D0D14',
  hover: '#12121A',
};

// =============================================
// GRADIENTS
// =============================================

export const gradients = {
  neonPrimary: 'linear-gradient(135deg, #FF3EBF 0%, #9B00FF 50%, #00E4FF 100%)',
  neonReverse: 'linear-gradient(135deg, #00E4FF 0%, #9B00FF 50%, #FF3EBF 100%)',
  success: 'linear-gradient(135deg, #00FF55 0%, #00E4FF 100%)',
  danger: 'linear-gradient(135deg, #FF0055 0%, #FF3EBF 100%)',
  warning: 'linear-gradient(135deg, #FFD700 0%, #FF7A00 100%)',
};

// =============================================
// SHADOWS & GLOWS
// =============================================

export const shadows = {
  borderNeon: '0 0 12px rgba(0,228,255,0.6)',
  borderPink: '0 0 12px rgba(255,62,191,0.6)',
  borderPurple: '0 0 12px rgba(155,0,255,0.6)',
  
  glowCyan: '0 0 20px rgba(0,228,255,0.4)',
  glowPink: '0 0 20px rgba(255,62,191,0.4)',
  glowPurple: '0 0 20px rgba(155,0,255,0.4)',
  glowGreen: '0 0 20px rgba(0,255,85,0.4)',
  
  dripShadow: 'drop-shadow(0 4px 6px rgba(255,62,191,0.35))',
  textGlow: '0 0 10px rgba(0,228,255,0.8)',
};

// =============================================
// TEXT EFFECTS
// =============================================

export const textEffects = {
  neonGlow: {
    textShadow: '0 0 10px rgba(0,228,255,0.8), 0 0 20px rgba(0,228,255,0.4)',
  },
  pinkGlow: {
    textShadow: '0 0 10px rgba(255,62,191,0.8), 0 0 20px rgba(255,62,191,0.4)',
  },
  purpleGlow: {
    textShadow: '0 0 10px rgba(155,0,255,0.8), 0 0 20px rgba(155,0,255,0.4)',
  },
  graffitiStroke: {
    textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
  },
};

// =============================================
// ANIMATIONS
// =============================================

export const animations = {
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  neonStreak: `
    @keyframes neonStreak {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(100%); opacity: 1; }
    }
  `,
  drip: `
    @keyframes drip {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(10px); opacity: 0; }
    }
  `,
  glowPulse: `
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,228,255,0.4); }
      50% { box-shadow: 0 0 40px rgba(0,228,255,0.8); }
    }
  `,
};

// =============================================
// RISK COLORS
// =============================================

export const riskColors = {
  CLEAN: neonColors.cyan,
  SAFE: neonColors.green,
  MEDIUM: neonColors.orange,
  HIGH: neonColors.pink,
  REKT: neonColors.red,
};

// =============================================
// WALLET TERMINAL THEME
// =============================================

export const walletTheme = {
  colors: neonColors,
  graffiti: graffitiColors,
  bg: backgrounds,
  gradients,
  shadows,
  textEffects,
  animations,
  riskColors,
};

export default walletTheme;
