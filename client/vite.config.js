// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (development or production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Ensure Vite binds to 0.0.0.0 for external access
      port: process.env.PORT || 3000, // Use Render's dynamic port or fallback to 3000 locally
      proxy: {
        '/api': {
          target: mode === 'production' ? env.VITE_PROD_BACKEND_URL : env.VITE_BACKEND_URL, 
          secure: false,
          changeOrigin: true,
        },
      },
    },
  };
});