<template>
  <div class="hime-model-control">
    <el-tabs type="border-card">
      <el-tab-pane :label="$t(`control.model-description`)">
        <template
          v-if="controlStore.modelControlInfo?.description !== undefined"
        >
          <model-description
            :description="controlStore.modelControlInfo.description"
          >
          </model-description>
          <div
            style="
              color: var(--el-text-color-secondary);
              margin: 1rem auto 0;
              width: 95%;
            "
          >
            {{ $t(`control.description.spine-license`) }}
          </div>
        </template>
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
import ControlLoadError from "../Common/ControlLoadError.vue";
import ModelDescription from "../Common/ModelDescription.vue";
import Transform from "../Common/2d/Transform2D.vue";
import AnimationControl from "./AnimationControl.vue";
import { useControlStore } from "@control/store/control";
const controlStore = useControlStore();
</script>

<style lang="scss"></style>
