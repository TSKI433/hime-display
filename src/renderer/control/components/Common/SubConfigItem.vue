<template>
  <div class="sub-config-item--hime">
    <div class="sub-config-item__label--hime">{{ label }}:</div>
    <slot> </slot>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
});
</script>

<style lang="scss">
.sub-config-item--hime {
  display: flex;
  // 实践发现不设下面这一条的话small版的el-input-number会抽风
  align-items: center;
  .sub-config-item__label--hime {
    margin-right: 10px;
  }
}
</style>
