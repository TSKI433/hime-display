<template>
  <!-- <el-form label-position="top" class="el-form--large-label--hime"> -->
  <el-form>
    <hime-title-with-divider>{{ $t("menu.display") }}</hime-title-with-divider>
    <el-form-item label="展示器状态">
      <el-tag effect="light">
        {{ appStore.displayWindowId !== -1 ? "已启动" : "未启动" }}
      </el-tag>
    </el-form-item>
    <el-form-item label="操作">
      <el-button @click="launchDisplayWindow" plain>{{
        appStore.displayWindowId !== -1 ? "重载" : "启动"
      }}</el-button>
      <el-button
        @click="closeDisplayWindow"
        type="danger"
        :disabled="appStore.displayWindowId === -1"
        plain
        >关闭</el-button
      >
    </el-form-item>
    <el-form-item label="显示帧率">
      <el-switch v-model="appStore.config.display['show-fps']" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import { watch, toRaw } from "vue";
import { useAppStore } from "../../store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
watch(appStore.config.display, (newValue) => {
  window.nodeAPI.config.write("display", toRaw(newValue));
});
function launchDisplayWindow() {
  if (appStore.displayWindowId !== -1) {
    ipcAPI.relaunchDisplayWindow();
  } else {
    ipcAPI.launchDisplayWindow();
  }
}
function closeDisplayWindow() {
  ipcAPI.closeDisplayWindow();
}
</script>

<style lang="scss"></style>
