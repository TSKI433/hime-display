<template>
  <div class="model-control--hime">
    <!-- 弃用方案：使用Menu组件构建 -->
    <!-- <el-menu
      @select="handleSelect"
      mode="horizontal"
      class="el-menu--sub-control--hime"
      :ellipsis="false"
      :default-active="subControlComponentNameNow"
    >
      <el-menu-item index="ModelDescription3D">模型信息</el-menu-item>
      <el-menu-item index="ObjectTransform">对象变换</el-menu-item>
      <el-menu-item index="AnimationControl">动画播放</el-menu-item>
      <el-menu-item index="MotionCapture">动作捕捉</el-menu-item>
    </el-menu> -->
    <el-tabs type="border-card">
      <el-tab-pane
        :label="$t(`control.${subControlKey}`)"
        v-for="subControlKey in subControlKeys"
      >
        <component
          :is="subControlComponents[subControlKey]"
          v-if="controlStore.modelControlInfo?.description !== undefined"
          :description-info="controlStore.modelControlInfo.description"
        ></component>
        <template v-else>数据载入错误</template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import ModelDescription3D from "./ModelDescription.vue";
import ObjectTransform from "./ObjectTransform.vue";
import AnimationControl from "./AnimationControl.vue";
import MorphTarget from "./MorphTarget.vue";
import CameraParameter from "../Common/CameraParameter.vue";
import MotionCapture from "./MotionCapture.vue";
import { useControlStore } from "@control/store/control";
import { reactive } from "vue";
const controlStore = useControlStore();
// 这么写主要是方便i18n
// Object的Key无法保证顺序，因此重新列了个键值数组
const subControlKeys = [
  "model-description",
  "object-transform",
  "animation-control",
  "morph-target",
  "camera-parameter",
  "motion-capture",
];
const subControlComponents = {
  "model-description": ModelDescription3D,
  "object-transform": ObjectTransform,
  "animation-control": AnimationControl,
  "morph-target": MorphTarget,
  "camera-parameter": CameraParameter,
  "motion-capture": MotionCapture,
};
</script>

<style lang="scss"></style>
