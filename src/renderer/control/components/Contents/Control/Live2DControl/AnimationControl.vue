<template>
  <el-table
    :data="motions"
    :border="true"
    @current-change="changeCurrentMotion"
    highlight-current-row
    height="200"
    size="small"
    style="margin-bottom: 12px"
    tooltip-effect="light"
  >
    <el-table-column
      label="名称"
      show-overflow-tooltip
      prop="name"
      align="center"
    >
    </el-table-column>
    <el-table-column label="动作组" prop="group" width="200" align="center">
    </el-table-column>
  </el-table>
  <config-item label="操作">
    <el-button @click="loadMotionNow"> 载入当前动作 </el-button>
  </config-item>
  <el-divider style="margin: 12px 0" />
  <config-item label="事件动画">
    <el-select v-model="eventSelected" style="width: 80px; margin-right: 12px">
      <el-option value="click" />
      <el-option value="drag" />
    </el-select>
    <el-button @click="setEventAnimation('none')"> 无动画 </el-button>
    <el-button @click="setEventAnimation('random')"> 随机动画 </el-button>
    <el-button
      @click="setEventAnimation('database')"
      :disabled="!motionTabelSelected"
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
import { computed, ref, toRaw, reactive } from "vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
let currentMotion = null;
const motionTabelSelected = ref(false);
const props = defineProps({
  motionInfo: Object,
});
const motions = computed(function () {
  const motionList = [];
  Object.keys(props.motionInfo).forEach((motionGroupName) => {
    props.motionInfo[motionGroupName].forEach((motion, index) => {
      motion.group = motionGroupName;
      // moc与moc3的入口文件属性名不同
      motion.name =
        (motion.File || motion.file) &&
        /(?<=\/?)[^\/]+(?=\.(json|mtn))/.exec(motion.File || motion.file)[0];
      motionList.push(motion);
    });
  });
  return motionList;
});
function changeCurrentMotion(currentRow) {
  motionTabelSelected.value = true;
  currentMotion = currentRow;
}
function loadMotionNow() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:play-motion",
    data: {
      motion: toRaw(currentMotion),
    },
  });
}

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
  } else {
    instantConfig.value = currentMotion.File
      ? currentMotion.File
      : currentMotion.file;
    instantConfig.label = currentMotion.name;
  }
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:change-instant-config",
    data: toRaw(instantConfig),
  });
}
</script>

<style lang="scss"></style>
