<template>
  <el-descriptions border size="small" direction="vertical" :column="5">
    <el-descriptions-item align="center" label="名称">{{
      controlInfo.name
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="扩展名">{{
      controlInfo.extensionName
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="顶点数">{{
      controlInfo.vertexCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="三角形数">{{
      controlInfo.triangleCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="骨骼数">{{
      controlInfo.boneCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="IK数">{{
      controlInfo.ikCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="刚体数">{{
      controlInfo.rigidBodyCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="约束数">{{
      controlInfo.constraintCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="付与数">{{
      controlInfo.grantCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="变形数">{{
      controlInfo.morphCount
    }}</el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  controlInfo: Object,
});
</script>

<style lang="scss"></style>
