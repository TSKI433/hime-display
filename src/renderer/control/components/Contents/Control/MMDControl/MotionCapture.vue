<template>
  <config-item label="捕捉类型">
    <el-radio-group v-model="motionCaptureType">
      <el-radio-button label="faceMesh">面部捕捉</el-radio-button>
      <el-radio-button label="holistic">全身捕捉</el-radio-button>
    </el-radio-group>
  </config-item>
  <config-item label="捕捉控制">
    <el-button @click="launchCapture" :disabled="capturing">启动捕捉</el-button>
    <el-button @click="quitCapture" :disabled="!capturing" type="danger">
      结束捕捉</el-button
    >
  </config-item>
</template>

<script setup>
import { useAppStore } from "@control/store/app";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { ref } from "vue";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const capturing = ref(false);
const motionCaptureType = ref("faceMesh");
function launchCapture() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:launch-capture",
    data: {
      type: motionCaptureType.value,
    },
  });
  capturing.value = true;
}
function quitCapture() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:quit-capture",
    data: {},
  });
  capturing.value = false;
}
</script>

<style lang="scss"></style>
