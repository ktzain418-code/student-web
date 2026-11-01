import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Base44 sandbox serves the preview from <port>-<sandbox id>.<domain>.
// Vite must accept that Host header, and the sandbox id rotates, so we only add
// the wildcard for the sandbox domain and only while BASE44_PREVIEW_MODE is "1".
const previewMode = process.env.BASE44_PREVIEW_MODE === "1";
const sandboxDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: previewMode && sandboxDomain ? [`.${sandboxDomain}`] : undefined,
  },
  build: {
    outDir: "dist",
  },
});
