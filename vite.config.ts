
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
    hmr: {
      clientPort: 8080,
    },
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
  define: {
    // Ensure WebSocket token is properly defined
    __WS_TOKEN__: JSON.stringify(process.env.WS_TOKEN || ''),
  },
  // Remove esbuild jsxInject configuration as we're using automatic JSX runtime
  esbuild: {
    // We don't need jsxInject when using automatic runtime
  },
  // Add optimizeDeps to force esbuild version compatibility
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  // Force resolve esbuild to compatible version
  build: {
    target: 'es2020'
  }
}));
