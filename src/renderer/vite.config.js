import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { DEV_SERVER_PORT } from "../shared/constants";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  root: "./src/renderer",
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        control: "./src/renderer/control/control.html",
        display: "./src/renderer/display/display.html",
      },
    },
  },
  server: {
    strictPort: true,
    port: DEV_SERVER_PORT,
  },
  resolve: {
    alias: {
      "@control": resolve(__dirname, "control"),
      "@display": resolve(__dirname, "display"),
    },
  },
});
