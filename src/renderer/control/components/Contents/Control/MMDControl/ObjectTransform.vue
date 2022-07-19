<template>
  <div>
    <el-tree-select :data="[transformInfo]" check-strictly />
    <transform></transform>
  </div>
</template>

<script setup>
import Transform from "../Common/Transform3D.vue";
import { reactive } from "vue";
const props = defineProps({
  transformInfo: Object,
});
</script>

<style lang="scss" scoped></style>
