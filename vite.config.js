import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('framer-motion')) {
            return 'vendor';
          }
          if (id.includes('astronomia')) {
            return 'astroEngine';
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/astro/**'],
    },
  },
});
