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
  <event-animation
    :current-motion="currentMotion"
    :motion-table-selected="motiontableSelected"
    model-type="Live2D"
  ></event-animation>
</template>

<script setup>
import { computed, ref, toRaw, reactive } from "vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import EventAnimation from "../Common/EventAnimation.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
// 直接赋值为null在各种响应式需求下会很不妙
const currentMotion = reactive({ value: null });
const motiontableSelected = ref(false);
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
  motiontableSelected.value = true;
  currentMotion.value = currentRow;
}
function loadMotionNow() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:play-motion",
    data: {
      motion: toRaw(currentMotion.value),
    },
  });
}
</script>

<style lang="scss"></style>
