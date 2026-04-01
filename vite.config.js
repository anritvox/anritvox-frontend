import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Safely increase the warning limit so Vercel doesn't complai
    chunkSizeWarningLimit: 2500, 
    rollupOptions: {
      // Removing manualChunks allows Rollup to use its native AST parser
      // to guarantee perfect execution order and eliminate TDZ (White Screen) crashes.
      output: {
        // Keep file names clean for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
  },
});
