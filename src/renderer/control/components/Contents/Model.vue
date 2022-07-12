<template>
  <el-form label-position="top" class="el-form--large-label--hime">
    <hime-title-with-divider>{{ $t("menu.model") }}</hime-title-with-divider>
    <el-form-item label="模型数据库">
      <el-table
        :data="appStore.database.model"
        size="small"
        highlight-current-row
        class="current-row--adjust-bg-color--hime el-table--model--hime"
      >
        <el-table-column label="名称" prop="name" />
        <el-table-column label="类型">
          <template #default="props">
            <el-tag effect="light">
              {{ props.row.modelType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="扩展名">
          <template #default="props">
            <el-tag effect="light">
              {{ props.row.extentionName }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-button @click="loadModelNow">载入当前模型</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import { useAppStore } from "../../store/app";
const appStore = useAppStore();
function loadModelNow() {}
</script>

<style lang="scss">
.el-table--model--hime {
  margin-bottom: 10px;
}
.current-row--adjust-bg-color--hime {
  // 同时:hover和current应该显示current的效果更合理
  .el-table__body tr:hover.current-row > td.el-table__cell {
    background-color: var(--el-table-current-row-bg-color);
  }
  // 考虑加深强调颜色
  //   --el-table-current-row-bg-color: var(--el-color-primary-light-8);
  // tr {
  //   --el-table-row-hover-bg-color: var(--el-color-primary-light-9);
  // }
}
</style>
