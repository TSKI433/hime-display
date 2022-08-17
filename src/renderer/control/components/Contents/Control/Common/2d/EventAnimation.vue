<template>
  <config-item label="事件动画">
    <el-select v-model="eventSelected" style="width: 80px; margin-right: 12px">
      <el-option value="click" />
      <el-option value="drag" />
    </el-select>
    <el-button @click="setEventAnimation('none')"> 无动画 </el-button>
    <el-button @click="setEventAnimation('random')"> 随机动画 </el-button>
    <el-button
      @click="setEventAnimation('database')"
      :disabled="!motionTableSelected"
    >
      列表选中动画
    </el-button>
  </config-item>
  <config-item label="当前点击动画">
    {{ clickAnimation.label }}
  </config-item>
  <config-item label="当前拖拽动画">
    {{ dragAnimation.label }}
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
import { reactive, toRaw, ref } from "vue";
const props = defineProps({
  currentMotion: Object,
  motionTableSelected: Boolean,
  modelType: String,
});
const currentMotion = props.currentMotion;

const clickAnimation = reactive({
  name: "clickAnimation",
  value: "random",
  // label用于UI显示
  label: "random",
});
const dragAnimation = reactive({
  name: "dragAnimation",
  value: "none",
  label: "none",
});
const eventSelected = ref("click");
function setEventAnimation(animation) {
  const instantConfig =
    eventSelected.value === "click" ? clickAnimation : dragAnimation;
  if (animation === "none" || animation === "random") {
    instantConfig.value = animation;
    instantConfig.label = animation;
    // 使用group曲线救国判断是否是live2d控制……
  } else if (props.modelType === "Live2d") {
    instantConfig.value = currentMotion.value.File
      ? currentMotion.value.File
      : currentMotion.value.file;
    instantConfig.label = currentMotion.value.name;
  } else if (props.modelType === "Spine") {
    instantConfig.value = currentMotion.value.name;
    instantConfig.label = currentMotion.value.name;
  }
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:change-instant-config",
    data: toRaw(instantConfig),
  });
}
</script>

<style lang="scss"></style>
