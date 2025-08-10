// PATH: erp-frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':        fileURLToPath(new URL('./src', import.meta.url)),
      '@core':    fileURLToPath(new URL('./src/core', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@theme':   fileURLToPath(new URL('./src/theme', import.meta.url)),
      '@assets':  fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
});

