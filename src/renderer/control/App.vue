<template>
  <div class="drag-area"></div>
  <el-container>
    <hime-menu></hime-menu>
    <hime-main></hime-main>
  </el-container>
</template>

<script setup>
import HimeMenu from "@control/components/Menu/index.vue";
import HimeMain from "@control/components/Main.vue";
</script>

<style lang="scss">
body {
  margin: 0;
}
#app {
  height: 100%;
  .el-container {
    height: 100%;
  }
}
.drag-area {
  position: fixed;
  top: 0;
  left: 0;
  height: 40px;
  width: 100%;
  -webkit-app-region: drag;
}
</style>
