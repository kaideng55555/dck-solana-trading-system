/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        neonPink: '#FF41D6',
        neonCyan: '#00F5FF',
        neonPurple: '#A855F7',
        darkBg: '#0a0d11',
        darkSurface: '#0d1117',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'scale(1)', maxHeight: '200px' },
          '50%': { opacity: '0.3', transform: 'scale(0.95)' },
          '100%': { opacity: '0', transform: 'scale(0.9)', maxHeight: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        neonPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(0, 245, 255, 0.5), 0 0 20px rgba(0, 245, 255, 0.3), 0 0 30px rgba(255, 65, 214, 0.2)',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.8), 0 0 40px rgba(0, 245, 255, 0.5), 0 0 60px rgba(255, 65, 214, 0.3)',
            opacity: '0.9'
          },
        },
        glowPulse: {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.6)) drop-shadow(0 0 16px rgba(255, 65, 214, 0.4))',
          },
          '50%': { 
            filter: 'drop-shadow(0 0 12px rgba(0, 245, 255, 0.8)) drop-shadow(0 0 24px rgba(255, 65, 214, 0.6))',
          },
        },
        goldPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)',
          },
        },
        scanline: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        fadeOut: 'fadeOut 0.6s ease-out forwards',
        slideInRight: 'slideInRight 0.4s ease-out',
        slideInLeft: 'slideInLeft 0.4s ease-out',
        slideInUp: 'slideInUp 0.5s ease-out',
        neonPulse: 'neonPulse 2s ease-in-out infinite',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        goldPulse: 'goldPulse 2s ease-in-out infinite',
        scanline: 'scanline 3s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 245, 255, 0.5), 0 0 20px rgba(0, 245, 255, 0.3)',
        'neon-pink': '0 0 10px rgba(255, 65, 214, 0.5), 0 0 20px rgba(255, 65, 214, 0.3)',
        'neon-purple': '0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)',
        'neon-gold': '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
        'neon-strong': '0 0 20px rgba(0, 245, 255, 0.8), 0 0 40px rgba(255, 65, 214, 0.5)',
        'panel': '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 245, 255, 0.1)',
        'panel-hover': '0 8px 12px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 245, 255, 0.2)',
      },
    },
  },
  plugins: [],
}

