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
      <!-- 就想用个for循环我容易吗……动态组件，动态参数，动态标题 -->
      <!-- <el-tab-pane
        :label="$t(`control.${subControlKey}`)"
        v-for="subControlKey in subControlKeys"
      >
        <component
          :is="subControlComponents[subControlKey]"
          v-if="controlStore.modelControlInfo?.description !== undefined"
          :control-info="
            controlStore.modelControlInfo[subControlAttrs[subControlKey]]
          "
        ></component>
        <template v-else>数据载入错误</template>
      </el-tab-pane> -->
      <!-- 实在是for不了，改成手动设定 -->
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
      <el-tab-pane :label="$t(`control.camera-parameter`)">
        <CameraParameter
          v-if="controlStore.modelControlInfo?.description !== undefined"
        >
        </CameraParameter>
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
import CameraParameter from "../Common/CameraParameter.vue";
import MotionCapture from "./MotionCapture.vue";
import { useControlStore } from "@control/store/control";
const controlStore = useControlStore();
// 这么写主要是方便i18n
// Object的Key无法保证顺序，因此重新列了个键值数组
// const subControlKeys = [
//   "model-description",
//   "object-transform",
//   "animation-control",
//   "morph-target",
//   "camera-parameter",
//   "motion-capture",
// ];
// const subControlComponents = {
//   "model-description": ModelDescription3D,
//   "object-transform": ObjectTransform,
//   "animation-control": AnimationControl,
//   "morph-target": MorphTarget,
//   "camera-parameter": CameraParameter,
//   "motion-capture": MotionCapture,
// };
// const subControlAttrs = {
//   "model-description": "description",
//   "object-transform": "transform",
//   "animation-control": "animation",
//   "morph-target": "morph",
//   "camera-parameter": "camera",
//   "motion-capture": "motion",
// };
</script>

<style lang="scss"></style>
