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
          :description-info="descriptionInfo"
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
      <el-tab-pane :label="$t(`control.animation-control`)">
        <animation-control> </animation-control>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.parameter-control`)">
        <parameter-control
          v-if="controlStore.modelControlInfo?.morph !== undefined"
          :morph-info="controlStore.modelControlInfo.morph"
        >
        </parameter-control>
        <template v-else>
          <control-load-error></control-load-error>
        </template>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.motion-capture`)">
        <motion-capture> </motion-capture>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import ControlLoadError from "../Common/ControlLoadError.vue";
import ModelDescription from "../Common/ModelDescription.vue";
import ObjectTransform from "../Common/3d/ObjectTransform3D.vue";
import AnimationControl from "../Common/3d/AnimationControl.vue";
import ParameterControl from "../Common/3d/ParameterControl.vue";
import MotionCapture from "../Common/MotionCapture.vue";
import { useControlStore } from "@control/store/control";
const controlStore = useControlStore();
const descriptionInfo = reactive({
  name: {
    label: "名称",
    param: "name",
  },
  "extention-name": {
    label: "扩展名",
    param: "extensionName",
  },
  "vertex-count": {
    label: "顶点数",
    param: "vertexCount",
  },
  "triangle-count": {
    label: "三角形数",
    param: "triangleCount",
  },
  "bone-count": {
    label: "骨骼数",
    param: "boneCount",
  },
  "ik-count": {
    label: "IK数",
    param: "ikCount",
  },
  "rigidBody-count": {
    label: "刚体数",
    param: "rigidBodyCount",
  },
  "constraint-count": {
    label: "约束数",
    param: "constraintCount",
  },
  "grant-count": {
    label: "付与数",
    param: "grantCount",
  },
  "morph-count": {
    label: "变形数",
    param: "morphCount",
  },
});
</script>

<style lang="scss"></style>
