
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ConfigEnv, UserConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Use React plugin with Babel instead of SWC
    react({
      // Explicitly configure React import
      jsxRuntime: 'automatic'
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Remove esbuild jsxInject configuration as we're using automatic JSX runtime
  esbuild: {
    // We don't need jsxInject when using automatic runtime
  },
}));
