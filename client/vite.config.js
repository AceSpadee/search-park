// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    proxy: {
      '/api': {
        target: '0.0.0.0',
        secure: false,
        changeOrigin: true,
      },
    },
  },
});