import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  define: {
    'process.env': {} 
  },

  build: {

    chunkSizeWarningLimit: 2500, 
    rollupOptions: {
      
      output: {
     
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
  },
});
