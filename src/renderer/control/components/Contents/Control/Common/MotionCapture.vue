<template>
  <config-item
    :label="$t('control.capture.capture-type')"
    v-if="modelType == 'MMD' || modelType == 'VRoid'"
  >
    <el-radio-group v-model="motionCaptureType">
      <el-radio-button label="faceMesh">{{
        $t("control.capture.face-capture")
      }}</el-radio-button>
      <el-radio-button label="holistic">{{
        $t("control.capture.holistic-capture")
      }}</el-radio-button>
    </el-radio-group>
  </config-item>
  <config-item :label="$t('control.capture.capture-control')">
    <el-button @click="launchCapture" :disabled="capturing">{{
      $t("control.capture.start-capture")
    }}</el-button>
    <el-button @click="quitCapture" :disabled="!capturing" type="danger">
      {{ $t("control.capture.quit-capture") }}</el-button
    >
  </config-item>
</template>

<script setup>
import { useAppStore } from "@control/store/app";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { ref } from "vue";
const props = defineProps({
  modelType: String,
});
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
    data: null,
  });
  capturing.value = false;
}
</script>

<style lang="scss"></style>
