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
      <el-tab-pane label="模型信息">
        <ModelDescription3D
          v-if="controlStore.modelControlData?.description !== undefined"
          :description-data="controlStore.modelControlData.description"
        ></ModelDescription3D>
        <template v-else>数据载入错误</template>
      </el-tab-pane>
      <el-tab-pane label="对象变换">
        <ObjectTransform
          v-if="controlStore.modelControlData?.transform !== undefined"
          :transform-data="controlStore.modelControlData.transform"
        ></ObjectTransform>
        <template v-else>数据载入错误</template>
      </el-tab-pane>
      <el-tab-pane label="动画播放">
        <AnimationControl></AnimationControl>
      </el-tab-pane>
      <el-tab-pane label="动作捕捉">
        <MotionCapture></MotionCapture>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import ModelDescription3D from "./ModelDescription.vue";
import ObjectTransform from "./ObjectTransform.vue";
import AnimationControl from "./AnimationControl.vue";
import MotionCapture from "./MotionCapture.vue";
import { useControlStore } from "@control/store/control";
const controlStore = useControlStore();
</script>

<style lang="scss"></style>
