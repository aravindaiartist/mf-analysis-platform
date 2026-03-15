import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Use repo-root index.html as the entry (standard Vite)
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
