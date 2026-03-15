import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/client/src",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
