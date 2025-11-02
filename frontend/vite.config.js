import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.{js,jsx}'],
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@pages', replacement: path.resolve(__dirname, './src/pages') },
      { find: '@styles', replacement: path.resolve(__dirname, './src/styles') },
      { find: '@assets', replacement: path.resolve(__dirname, './src/assets') },
      { find: '@hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@helpers', replacement: path.resolve(__dirname, './src/helpers') },

    ],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000/',
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' ws: http: https:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data:; connect-src 'self' ws: http: https:; frame-ancestors 'none';",
    },
  },
});
