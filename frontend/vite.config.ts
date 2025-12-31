/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-solana': ['@solana/web3.js'],
          'vendor-charts': ['recharts', 'lightweight-charts', 'technicalindicators'],
          'vendor-web3': ['ethers', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // @ts-expect-error - Vitest config is valid but not in Vite types
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});