<template>
  <div>
    <el-tree-select
      :data="[controlInfo.tree]"
      check-strictly
      v-model="nodeIdNow"
      @change="syncAutoCompleteValue"
    />
    <!-- 我去，这几天这么巧的吗，又碰到一个Element Plus刚刚修复了的bug：https://github.com/element-plus/element-plus/issues/8542 -->
    <el-autocomplete
      v-model="autoCompleteValue"
      :fetch-suggestions="querySearch"
      @select="handleSelect"
    ></el-autocomplete>
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
  controlInfo: Object,
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
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:bind-node-transform",
    data: { nodeId: newId },
  });
});
// 这里不能watch了，因为展示器那边带来的数据更新也会触发watch，造成死循环
// watch(transformObject, (newTransform) => {
//      ipcAPI.setNodeTransform(nodeIdNow.value,toRaw(newTransform))
// });
function setNodeTransform() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:set-node-transform",
    data: {
      nodeId: nodeIdNow.value,
      transform: toRaw(transformObject),
    },
  });
}

// 照理来讲，模型控制这一级的组件没用keep-alive，动态组件切换后事件监听也能正确弄过去？
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-node-transform": {
      // 直接赋值会失去响应性
      transformObject.position = message.data.position;
      transformObject.rotation = message.data.rotation;
      transformObject.scale = message.data.scale;
      break;
    }
  }
});
const autoCompleteValue = ref("");
function querySearch(queryString, callback) {
  const results = queryString
    ? props.controlInfo.list.filter((item) => {
        return item.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1;
      })
    : props.controlInfo.list;
  callback(results);
}
// 输入预测框向树形选择的绑定是自动的
function handleSelect(item) {
  nodeIdNow.value = item.id;
}
// 树形选择向输入预测框的绑定
function syncAutoCompleteValue(id) {
  autoCompleteValue.value = props.controlInfo.list.find(
    (item) => item.id === id
  ).value;
}
</script>

<style lang="scss"></style>
