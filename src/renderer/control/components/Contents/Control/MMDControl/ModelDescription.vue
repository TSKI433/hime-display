<template>
  <el-descriptions border size="small" direction="vertical" :column="5">
    <el-descriptions-item align="center" label="名称">{{
      descriptionInfo.name
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="扩展名">{{
      descriptionInfo.extensionName
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="顶点数">{{
      descriptionInfo.vertexCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="三角形数">{{
      descriptionInfo.triangleCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="骨骼数">{{
      descriptionInfo.boneCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="IK数">{{
      descriptionInfo.ikCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="刚体数">{{
      descriptionInfo.rigidBodyCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="约束数">{{
      descriptionInfo.constraintCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="付与数">{{
      descriptionInfo.grantCount
    }}</el-descriptions-item>
    <el-descriptions-item align="center" label="变形数">{{
      descriptionInfo.morphCount
    }}</el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  descriptionInfo: Object,
});
</script>

<style lang="scss" scoped></style>
