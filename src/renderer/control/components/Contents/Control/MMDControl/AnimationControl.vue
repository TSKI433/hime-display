<template>
  <el-table
    :data="appStore.database.motion3D"
    @current-change="changeCurrentMotionInfo"
    size="small"
    height="160"
    highlight-current-row
  >
    <el-table-column type="index" width="40" />
    <el-table-column label="名称" prop="name" show-overflow-tooltip />
    <el-table-column label="扩展名">
      <template #default="props">
        <el-tag effect="light">
          {{ props.row.extensionName }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
  <el-table
    :data="appStore.database.audio3D"
    @current-change="changeCurrentAudioInfo"
    size="small"
    height="160"
    highlight-current-row
  >
    <el-table-column type="index" width="40" />
    <el-table-column label="名称" prop="name" show-overflow-tooltip />
    <el-table-column label="扩展名">
      <template #default="props">
        <el-tag effect="light">
          {{ props.row.extensionName }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
  <el-button @click="playMotion" :disabled="!motionTableSelected"
    >播放选中动画</el-button
  >
  <el-button
    @click="playMotionWithAudio"
    :disabled="!motionTableSelected || !audioTableSelected"
    >播放选中动画及音频</el-button
  >
</template>

<script setup>
import { useAppStore } from "@control/store/app";
// 发现奇妙的现象，这里不引入ref不会直接报错，而是先蹦出两三百个vue的警告来
import { ref } from "vue";
const appStore = useAppStore();
let currentMotionInfo = null;
let currentAudioInfo = null;
const motionTableSelected = ref(false);
const audioTableSelected = ref(false);
const ipcAPI = window.nodeAPI.ipc;
function changeCurrentMotionInfo(currentRow) {
  motionTableSelected.value = true;
  currentMotionInfo = currentRow;
}
function changeCurrentAudioInfo(currentRow) {
  audioTableSelected.value = true;
  currentAudioInfo = currentRow;
}
function playMotion() {
  if (currentMotionInfo !== null) {
    ipcAPI.sendToModelManager(appStore.displayWindowId, {
      channel: "control:play-motion",
      data: { motionFilePath: currentMotionInfo.entranceFile },
    });
  }
}
function playMotionWithAudio() {
  if (currentMotionInfo !== null && currentAudioInfo !== null) {
    ipcAPI.sendToModelManager(appStore.displayWindowId, {
      channel: "control:play-motion-with-audio",
      data: {
        motionFilePath: currentMotionInfo.entranceFile,
        audioFilePath: currentAudioInfo.entranceFile,
      },
    });
  }
}
</script>

<style lang="scss"></style>
