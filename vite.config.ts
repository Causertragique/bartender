import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'utils-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  optimizeDeps: {
    exclude: ["better-sqlite3"],
  },
}));

function expressPlugin(): Plugin {
  let expressApp: any = null;
  let serverLoadPromise: Promise<any> | null = null;

  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Start loading the server immediately (non-blocking)
      console.log("[Vite] Starting to load Express server...");
      // Use dynamic import with .ts extension - Vite will handle TypeScript compilation
      serverLoadPromise = import("./server/index.ts")
        .then((serverModule) => {
          console.log("[Vite] Server module imported successfully");
          console.log("[Vite] Module exports:", Object.keys(serverModule));
          if (!serverModule.createServer) {
            throw new Error("createServer function not found in server module. Available exports: " + Object.keys(serverModule).join(", "));
          }
          console.log("[Vite] Appel de createServer()...");
          try {
            expressApp = serverModule.createServer();
            console.log("[Express] Server loaded successfully");
            console.log("[Express] Available routes:", expressApp._router?.stack?.length || "unknown");
            return expressApp;
          } catch (createError: any) {
            console.error("[Express] Erreur lors de l'appel de createServer():", createError);
            console.error("[Express] Stack:", createError.stack);
            throw createError;
          }
        })
        .catch((err: any) => {
          console.error("[Express] Failed to load server:", err);
          console.error("[Express] Error details:", err?.stack || err?.message);
          console.error("[Express] Error name:", err?.name);
          console.error("[Express] Error code:", err?.code);
          console.error("[Express] This usually means:");
          console.error("  1. TypeScript compilation error in server/index.ts");
          console.error("  2. Missing dependencies");
          console.error("  3. Import path issue");
          return null;
        });

      // Add middleware that waits for server to load
      server.middlewares.use((req, res, next) => {
        // Only handle /api routes with Express
        if (req.url?.startsWith("/api")) {
          console.log(`[Vite] Intercepting API request: ${req.method} ${req.url}`);
          
          if (expressApp) {
            // Server already loaded
            console.log(`[Vite] Express app ready, forwarding to Express`);
            expressApp(req, res, next);
          } else if (serverLoadPromise) {
            // Wait for server to load
            console.log(`[Vite] Waiting for Express server to load...`);
            serverLoadPromise
              .then((app) => {
                if (app) {
                  console.log(`[Vite] Express server loaded, forwarding request`);
                  expressApp = app; // Cache it for next time
                  app(req, res, next);
                } else {
                  console.error(`[Vite] Express server failed to load - app is null`);
                  console.error(`[Vite] Check terminal logs for '[Express] Failed to load server' message`);
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ 
                    error: "Server not available",
                    hint: "Check terminal logs for Express server loading errors"
                  }));
                }
              })
              .catch((err) => {
                console.error(`[Vite] Error loading Express server:`, err);
                console.error(`[Vite] Error stack:`, err?.stack);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ 
                  error: "Server error", 
                  details: err.message,
                  hint: "Check terminal logs for detailed error information"
                }));
              });
          } else {
            console.error(`[Vite] Express server not initialized`);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Server not available" }));
          }
        } else {
          next();
        }
      });
    },
  };
}
