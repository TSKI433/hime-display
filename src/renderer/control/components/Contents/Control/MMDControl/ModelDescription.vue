<template>
  <el-descriptions border size="small" direction="vertical" :column="5">
    <el-descriptions-item align="center" label="名称">{{
      descriptionData.name
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="扩展名">{{
      descriptionData.extensionName
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="顶点数">{{
      descriptionData.vertexCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="三角形数">{{
      descriptionData.triangleCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="骨骼数">{{
      descriptionData.boneCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="IK数">{{
      descriptionData.ikCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="刚体数">{{
      descriptionData.rigidBodyCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="约束数">{{
      descriptionData.constraintCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="付与数">{{
      descriptionData.grantCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="变形数">{{
      descriptionData.morphCount
    }}</el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  descriptionData: Object,
});
</script>

<style lang="scss" scoped></style>
