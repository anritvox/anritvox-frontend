import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  build: {
    // Optional: Increases the warning limit slightly so you don't get bothered by it
    chunkSizeWarningLimit: 600, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. React core (Crucial fix for your Framer Motion bug)
            if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) {
              return "react-vendor";
            }
            // 2. Heavy data/charting libraries
            if (id.includes("recharts") || id.includes("d3")) {
              return "recharts-vendor";
            }
            if (id.includes("xlsx")) {
              return "xlsx-vendor";
            }
            // 3. UI/Icons/Animations
            if (id.includes("lucide-react")) {
              return "lucide-icons";
            }
            if (id.includes("framer-motion") || id.includes("motion-utils")) {
              return "framer-motion";
            }
            // 4. Everything else
            return "vendor";
          }
        },
      },
    },
  },
});
