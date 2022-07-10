<template>
  <el-form label-position="top" class="el-form--large-label--hime">
    <hime-title-with-divider>{{ $t("menu.display") }}</hime-title-with-divider>
    <el-form-item label="操作">
      <el-button @click="launchDisplayWindow">启动</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
function launchDisplayWindow() {
  window.nodeAPI.ipc.launchDisplayWindow();
}
</script>

<style lang="scss"></style>
