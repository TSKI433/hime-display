<template>
  <div
    class="hime-config-item"
    :class="{ 'hime-config-item--top': labelPosition === 'top' }"
  >
    <div
      class="hime-config-item__label"
      :class="{ 'hime-config-item__label--top': labelPosition === 'top' }"
    >
      {{ label }}:
    </div>
    <slot> </slot>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  labelPosition: {
    type: String,
    default: "left",
  },
});
</script>

<style lang="scss">
.hime-config-item {
  display: flex;
  // 实践发现不设下面这一条的话small版的el-input-number会抽风
  align-items: center;
  + .hime-config-item {
    margin-top: 12px;
  }

  &.hime-config-item--top {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 12px;
  }
  .hime-config-item__label {
    margin-right: 10px;
    &.hime-config-item__label--top {
      margin-bottom: 6px;
    }
  }
}
</style>
