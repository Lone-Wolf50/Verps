import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local development proxy (only works on localhost)
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Splits node_modules into a separate vendor chunk to resolve the 500kB warning
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    // Increases the warning threshold to 1000kB just in case
    chunkSizeWarningLimit: 1000,
  },
});
