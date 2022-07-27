<template>
  <el-descriptions border size="small" direction="vertical" :column="5">
    <el-descriptions-item
      align="center"
      width="20%"
      :label="descriptionItem.label"
      v-for="descriptionItem in descriptionInfo"
      >{{ controlInfo[descriptionItem.param] }}</el-descriptions-item
    >
  </el-descriptions>
</template>

<script setup>
import { reactive } from "vue";
const props = defineProps({
  controlInfo: Object,
});
const descriptionInfo = reactive({
  name: {
    label: "名称",
    param: "name",
  },
  "extention-name": {
    label: "扩展名",
    param: "extensionName",
  },
  "vertex-count": {
    label: "顶点数",
    param: "vertexCount",
  },
  "triangle-count": {
    label: "三角形数",
    param: "triangleCount",
  },
  "bone-count": {
    label: "骨骼数",
    param: "boneCount",
  },
  "ik-count": {
    label: "IK数",
    param: "ikCount",
  },
  "rigidBody-count": {
    label: "刚体数",
    param: "rigidBodyCount",
  },
  "constraint-count": {
    label: "约束数",
    param: "constraintCount",
  },
  "grant-count": {
    label: "付与数",
    param: "grantCount",
  },
  "morph-count": {
    label: "变形数",
    param: "morphCount",
  },
});
</script>

<style lang="scss"></style>
