import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Prevent Vercel from complaining about bundle sizes
    chunkSizeWarningLimit: 1500, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Group React and Framer Motion together to prevent Context crashes
            if (
              id.includes("react") || 
              id.includes("react-dom") || 
              id.includes("framer-motion") ||
              id.includes("motion-utils")
            ) {
              return "react-core";
            }
            // Heavy data/charting libraries
            if (id.includes("recharts") || id.includes("d3") || id.includes("xlsx")) {
              return "data-vendor";
            }
            // Icons
            if (id.includes("lucide-react")) {
              return "icons";
            }
            // Everything else
            return "vendor";
          }
        },
      },
    },
  },
});
