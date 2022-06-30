import { resolve } from "path";
import { defineConfig } from "vite";
import autoExternal from "rollup-plugin-auto-external";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "./index.js"),
      name: "main",
      formats: ["cjs"],
      fileName: (format) => `control-preload.${format}.js`,
    },
    rollupOptions: {
      plugins: [
        autoExternal({
          packagePath: resolve(__dirname, "../package.json"),
        }),
      ],
    },
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "../../shared"),
    },
  },
});
