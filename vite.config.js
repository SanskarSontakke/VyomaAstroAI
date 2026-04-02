import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
