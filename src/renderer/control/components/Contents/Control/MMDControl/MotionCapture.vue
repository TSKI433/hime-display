<template>
  <el-button @click="launchCapture">启动捕捉</el-button>
</template>

<script setup>
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
function launchCapture() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:launch-capture",
    data: null,
  });
}
</script>

<style lang="scss"></style>
