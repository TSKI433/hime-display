import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "virtual:svg-icons-register";
// import "@control/styles/index.scss";
import "element-plus/theme-chalk/dark/css-vars.css";
const app = createApp(App);
app.use(createPinia());
app.mount("#app");
