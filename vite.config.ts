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
      // 对ES模块启用严格模式
      output: {
        exports: "named",
        compact: true,
        minifyInternalExports: true,
        hoistTransitiveImports: false
      },
    },
    terserOptions: {
      compress: {
        // 极致压缩配置
        module: true,
        defaults: true,
        drop_console: true,
        drop_debugger: true,
        dead_code: true,
        unused: true,
        passes: 3,         // 多次压缩
        keep_fargs: false, // 移除函数参数
        keep_fnames: false // 移除函数名
      },
      format: {
        comments: false,   // 移除所有注释
        beautify: false,   // 禁用美化
        braces: true,      // 紧凑括号格式
        indent_level: 0,   // 无缩进
        semicolons: false  // 移除分号
      },
      mangle: {
        toplevel: true,    // 混淆顶级变量
        keep_classnames: false
      },
    },
  },
});
