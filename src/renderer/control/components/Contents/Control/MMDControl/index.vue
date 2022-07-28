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
      <el-menu-item index="ModelDescription3D">模型信息</el-menu-item>
      <el-menu-item index="ObjectTransform">对象变换</el-menu-item>
      <el-menu-item index="AnimationControl">动画播放</el-menu-item>
      <el-menu-item index="MotionCapture">动作捕捉</el-menu-item>
    </el-menu> -->
    <el-tabs type="border-card">
      <!-- 这里用v-for实在是麻烦，还是依次设置 -->
      <el-tab-pane :label="$t(`control.model-description`)">
        <ModelDescription3D
          v-if="controlStore.modelControlInfo?.description !== undefined"
          :control-info="controlStore.modelControlInfo.description"
        >
        </ModelDescription3D>
        <template v-else>数据载入错误</template>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.object-transform`)">
        <ObjectTransform
          v-if="controlStore.modelControlInfo?.transform !== undefined"
          :control-info="controlStore.modelControlInfo.transform"
        >
        </ObjectTransform>
        <template v-else>数据载入错误</template>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.animation-control`)">
        <AnimationControl
          v-if="controlStore.modelControlInfo?.description !== undefined"
        >
        </AnimationControl>
        <template v-else>数据载入错误</template>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.morph-target`)">
        <MorphTarget
          v-if="controlStore.modelControlInfo?.description !== undefined"
          :control-info="controlStore.modelControlInfo.morph"
        >
        </MorphTarget>
        <template v-else>数据载入错误</template>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.motion-capture`)">
        <MotionCapture
          v-if="controlStore.modelControlInfo?.description !== undefined"
        >
        </MotionCapture>
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
import MotionCapture from "./MotionCapture.vue";
import { useControlStore } from "@control/store/control";
const controlStore = useControlStore();
</script>

<style lang="scss"></style>
