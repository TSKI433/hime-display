<template>
  <el-scrollbar max-height="400px">
    <el-collapse class="hime-control-collapse">
      <el-collapse-item title="动作数据库" name="motionDatabase">
        <el-table
          :border="true"
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
      </el-collapse-item>
      <el-collapse-item title="音频数据库" name="audioDatabase">
        <el-table
          :data="appStore.database.audio3D"
          :border="true"
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
      </el-collapse-item>
    </el-collapse>
    <config-item label="音频延时">
      <el-input-number
        v-model="delayTime"
        :disabled="!audioTableSelected"
      ></el-input-number>
    </config-item>
    <config-item label="物理模拟">
      <el-switch v-model="physicsSimulation.value" />
    </config-item>
    <config-item label="循环播放（需载入前设定）">
      <el-switch v-model="animationLoop" />
    </config-item>
    <config-item label="加载">
      <el-button @click="playMotion" :disabled="!motionTableSelected"
        >载入选中动画</el-button
      >
      <el-button
        @click="playMotionWithAudio"
        :disabled="!motionTableSelected || !audioTableSelected"
        >载入选中动画及音频</el-button
      >
    </config-item>
    <config-item label="控制">
      <el-button @click="setMotionState" :disabled="!motionLoaded">{{
        motionPlaying ? "暂停" : "播放"
      }}</el-button>
      <el-button @click="quitAnimationPlay" :disabled="!motionLoaded"
        >退出动画播放</el-button
      >
    </config-item>
  </el-scrollbar>
</template>

<script setup>
import { useAppStore } from "@control/store/app";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
// 发现奇妙的现象，这里不引入ref不会直接报错，而是先蹦出两三百个vue的警告来
import { reactive, ref, watch, toRaw } from "vue";
const appStore = useAppStore();
let currentMotionInfo = null;
let currentAudioInfo = null;
const motionTableSelected = ref(false);
const audioTableSelected = ref(false);
const animationLoop = ref(true);
const delayTime = ref(0);
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
      data: {
        motionFilePath: currentMotionInfo.entranceFile,
        animationLoop: animationLoop.value,
      },
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
        delayTime: delayTime.value,
        // TODO：音频跟着loop，现在懒得做
        animationLoop: animationLoop.value,
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
function quitAnimationPlay() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:quit-animation-play",
    data: null,
  });
  motionLoaded.value = false;
  motionPlaying.value = false;
}
const physicsSimulation = reactive({
  name: "physicsSimulation",
  value: true,
});
watch(physicsSimulation, () => {
  // 发现个有意思的问题，使用watch监视reactive，回调函数返回的新旧两个参数其实都指向那个reactive对象，所以下方的判断永远不成立
  // if (newVal.value !== oldVal.value) {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:change-instant-config",
    data: toRaw(physicsSimulation),
  });
});
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

<style lang="scss">
.hime-control-collapse {
  margin-bottom: 16px;
}
</style>
