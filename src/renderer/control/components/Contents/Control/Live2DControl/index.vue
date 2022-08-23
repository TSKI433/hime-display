<template>
  <div class="hime-model-control">
    <el-tabs type="border-card">
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
        <transform></transform>
      </el-tab-pane>
      <el-tab-pane :label="$t(`control.parameter-control`)">
        <parameter-control
          v-if="
            controlStore.modelControlInfo?.parameter !== undefined &&
            controlStore.modelControlInfo?.part !== undefined
          "
          :parameter-info="controlStore.modelControlInfo.parameter"
          :part-info="controlStore.modelControlInfo.part"
        ></parameter-control>
        <template v-else>
          <control-load-error></control-load-error>
        </template>
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
      <el-tab-pane :label="$t(`control.motion-capture`)">
        <motion-capture :has-holistic="false"></motion-capture>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import ControlLoadError from "../Common/ControlLoadError.vue";
import ModelDescription from "../Common/ModelDescription.vue";
import Transform from "../Common/2d/Transform2D.vue";
import ParameterControl from "./ParameterControl.vue";
import AnimationControl from "./AnimationControl.vue";
import MotionCapture from "../Common/MotionCapture.vue";
import { useControlStore } from "@control/store/control";
const controlStore = useControlStore();
</script>

<style lang="scss"></style>
