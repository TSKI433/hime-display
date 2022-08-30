<template>
  <div class="hime-content">
    <hime-title-with-divider>{{ $t("menu.control") }}</hime-title-with-divider>
    <!-- <HimeMMDControl></HimeMMDControl> -->
    <template
      v-if="
        controlComponentNow !== undefined &&
        !controlStore.modelControlInfoLoading
      "
    >
      <component :is="controlComponentNow"></component>
    </template>
    <template v-else>
      <div class="hime-model-control--blank">
        {{ $t("control.load-a-model-to-control") }}
      </div>
    </template>
  </div>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import HimeMMDControl from "@control/components/Contents/Control/MMDControl/index.vue";
import HimeSpineControl from "@control/components/Contents/Control/SpineControl/index.vue";
import HimeVRoidControl from "@control/components/Contents/Control/VRoidControl/index.vue";
import HimeLive2DControl from "@control/components/Contents/Control/Live2DControl/index.vue";
import { useControlStore } from "@control/store/control";
import { computed, watch } from "vue";
const controlStore = useControlStore();
const controlComponents = {
  HimeMMDControl,
  HimeSpineControl,
  HimeVRoidControl,
  HimeLive2DControl,
};
const controlComponentNow = computed(() => {
  return controlComponents[`Hime${controlStore.currentModelType}Control`];
});
watch(
  () => controlStore.currentModelType,
  () => {
    // 切换模型类型时，清空事件监听
    nodeAPI.ipc.removeManagerListeners();
  }
);
</script>

<style lang="scss">
.hime-model-control {
  flex: 1;
}
.hime-model-control--blank {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 2rem;
  color: var(--el-text-color-placeholder);
  height: 100%;
}
</style>
