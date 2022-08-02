<template>
  <config-item label="Parameter" label-position="top">
    <config-item label="目标选择">
      <el-select v-model="selectedParameterId" @change="bindParameterId">
        <el-option
          v-for="parameterId in parameterInfo._parameterIds"
          :label="parameterId"
          :value="parameterId"
        />
      </el-select>
    </config-item>
    <config-item label="参数调整" style="width: 100%">
      <el-slider
        v-model="parameterValue"
        :min="parameterInfo._parameterMinimumValues[selectedParameterIndex]"
        :max="parameterInfo._parameterMaximumValues[selectedParameterIndex]"
        :step="1"
        style="width: 60%; margin-left: 10px"
        :disabled="selectedParameterId === ''"
        @input="setParameterValue"
      />
      {{ parameterValue }}
    </config-item>
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { computed, ref } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  parameterInfo: Object,
  partInfo: Object,
});
const selectedParameterId = ref("");
const parameterValue = ref(0);
window.parameterInfo = props.parameterInfo;
const selectedParameterIndex = computed(() => {
  const index = props.parameterInfo._parameterIds.indexOf(
    selectedParameterId.value
  );
  if (index === -1) {
    // 返回-1会导致Vue渲染崩溃
    return 0;
  } else {
    return index;
  }
});
function bindParameterId() {
  if (selectedParameterId.value === "") return;
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:bind-parameter",
    data: {
      parameterId: selectedParameterId.value,
    },
  });
}
function setParameterValue() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:set-parameter",
    data: {
      parameterId: selectedParameterId.value,
      value: parameterValue.value,
    },
  });
}
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-parameter": {
      parameterValue.value = message.data.value;
      break;
    }
  }
});
</script>

<style lang="scss"></style>
