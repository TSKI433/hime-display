<template>
  <div>
    <el-tree-select :data="[transformData]" check-strictly />
  </div>
</template>

<script setup>
const props = defineProps({
  transformData: Object,
});
</script>

<style lang="scss" scoped></style>
