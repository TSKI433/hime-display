import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { DEV_SERVER_PORT } from "../shared/constants";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        // 颜色主题配置预留
        //   {
        //   importStyle: "sass",
        // }
      ],
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve(__dirname, "control/icons")],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]",
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
  css: {
    preprocessorOptions: {
      scss: {
        // 颜色主题配置预留
        // additionalData: `@use "@control/styles/el-theme.scss" as *;`
        additionalData: `@use "@control/styles/Variables.scss" as *;`,
      },
    },
  },
});
