import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    exclude: ["node-mailjet"],
    include: ["framer-motion", "motion-utils"],
  },
  resolve: {
    alias: {},
  },
  define: {
    global: "globalThis",
  },
});
