<template>
  <el-descriptions border size="small" direction="vertical" :column="5">
    <el-descriptions-item
      align="center"
      width="20%"
      :label="descriptionItem.label"
      v-for="descriptionItem in descriptionInfo"
      >{{ description[descriptionItem.param] }}</el-descriptions-item
    >
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  description: Object,
  descriptionInfo: Object,
});
</script>

<style lang="scss"></style>
