<template>
  <div class="hime-model-control">
    <el-tabs type="border-card">
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
        <transform></transform>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.animation-control`)">
        <animation-control
          v-if="controlStore.modelControlInfo?.motion !== undefined"
          :motion-info="controlStore.modelControlInfo.motion"
        >
        </animation-control>
        <template v-else>
          <control-load-error></control-load-error>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import ControlLoadError from "../Common/ControlLoadError.vue";
import ModelDescription from "../Common/ModelDescription.vue";
import Transform from "../Common/2d/Transform2D.vue";
import AnimationControl from "./AnimationControl.vue";
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
  "version-number": {
    label: "版本号",
    param: "versionNumber",
  },
  "animation-count": {
    label: "动作数",
    param: "animationCount",
  },
  "bone-count": {
    label: "骨骼数",
    param: "boneCount",
  },
  "slot-count": {
    label: "插槽数",
    param: "slotCount",
  },
  "ik-count": {
    label: "IK数",
    param: "ikCount",
  },
  "skin-count": {
    label: "皮肤数",
    param: "skinCount",
  },
});
</script>

<style lang="scss"></style>
