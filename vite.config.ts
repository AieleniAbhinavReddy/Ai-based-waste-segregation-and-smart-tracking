import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "./server"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [
    // Mount Express API during dev only (not during build)
    ...(command === "serve"
      ? [
          (() => {
            const plugin: Plugin = {
              name: "express-api-dev",
              async configureServer(vite) {
                const { createServer: createApiServer } = await import("./server");
                const api = createApiServer();
                vite.middlewares.use(api);
              },
            };
            return plugin;
          })(),
        ]
      : []),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    global: "globalThis",
  },
}));
