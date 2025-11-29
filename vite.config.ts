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
      serverLoadPromise = import("./server/index")
        .then((serverModule) => {
          expressApp = serverModule.createServer();
          console.log("[Express] Server loaded successfully");
          return expressApp;
        })
        .catch((err: any) => {
          console.error("[Express] Failed to load server:", err);
          console.error("[Express] Error details:", err?.stack || err?.message);
          return null;
        });

      // Add middleware that waits for server to load
      server.middlewares.use((req, res, next) => {
        // Only handle /api routes with Express
        if (req.url?.startsWith("/api")) {
          if (expressApp) {
            // Server already loaded
            expressApp(req, res, next);
          } else if (serverLoadPromise) {
            // Wait for server to load
            serverLoadPromise.then((app) => {
              if (app) {
                app(req, res, next);
              } else {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Server not available" }));
              }
            });
          } else {
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
