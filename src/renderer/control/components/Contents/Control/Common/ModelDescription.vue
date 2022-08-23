<template>
  <el-descriptions border size="small" direction="vertical" :column="5">
    <el-descriptions-item
      align="center"
      width="20%"
      :label="$t(`control.description.${descriptionItem.label}`)"
      v-for="descriptionItem in description"
      >{{ descriptionItem.value }}</el-descriptions-item
    >
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  description: Object,
});
</script>

<style lang="scss"></style>
