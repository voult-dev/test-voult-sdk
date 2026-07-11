import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:2000',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_ORIGIN': JSON.stringify(
      process.env.VITE_API_ORIGIN || 'http://localhost:2000',
    ),
  },
});
