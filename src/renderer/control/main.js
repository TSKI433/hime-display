import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import i18n from "./i18n";
import "virtual:svg-icons-register";
// 在App.vue中采用了手动引入ElMessage的方式后，ElMessage的样式不会被自动加载，只能在这里手动引入一下
import "element-plus/theme-chalk/src/message.scss";
// 以下操作全寄……
// import "element-plus/theme-chalk/src/dark/css-vars.scss";
// import "@control/styles/dark.scss";
// import "@control/styles/el-theme.scss";
// import "element-plus/theme-chalk/dark/css-vars.css";
const app = createApp(App);
app.use(createPinia());
i18n(app);
app.mount("#app");
