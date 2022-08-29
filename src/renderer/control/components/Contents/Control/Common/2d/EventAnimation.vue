<template>
  <config-item :label="$t('control.animation.event-motion')">
    <el-select v-model="eventSelected" style="width: 80px; margin-right: 12px">
      <el-option value="click" />
      <el-option value="drag" />
    </el-select>
    <el-button @click="setEventAnimation('none')">
      {{ $t("control.animation.no-motion") }}
    </el-button>
    <el-button @click="setEventAnimation('random')">
      {{ $t("control.animation.random-motion") }}
    </el-button>
    <el-button
      @click="setEventAnimation('database')"
      :disabled="!motionTableSelected"
    >
      {{ $t("control.animation.selected-motion") }}
    </el-button>
  </config-item>
  <config-item :label="$t('control.animation.click-motion-now')">
    {{ clickAnimation.label }}
  </config-item>
  <config-item :label="$t('control.animation.drag-motion-now')">
    {{ dragAnimation.label }}
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { useAppStore } from "@control/store/app";
import { reactive, toRaw, ref } from "vue";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
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
