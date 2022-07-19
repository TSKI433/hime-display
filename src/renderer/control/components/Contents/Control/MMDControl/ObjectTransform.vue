<template>
  <div>
    <el-tree-select
      :data="[transformInfo]"
      check-strictly
      v-model="nodeIdNow"
    />
    <transform
      :transform-object="transformObject"
      @input="setNodeTransform"
    ></transform>
  </div>
</template>

<script setup>
import Transform from "../Common/Transform3D.vue";
import { reactive, ref, watch, toRaw } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  transformInfo: Object,
});
const transformObject = reactive({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
});
const nodeIdNow = ref("");
// 此处发现，vue的watch对于ref返回原始值，对于reactive返回代理值
watch(nodeIdNow, (newId, oldId) => {
  if (newId === oldId) return;
  ipcAPI.requestBindNodeTransform(appStore.displayWindowId, newId);
});
// 这里不能watch了，因为展示器那边带来的数据更新也会触发watch，造成死循环
// watch(transformObject, (newTransform) => {
//      ipcAPI.setNodeTransform(nodeIdNow.value,toRaw(newTransform))
// });
function setNodeTransform() {
  ipcAPI.setNodeTransform(
    appStore.displayWindowId,
    nodeIdNow.value,
    toRaw(transformObject)
  );
}
ipcAPI.handelUpdateNodeTransfrom((event, newTransform) => {
  transformObject.position = newTransform.position;
  transformObject.rotation = newTransform.rotation;
  transformObject.scale = newTransform.scale;
});
</script>

<style lang="scss" scoped></style>
