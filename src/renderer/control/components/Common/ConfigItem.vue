<template>
  <div class="hime-config-item">
    <div class="hime-config-item__label">{{ label }}:</div>
    <slot> </slot>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
});
</script>

<style lang="scss">
.hime-config-item {
  display: flex;
  // 实践发现不设下面这一条的话small版的el-input-number会抽风
  align-items: center;
  margin-bottom: 6px;
  .hime-config-item__label {
    margin-right: 10px;
  }
}
</style>
