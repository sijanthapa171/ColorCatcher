import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: false,
    lib: {
      entry: "src/index.ts",
      name: "materialTheme",
      fileName: "material-theme",
      formats: ["umd", "es"],
    },
    rollupOptions: {
      output: {
        exports: "named",
        compact: true,
        minifyInternalExports: true,
        hoistTransitiveImports: false
      },
    },
    terserOptions: {
      compress: {
        module: true,
        defaults: true,
        drop_console: true,
        drop_debugger: true,
        dead_code: true,
        unused: true,
        passes: 3,         
        keep_fargs: false, 
        keep_fnames: false 
      },
      format: {
        comments: false,   
        beautify: false,   
        braces: true,      
        indent_level: 0,   
        semicolons: false  
      },
      mangle: {
        toplevel: true,    
        keep_classnames: false
      },
    },
  },
});
