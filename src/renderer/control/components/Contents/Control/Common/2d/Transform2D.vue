<template>
  <config-item label="x坐标">
    <el-input-number
      :precision="2"
      :step="10"
      v-model="transform.x"
      @change="setModelTransform"
    >
    </el-input-number>
  </config-item>
  <config-item label="y坐标">
    <el-input-number
      :precision="2"
      :step="10"
      v-model="transform.y"
      @change="setModelTransform"
    >
    </el-input-number>
  </config-item>
  <config-item label="缩放">
    <el-input-number
      :precision="2"
      :step="0.01"
      v-model="transform.scale"
      @change="setModelTransform"
    >
    </el-input-number>
  </config-item>
</template>

<script setup>
import { reactive, watch, toRaw } from "vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const transform = reactive({
  x: 0,
  y: 0,
  scale: 1,
});
function setModelTransform() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:set-model-transform",
    data: toRaw(transform),
  });
}
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-model-transform": {
      transform.x = message.data.x;
      transform.y = message.data.y;
      transform.scale = message.data.scale;
      break;
    }
  }
});
ipcAPI.sendToModelManager(appStore.displayWindowId, {
  channel: "control:query-model-transform",
  data: null,
});
</script>

<style lang="scss" scoped></style>
