<template>
  <el-scrollbar max-height="400px">
    <config-item
      :label="$t('control.animation.motion-db')"
      label-position="top"
    >
      <el-table
        :border="true"
        :data="motionInfo"
        @current-change="changeCurrentMotion"
        highlight-current-row
        height="200"
        size="small"
        tooltip-effect="light"
      >
        <el-table-column type="index" width="60" align="center" />
        <el-table-column
          :label="$t('control.animation.motion-name')"
          prop="name"
          align="center"
        />
        <el-table-column
          :label="$t('control.animation.motion-duration')"
          prop="duration"
          width="200"
          align="center"
        />
      </el-table>
    </config-item>
    <config-item :label="$t('control.animation.loop-play')">
      <el-switch v-model="animationLoop" />
    </config-item>
    <config-item :label="$t('control.animation.operate')">
      <el-button @click="loadMotionNow">
        {{ $t("control.animation.load-motion") }}
      </el-button>
      <el-button @click="quitMotion">
        {{ $t("control.animation.quit-motion") }}
      </el-button>
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
