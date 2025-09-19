import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, existsSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Plugin to copy web.config to build output
    {
      name: 'copy-web-config',
      writeBundle() {
        const webConfigPath = path.resolve(__dirname, 'web.config');
        const distPath = path.resolve(__dirname, 'dist');
        
        if (existsSync(webConfigPath)) {
          try {
            copyFileSync(webConfigPath, path.join(distPath, 'web.config'));
            console.log('✅ web.config copied to dist folder');
          } catch (error) {
            console.warn('⚠️ Failed to copy web.config:', error);
          }
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    // Ensure proper asset handling
    assetsDir: "assets",
    // Optimize for production
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Ensure consistent chunk naming
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
      }
    }
  },
  // Enable compression for better performance
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0")
  }
}));
