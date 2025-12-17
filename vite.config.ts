import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel injects env vars at build time, but for client-side usage we often need to map them.
    // However, Vite exposes import.meta.env.VITE_... by default.
    // Since the app code uses process.env.API_KEY, we provide a compatibility layer.
    'process.env': process.env
  }
});