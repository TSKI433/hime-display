<template>
  <el-scrollbar max-height="400px">
    <config-item label="动作数据库" label-position="top">
      <el-table
        :border="true"
        :data="motionInfo"
        @current-change="changeCurrentMotion"
        highlight-current-row
        height="200"
        size="small"
        tooltip-effect="light"
      >
        <el-table-column type="index" width="40" align="center" />
        <el-table-column label="动作名称" prop="name" align="center" />
        <el-table-column
          label="时长"
          prop="duration"
          width="200"
          align="center"
        />
      </el-table>
    </config-item>
    <config-item label="循环播放（需载入前设定）">
      <el-switch v-model="animationLoop" />
    </config-item>
    <config-item label="操作">
      <el-button @click="loadMotionNow"> 载入当前动作 </el-button>
      <el-button @click="quitMotion"> 退出动画播放 </el-button>
    </config-item>
    <el-divider style="margin: 12px 0" />
    <event-animation
      :current-motion="currentMotion"
      :motion-table-selected="motionTableSelected"
      modelType="Spine"
    ></event-animation>
  </el-scrollbar>
</template>

<script setup>
import { ref, toRaw, reactive } from "vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import EventAnimation from "../Common/2d/EventAnimation.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const currentMotion = reactive({ value: null });
const motionTableSelected = ref(false);
const animationLoop = ref(true);
const props = defineProps({
  motionInfo: Object,
});
function changeCurrentMotion(currentRow) {
  motionTableSelected.value = true;
  currentMotion.value = currentRow;
}
function loadMotionNow() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:play-motion",
    data: {
      motion: toRaw(currentMotion.value),
      animationLoop: animationLoop.value,
    },
  });
}
function quitMotion() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:quit-motion",
    data: null,
  });
}
</script>

<style lang="scss"></style>
