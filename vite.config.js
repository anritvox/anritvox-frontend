import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ],
  server: {
    port: 3000,
  },
  build: {
    // Increased to prevent warnings without breaking the module graph
    chunkSizeWarningLimit: 3000, 
    rollupOptions: {
      output: {
        // We rely on Vite's native, smart chunking to prevent CommonJS/ESM conflicts
        manualChunks: undefined 
      }
    }
  }
});
