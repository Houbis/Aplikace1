import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Explicitly replace process.env.API_KEY with the string value from build environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Mock the rest of process.env to avoid "process is not defined" errors in browser
    'process.env': {}
  }
});