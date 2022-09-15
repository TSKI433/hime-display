<template>
  <config-item :label="$t('control.parameter.skin')">
    <el-select v-model="selectedSkin" @change="setSkin" filterable>
      <el-option v-for="skin in skinInfo" :label="skin" :value="skin" />
    </el-select>
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { ref } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  skinInfo: Object,
});
const selectedSkin = ref("default");
function setSkin() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:set-skin",
    data: {
      skin: selectedSkin.value,
    },
  });
}
</script>

<style lang="scss"></style>
