import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, "public"),
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  },
  build: {
    outDir: path.resolve(__dirname, "../dist"),
    emptyOutDir: true
  }
});
