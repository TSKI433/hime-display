<template>
  <config-item label="Parameter" label-position="top">
    <config-item label="参数选择">
      <el-select
        v-model="selectedParameterId"
        @change="bindParameterId"
        filterable
      >
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
        :step="0.1"
        style="width: 60%; margin-left: 10px"
        :disabled="selectedParameterId === ''"
      />
    </config-item>
  </config-item>
  <el-divider style="margin: 12px 0" />
  <config-item label="Part Opacity" label-position="top">
    <config-item label="部分选择">
      <el-select v-model="selectedPartId" @change="bindPartId" filterable>
        <el-option v-for="partId in partInfo" :label="partId" :value="partId" />
      </el-select>
    </config-item>
    <config-item label="可见度调整" style="width: 100%">
      <el-slider
        v-model="partOpacity"
        :min="0"
        :max="1"
        :step="0.05"
        style="width: 60%; margin-left: 10px"
        :disabled="selectedPartId === ''"
        @input="setPartOpacity"
      />
    </config-item>
  </config-item>
  <el-divider style="margin: 12px 0" />
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { computed, ref, watch } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  parameterInfo: Object,
  partInfo: Object,
});
const selectedParameterId = ref("");
const parameterValue = ref(0);
const selectedParameterIndex = computed(() => {
  return props.parameterInfo._parameterIds.indexOf(selectedParameterId.value);
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
// 若检测input事件，会在相同的parameterValue下多次触发事件，消耗性能
watch(parameterValue, setParameterValue);
const selectedPartId = ref("");
const partOpacity = ref(0);
function bindPartId() {
  if (selectedPartId.value === "") return;
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:bind-part",
    data: {
      partId: selectedPartId.value,
    },
  });
}
function setPartOpacity() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:set-part",
    data: {
      partId: selectedPartId.value,
      value: partOpacity.value,
    },
  });
}
watch(partOpacity, setPartOpacity);
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-parameter": {
      parameterValue.value = message.data.value;
      break;
    }
    // 虽然没怎么遇到part可见性的动画，但是通过分析live2d的motion文件发现，partOpacity也是可以设定动画帧的
    case "manager:update-part": {
      partOpacity.value = message.data.value;
    }
  }
});
</script>

<style lang="scss"></style>
