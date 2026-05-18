import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  // Relative base — the app is served from a nested path inside the brain
  // (/api/bf/apps/<id>/), not the domain root. Absolute /assets/... URLs
  // would 404. Must stay "./".
  base: "./",
  build: {
    outDir: "dist",
  },
});
