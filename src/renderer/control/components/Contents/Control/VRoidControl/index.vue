<template>
  <div class="hime-model-control">
    <!-- 弃用方案：使用Menu组件构建 -->
    <!-- <el-menu
      @select="handleSelect"
      mode="horizontal"
      class="hime-el-menu--sub-control"
      :ellipsis="false"
      :default-active="subControlComponentNameNow"
    >
      <el-menu-item index="ModelDescription">模型信息</el-menu-item>
      <el-menu-item index="ObjectTransform">对象变换</el-menu-item>
      <el-menu-item index="AnimationControl">动画播放</el-menu-item>
      <el-menu-item index="MotionCapture">动作捕捉</el-menu-item>
    </el-menu> -->
    <el-tabs type="border-card">
      <!-- 这里用v-for实在是麻烦，还是依次设置 -->
      <el-tab-pane :label="$t(`control.model-description`)">
        <model-description
          v-if="controlStore.modelControlInfo?.description !== undefined"
          :description="controlStore.modelControlInfo.description"
        >
        </model-description>
        <template v-else>
          <control-load-error></control-load-error>
        </template>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.object-transform`)">
        <object-transform
          v-if="controlStore.modelControlInfo?.transform !== undefined"
          :transform-info="controlStore.modelControlInfo.transform"
        >
        </object-transform>
        <template v-else>
          <control-load-error></control-load-error>
        </template>
      </el-tab-pane>
      <!-- 动画转换遇到较大问题，暂时不去支持动画播放了 -->
      <!-- <el-tab-pane :label="$t(`control.animation-control`)">
        <animation-control model-type="VRoid"> </animation-control>
      </el-tab-pane> -->
      <el-tab-pane :label="$t(`control.parameter-control`)">
        <parameter-control
          v-if="controlStore.modelControlInfo?.morph !== undefined"
          :morph-info="controlStore.modelControlInfo.morph"
          model-type="VRoid"
        >
        </parameter-control>
        <template v-else>
          <control-load-error></control-load-error>
        </template>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.motion-capture`)">
        <motion-capture model-type="VRoid"> </motion-capture>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import ControlLoadError from "../Common/ControlLoadError.vue";
import ModelDescription from "../Common/ModelDescription.vue";
import ObjectTransform from "../Common/3d/ObjectTransform3D.vue";
// import AnimationControl from "../Common/3d/AnimationControl.vue";
import ParameterControl from "../Common/3d/ParameterControl.vue";
import MotionCapture from "../Common/MotionCapture.vue";
import { useControlStore } from "@control/store/control";
const controlStore = useControlStore();
</script>

<style lang="scss"></style>
