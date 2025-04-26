<template>
  <config-item label="Parameter" label-position="top">
    <config-item :label="$t('control.parameter.target-select')">
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
    <config-item
      :label="$t('control.parameter.parameter-control')"
      style="width: 100%"
    >
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
  <config-item
    :label="$t('control.parameter.part-opacity')"
    label-position="top"
  >
    <config-item :label="$t('control.parameter.target-select')">
      <el-select v-model="selectedPartId" @change="bindPartId" filterable>
        <el-option v-for="partId in partInfo" :label="partId" :value="partId" />
      </el-select>
    </config-item>
    <config-item
      :label="$t('control.parameter.parameter-control')"
      style="width: 100%"
    >
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
  <config-item :label="$t('control.parameter.mouse-focus')">
    <el-switch v-model="trackMouse.value" />
  </config-item>
  <config-item :label="$t('control.parameter.auto-breath')">
    <el-switch v-model="autoBreath.value" />
  </config-item>
  <config-item :label="$t('control.parameter.auto-eye-blink')">
    <el-switch v-model="autoEyeBlink.value" />
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { computed, ref, watch, reactive, toRaw } from "vue";
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
  ipcAPI.sendToModelManager({
    channel: "control:bind-parameter",
    data: {
      parameterId: selectedParameterId.value,
    },
  });
}
function setParameterValue() {
  ipcAPI.sendToModelManager({
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
  ipcAPI.sendToModelManager({
    channel: "control:bind-part",
    data: {
      partId: selectedPartId.value,
    },
  });
}
function setPartOpacity() {
  ipcAPI.sendToModelManager({
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
const trackMouse = reactive({
  name: "trackMouse",
  value: true,
});
watch(trackMouse, () => {
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(trackMouse),
  });
});
const autoBreath = reactive({
  name: "autoBreath",
  value: true,
});
watch(autoBreath, () => {
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(autoBreath),
  });
});
const autoEyeBlink = reactive({
  name: "autoEyeBlink",
  value: true,
});
watch(autoEyeBlink, () => {
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(autoEyeBlink),
  });
});
</script>

<style lang="scss"></style>
