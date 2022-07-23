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
    >载入选中动画</el-button
  >
  <el-button
    @click="playMotionWithAudio"
    :disabled="!motionTableSelected || !audioTableSelected"
    >载入选中动画及音频</el-button
  >
  <el-slider />
  <el-button @click="setMotionState" :disabled="!motionLoaded">{{
    motionPlaying ? "暂停" : "播放"
  }}</el-button>
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
const motionLoaded = ref(false);
const motionPlaying = ref(false);
function setMotionState() {
  if (motionLoaded.value) {
    ipcAPI.sendToModelManager(appStore.displayWindowId, {
      channel: "control:set-motion-state",
      data: {
        state: motionPlaying.value ? "pause" : "play",
      },
    });
    motionPlaying.value = !motionPlaying.value;
  }
}
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-motion-info": {
      console.log("[Hime Display] Update motion info:", message.data);
      motionLoaded.value = true;
      motionPlaying.value = true;
      break;
    }
  }
});
</script>

<style lang="scss"></style>
