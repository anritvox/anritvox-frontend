import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          // Separating lucide-react into its own chunk to improve caching
          if (id.includes('/node_modules/lucide-react/')) {
            return 'lucide-icons';
          }
          // Bundling motion-related libraries together
          if (id.includes('/node_modules/framer-motion/') || id.includes('/node_modules/motion-utils/')) {
            return 'framer-motion';
          }
        },
      },
    },
  },
  // Removed optimizeDeps referring to node-mailjet as requested
  define: {
    // Ensures compatibility for libraries expecting a global object
    global: "globalThis",
  },
});
