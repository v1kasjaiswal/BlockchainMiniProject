import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    // Raise chunk warning limit since ethers.js is inherently large
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split ethers into its own chunk for better caching
        manualChunks(id: string) {
          if (id.includes('node_modules/ethers') || id.includes('node_modules/@ethersproject')) {
            return 'ethers';
          }
        },
      },
    },
  },
});
