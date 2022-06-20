import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { DEV_SERVER_PORT } from "../../scripts/constants";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  server: {
    strictPort: true,
    port: DEV_SERVER_PORT,
  },
});
