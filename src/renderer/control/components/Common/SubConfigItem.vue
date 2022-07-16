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
  .sub-config-item__label--hime {
    margin-right: 10px;
  }
}
</style>
