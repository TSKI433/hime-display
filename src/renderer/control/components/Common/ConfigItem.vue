<template>
  <div class="config-item--hime">
    <div class="config-item__label--hime">{{ label }}:</div>
    <slot> </slot>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
});
</script>

<style lang="scss">
.config-item--hime {
  display: flex;
  // 实践发现不设下面这一条的话small版的el-input-number会抽风
  align-items: center;
  margin-bottom: 6px;
  .config-item__label--hime {
    margin-right: 10px;
  }
}
</style>
