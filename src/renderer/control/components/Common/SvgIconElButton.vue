<template>
  <el-button>
    <svg-icon :name="name" class="hime-el-svg-icon"></svg-icon>
  </el-button>
</template>

<script setup>
import SvgIcon from "@control/components/Common/SvgIcon.vue";
const props = defineProps({
  name: String,
});
</script>

<style lang="scss">
.hime-el-svg-icon {
  height: var(--el-font-size-base);
  width: var(--el-font-size-base);
  use {
    fill: var(--el-button-text-color);
  }
}
</style>
