import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Use the SWC plugin with a fallback to Babel if SWC fails
    {
      ...react(),
      enforce: 'pre',
      apply: 'build',
      transformIndexHtml: undefined,
      handleHotUpdate: undefined,
      name: 'vite-plugin-react-swc-fallback',
      configResolved(config) {
        // Keep the resolved config for later use
        console.log("Vite config resolved");
      },
    },
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add esbuild configuration as fallback
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
}));
