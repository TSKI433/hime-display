<template>
  <config-item :label="$t('control.transform.tree-select')">
    <el-tree-select
      :data="[transformInfo.tree]"
      check-strictly
      v-model="nodeIdNow"
    />
  </config-item>
  <!-- 我去，这几天这么巧的吗，又碰到一个Element Plus刚刚修复了的bug：https://github.com/element-plus/element-plus/issues/8542 -->
  <config-item :label="$t('control.transform.auto-fill-select')">
    <el-select v-model="nodeIdNow" filterable>
      <el-option
        v-for="transformItem in transformInfo.list"
        :label="transformItem.label"
        :value="transformItem.value"
      >
      </el-option>
    </el-select>
  </config-item>
  <transform
    :transform-object="transformObject"
    @input="setNodeTransform"
    :disabled="nodeIdNow === ''"
  ></transform>
</template>

<script setup>
import Transform from "./Transform3D.vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
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
  ipcAPI.sendToModelManager({
    channel: "control:bind-node-transform",
    data: { nodeId: newId },
  });
});
// 这里和morph不一样，不用watch了，下方对"manager:update-node-transform"事件的处理（出于懒）使用了直接赋值position，rotation，scale，改变了引用对象，因此展示器那边带来的数据更新也会触发watch，带来不必要的消耗（甚至可能导致死循环，不过根据目前monitor的监测机制，应该会在第二重循环上就拦住的）
// watch(transformObject, (newTransform) => {
//      ipcAPI.setNodeTransform(nodeIdNow.value,toRaw(newTransform))
// });
function setNodeTransform() {
  ipcAPI.sendToModelManager({
    channel: "control:set-node-transform",
    data: {
      nodeId: nodeIdNow.value,
      transform: toRaw(transformObject),
    },
  });
}

// 照理来讲，模型控制这一级的组件没用keep-alive，动态组件切换后事件监听也能正确弄过去？（目前已在切换组件时已进行了事件监听清理）
ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-node-transform": {
      // 直接赋值会完全失去响应性
      transformObject.position = message.data.position;
      transformObject.rotation = message.data.rotation;
      transformObject.scale = message.data.scale;
      break;
    }
  }
});
</script>

<style lang="scss"></style>
