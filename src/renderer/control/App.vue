<template>
  <div class="drag-area"></div>
  <el-container>
    <hime-menu></hime-menu>
    <hime-main></hime-main>
  </el-container>
</template>

<script setup>
import HimeMenu from "@control/components/Menu/Index.vue";
import HimeMain from "@control/components/Main.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
window.appStore = appStore;
appStore.syncDatabase();
window.nodeAPI.ipc.handleInfoWindowId((evnet, windowIds) => {
  appStore.windowIds = windowIds;
});
window.nodeAPI.ipc.handleWindowAllReadyToShow(() => {
  window.nodeAPI.ipc.sendToDisplay(appStore.windowIds.display, "ping");
});
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
</style>
