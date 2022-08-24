<template>
  <morph-control :morph-info="morphInfo"> </morph-control>
  <el-divider style="margin: 12px 0" />
  <config-item label="VRM演算">
    <el-switch v-model="vrmUpdate.value" />
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import MorphControl from "../Common/3d/MorphControl.vue";
import { watch, toRaw, reactive } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  morphInfo: Object,
});
const vrmUpdate = reactive({
  name: "vrmUpdate",
  value: true,
});
watch(vrmUpdate, () => {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:change-instant-config",
    data: toRaw(vrmUpdate),
  });
});
</script>

<style lang="scss"></style>
