import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Local dev proxy to Meta Graph API v21.0 to bypass browser ad blockers
      '/api/meta-proxy': {
        target: 'https://graph.facebook.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/meta-proxy/, ''),
        secure: true
      },
      // Local dev proxy to Telegram Bot API to bypass CORS & AdBlockers
      '/api/telegram-proxy': {
        target: 'https://api.telegram.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/telegram-proxy/, ''),
        secure: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  }
});
