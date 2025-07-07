import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
    terserOptions: {
      compress: {
        defaults: true,
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
