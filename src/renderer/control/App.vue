<template>
  <div class="drag-area"></div>
  <el-config-provider :locale="locale">
    <el-container>
      <hime-menu></hime-menu>
      <hime-main></hime-main>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import HimeMenu from "@control/components/Menu/Index.vue";
import HimeMain from "@control/components/Main.vue";
import { useAppStore } from "@control/store/app";
import { useControlStore } from "@control/store/control";
import { useTranslation } from "i18next-vue";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";
import ja from "element-plus/dist/locale/ja.mjs";
import { computed } from "vue";
const { i18next } = useTranslation();
const appStore = useAppStore();
const controlStore = useControlStore();
const ipcAPI = window.nodeAPI.ipc;
appStore.syncDatabase();
appStore.syncConfig();
ipcAPI.queryWindowIds().then((windowIds) => {
  appStore.displayWindowId = windowIds.display;
});
ipcAPI.handleUpdateWindowIds((event, windowIds) => {
  appStore.displayWindowId = windowIds.display;
  // 展示器关闭或重载时重置模型控制器的状态
  // controlStore.currentModelType = "";
  // controlStore.modelControlInfoLoading = false;
  // controlStore.modelControlInfo = null;
  // 原来pinia有个方法叫reset……
  controlStore.$reset();
});
i18next.changeLanguage(appStore.config.general.language);
const locale = computed(() =>
  appStore.config.general.language === "en"
    ? en
    : appStore.config.general.language === "zh-CN"
    ? zhCn
    : appStore.config.general.language === "jp"
    ? ja
    : null
);
</script>

<style lang="scss">
:root {
  height: 100%;
  font-family: var(--el-font-family);
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-regular);
  user-select: none;
  table {
    font-size: var(--el-font-size-base);
  }
}
body {
  height: 100%;
  margin: 0;
}
#app {
  height: 100%;
  .el-container {
    height: 100%;
  }
}
.drag-area {
  position: fixed;
  top: 0;
  left: 0;
  height: 30px;
  width: 100%;
  -webkit-app-region: drag;
}
// 默认的表头背景色和底色不搭
.el-table th.el-table__cell {
  background-color: rgba(0, 0, 0, 0);
}
// 貌似是element plus的问题，自动引入时，深色模式下显示popover的效果不对劲
// https://github.com/element-plus/element-plus/issues/8113
// https://github.com/element-plus/element-plus/pull/8133
// 已在2.2.7修复
// .el-popper.is-light {
//   background: var(--el-bg-color-overlay);
//   border: 1px solid var(--el-border-color-light);
// }
.el-divider--horizontal.hime-el-divider {
  margin: 12px 0;
}
</style>
