<template>
  <config-item label="目标选择">
    <el-select v-model="selectedMorphName" @change="BindMorphTarget">
      <el-option
        v-for="(morphIndex, morphName) in morphInfo"
        :label="morphName"
        :value="morphName"
      />
    </el-select>
  </config-item>
  <config-item label="参数调整">
    <el-slider
      v-model="morphWeight"
      :min="0"
      :max="1"
      :step="0.1"
      style="width: 60%; margin-left: 10px"
      :disabled="selectedMorphName === ''"
      @input="setMorphWeight"
    />
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { ref } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  morphInfo: Object,
});
// 若使用morph的index作为传递目标，可能存在难以发现的隐患
const selectedMorphName = ref("");
const morphWeight = ref(0);
function BindMorphTarget() {
  if (selectedMorphName.value === "") return;
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:bind-morph-target",
    data: {
      morphName: selectedMorphName.value,
    },
  });
}
function setMorphWeight() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:set-morph-weight",
    data: {
      morphName: selectedMorphName.value,
      weight: morphWeight.value,
    },
  });
}
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-node-morph": {
      morphWeight.value = message.data.weight;
      break;
    }
  }
});
</script>

<style lang="scss"></style>
