<template>
  <div
    class="hime-config-item"
    :class="{ 'hime-config-item--top': labelPosition === 'top' }"
  >
    <div v-if="label" class="hime-config-item__label">{{ label }}:</div>
    <slot></slot>
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
    margin-top: 10px;
  }

  &.hime-config-item--top {
    flex-direction: column;
    align-items: flex-start;
    margin-top: initial;
    & > .hime-config-item__label {
      margin: 0 0 10px;
      font-weight: bold;
    }
  }
  .hime-config-item__label {
    margin-right: 10px;
  }
  // https://github.com/element-plus/element-plus/issues/15834#issuecomment-1936919229
  // 版本2.5.0后，el-select的样式发生了变化，需要手动置顶宽度，否则行内样式异常
  // 那问题来了，之前的默认宽度是哪里来的？经过我的疯狂刨根问底，结论是，大概是用户代理样式表设定的默认行为……
  & > .el-select {
    --el-select-width: 160px;
  }
}
</style>
