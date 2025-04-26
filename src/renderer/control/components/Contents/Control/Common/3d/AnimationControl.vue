<template>
  <el-scrollbar max-height="400px">
    <el-collapse class="hime-control-collapse">
      <el-collapse-item
        :title="$t('control.animation.motion-db')"
        name="motionDatabase"
      >
        <el-table
          :border="true"
          :data="appStore.database.motion3D"
          @current-change="changeCurrentMotionInfo"
          size="small"
          height="160"
          highlight-current-row
        >
          <el-table-column type="index" width="60" align="center" />
          <el-table-column
            :label="$t('control.animation.motion-name')"
            prop="name"
            show-overflow-tooltip
            width="300"
          />
          <el-table-column
            :label="$t('control.animation.extension-name')"
            align="center"
          >
            <template #default="props">
              <el-tag effect="light">
                {{ props.row.extensionName }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
      <el-collapse-item
        :title="$t('control.animation.audio-db')"
        name="audioDatabase"
      >
        <el-table
          :data="appStore.database.audio3D"
          :border="true"
          @current-change="changeCurrentAudioInfo"
          size="small"
          height="160"
          highlight-current-row
        >
          <el-table-column type="index" width="60" align="center" />
          <el-table-column
            :label="$t('control.animation.audio-name')"
            prop="name"
            show-overflow-tooltip
            width="300"
          />
          <el-table-column
            :label="$t('control.animation.extension-name')"
            align="center"
          >
            <template #default="props">
              <el-tag effect="light">
                {{ props.row.extensionName }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
    <config-item :label="$t('control.animation.audio-delay')">
      <el-input-number
        v-model="delayTime"
        :disabled="!audioTableSelected"
      ></el-input-number>
    </config-item>
    <config-item
      :label="$t('control.animation.physics-simulation')"
      v-if="modelType == 'MMD'"
    >
      <el-switch v-model="physicsSimulation.value" />
    </config-item>
    <config-item
      :label="$t('control.animation.mixamo-convert-mode')"
      v-if="modelType == 'MMD'"
    >
      <el-select v-model="mixamoLegTranslateMode.value">
        <el-option :label="$t('control.animation.ik-calculate')" value="ik" />
        <el-option
          :label="$t('control.animation.rotate-calculate')"
          value="rotate"
        />
      </el-select>
    </config-item>
    <config-item :label="$t('control.animation.loop-play')">
      <el-switch v-model="animationLoop" />
    </config-item>
    <config-item :label="$t('control.animation.load')">
      <el-button @click="playMotion" :disabled="!motionTableSelected">{{
        $t("control.animation.load-motion")
      }}</el-button>
      <el-button
        @click="playMotionWithAudio"
        :disabled="!motionTableSelected || !audioTableSelected"
        >{{ $t("control.animation.load-motion-and-audio") }}</el-button
      >
    </config-item>
    <config-item :label="$t('control.animation.control')">
      <el-button @click="setMotionState" :disabled="!motionLoaded">{{
        motionPlaying
          ? $t("control.animation.pause")
          : $t("control.animation.play")
      }}</el-button>
      <el-button @click="quitAnimationPlay" :disabled="!motionLoaded">{{
        $t("control.animation.quit-motion")
      }}</el-button>
    </config-item>
  </el-scrollbar>
</template>

<script setup>
import { useAppStore } from "@control/store/app";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
// 发现奇妙的现象，这里不引入ref不会直接报错，而是先蹦出两三百个vue的警告来
import { reactive, ref, watch, toRaw } from "vue";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  modelType: String,
});
const currentMotionInfo = reactive({ value: null });
const currentAudioInfo = reactive({ value: null });
const motionTableSelected = ref(false);
const audioTableSelected = ref(false);
const animationLoop = ref(true);
const delayTime = ref(0);
function changeCurrentMotionInfo(currentRow) {
  motionTableSelected.value = true;
  currentMotionInfo.value = currentRow;
}
function changeCurrentAudioInfo(currentRow) {
  audioTableSelected.value = true;
  currentAudioInfo.value = currentRow;
}
function playMotion() {
  if (currentMotionInfo.value !== null) {
    ipcAPI.sendToModelManager({
      channel: "control:play-motion",
      data: {
        motionFilePath: currentMotionInfo.value.entranceFile,
        animationLoop: animationLoop.value,
      },
    });
  }
}
function playMotionWithAudio() {
  if (currentMotionInfo.value !== null && currentAudioInfo.value !== null) {
    ipcAPI.sendToModelManager({
      channel: "control:play-motion-with-audio",
      data: {
        motionFilePath: currentMotionInfo.value.entranceFile,
        audioFilePath: currentAudioInfo.value.entranceFile,
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
    ipcAPI.sendToModelManager({
      channel: "control:set-motion-state",
      data: {
        state: motionPlaying.value ? "pause" : "play",
      },
    });
    motionPlaying.value = !motionPlaying.value;
  }
}
function quitAnimationPlay() {
  ipcAPI.sendToModelManager({
    channel: "control:quit-motion",
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
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(physicsSimulation),
  });
});
const mixamoLegTranslateMode = reactive({
  name: "mixamoLegTranslateMode",
  value: "ik",
});
watch(mixamoLegTranslateMode, () => {
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(mixamoLegTranslateMode),
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
