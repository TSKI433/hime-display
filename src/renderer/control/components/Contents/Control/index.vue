<template>
  <div class="content--hime">
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
    <template v-else> 载入一个模型以进行控制 </template>
  </div>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import HimeMMDControl from "@control/components/Contents/Control/MMDControl/index.vue";
import HimeSpineControl from "@control/components/Contents/Control/SpineControl/index.vue";
import HimeVRoidControl from "@control/components/Contents/Control/VRoidControl/index.vue";
import HimeLive2DControl from "@control/components/Contents/Control/Live2DControl/index.vue";
import { useControlStore } from "@control/store/control";
import { computed } from "vue";
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
</script>

<style lang="scss">
.model-control--hime {
  flex: 1;
}
</style>
