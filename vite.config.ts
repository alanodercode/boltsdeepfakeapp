import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  define: {
    // Ensure proper environment variable handling
    __API_URL__: JSON.stringify(process.env.API_URL)
  }
});