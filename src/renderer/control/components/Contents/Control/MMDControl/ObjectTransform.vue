<template>
  <div>
    <config-item label="树状选择">
      <el-tree-select
        :data="[transformInfo.tree]"
        check-strictly
        v-model="nodeIdNow"
      />
    </config-item>
    <!-- 我去，这几天这么巧的吗，又碰到一个Element Plus刚刚修复了的bug：https://github.com/element-plus/element-plus/issues/8542 -->
    <config-item label="预测列表选择">
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
    ></transform>
  </div>
</template>

<script setup>
import Transform from "../Common/Transform3D.vue";
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
</script>

<style lang="scss"></style>
