import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { DEV_SERVER_PORT } from "../shared/constants";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
});
