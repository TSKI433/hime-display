<template>
  <config-item label="变形" label-position="top">
    <config-item label="目标选择">
      <el-select
        v-model="selectedMorphName"
        @change="bindMorphTarget"
        filterable
      >
        <el-option
          v-for="morphName in morphInfo"
          :label="morphName"
          :value="morphName"
        />
      </el-select>
    </config-item>
    <config-item label="参数调整" style="width: 100%">
      <el-slider
        v-model="morphWeight"
        :min="0"
        :max="1"
        :step="0.1"
        style="width: 60%; margin-left: 10px"
        :disabled="selectedMorphName === ''"
      />
    </config-item>
  </config-item>
  <template v-if="modelType == 'VRoid'">
    <el-divider style="margin: 12px 0" />
    <config-item label="VRM演算">
      <el-switch v-model="vrmUpdate.value" />
    </config-item>
  </template>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { ref, watch, reactive, toRaw } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  morphInfo: Object,
  modelType: String,
});
// 若使用morph的index作为传递目标，可能存在难以发现的隐患
const selectedMorphName = ref("");
const morphWeight = ref(0);
function bindMorphTarget() {
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
// 这里和live2d的参数控制一样，不再用input事件触发setMorphWeight函数，改为watch了，理由是，el-slider控件设定step参数后，即使参数没有更新，有滑动的操作也可能触发input，这样会导致setMorphWeight函数重复触发，消耗性能，由于这里监听的morphWeight是ref包裹的原始值，所以也不用担心会像ObjectTransform.vue里面那样意外的由于watch触发setMorphWeight函数。
watch(morphWeight, setMorphWeight);
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-node-morph": {
      morphWeight.value = message.data.weight;
      break;
    }
  }
});
// VRM演算控制
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
