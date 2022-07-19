<template>
  <el-main
    v-loading="
      controlStore.modelControlInfoLoading &&
      contentComponentNow === HimeControl
    "
  >
    <!-- 之前也考虑过采用vue的路由方案，但配置起来较为麻烦，而且似乎做不到保存组件缓存的操作，所以还是采用了动态组件的方案。 -->
    <!-- 使用keep-alive保存组件的缓存，没必要每次都加载 -->
    <!-- 使用了<script setup>后，动态组件的is参数似乎无法直接接收字符串，只能使用组件对象 -->
    <keep-alive>
      <component :is="contentComponentNow"></component>
    </keep-alive>
  </el-main>
</template>

<script setup>
import _ from "lodash";
import HimeGeneral from "@control/components/Contents/General.vue";
import HimeDisplay from "@control/components/Contents/Display.vue";
import HimeControl from "@control/components/Contents/Control/index.vue";
import HimeModel from "@control/components/Contents/Model.vue";
import HimeSource from "@control/components/Contents/Source.vue";
import HimeAbout from "@control/components/Contents/About.vue";
import { computed } from "vue";
import { useAppStore } from "@control/store/app";
import { useControlStore } from "@control/store/control";
const appStore = useAppStore();
const controlStore = useControlStore();
// 借助对象完成字符串到组件的映射
const contentComponents = {
  HimeGeneral,
  HimeDisplay,
  HimeControl,
  HimeModel,
  HimeSource,
  HimeAbout,
};
const contentComponentNow = computed(() => {
  return contentComponents["Hime" + _.capitalize(appStore.ui.activeMenuItem)];
});
</script>

<style lang="scss">
.el-main {
  background-color: var(--el-fill-color-lighter);
}
.content--hime {
  width: 100%;
  // 限住高度，让el-scrollbar生效
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 调节config的页面样式，即display页面和general页面

.el-form--config--hime {
  .el-form-item {
    margin-bottom: 10px;
    .el-form-item__label {
      font-size: var(--el-font-size-medium);
      font-weight: bold;
    }
    .el-form-item__content {
      flex-direction: column;
      align-items: flex-start;
      > * {
        margin-bottom: 6px;
      }
      .el-slicder--with-label--hime {
        display: flex;
        width: 300px;
      }
    }
  }
}
.el-form--large-label--hime > .el-form-item > .el-form-item__label {
  font-size: var(--el-font-size-extra-large);
  line-height: initial;
}
</style>
