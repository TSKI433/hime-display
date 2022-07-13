<template>
  <el-form label-position="top" class="el-form--large-label--hime">
    <hime-title-with-divider>{{ $t("menu.model") }}</hime-title-with-divider>
    <el-form-item label="模型数据库">
      <el-table
        :data="appStore.database.model"
        @current-change="changeCurrentModelInfo"
        size="small"
        highlight-current-row
        class="current-row--adjust-bg-color--hime el-table--model--hime"
      >
        <el-table-column type="index" width="30" />
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
      <el-button
        @click="loadModelNow()"
        :disabled="
          !appStore.displayWindowInfo.isOpened || currentModelInfo === undefined
        "
        >载入当前模型</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import { ref, toRaw } from "vue";
import { useAppStore } from "../../store/app";
const appStore = useAppStore();
// 本来不需要将currentModelInfo一开始就用成响应式的，直接在changeCurrentModelInfo写成 currentModelInfo = currentRow就好，但因为在载入模型的按钮那里做了个动态判断，所以改成ref了
// 尝试了一下，ref().value的值为undefined，写成ref(null)可以和null比较但没必要
let currentModelInfo = ref();
window.ref = ref;
const ipcAPI = window.nodeAPI.ipc;
function changeCurrentModelInfo(currentRow) {
  currentModelInfo.value = currentRow;
}
function loadModelNow() {
  const rawModelInfo = toRaw(currentModelInfo);
  ipcAPI.loadModel(appStore.displayWindowInfo.id, rawModelInfo);
  console.log(
    `[Hime Display] Load model: name:${rawModelInfo.name}, modelType:${rawModelInfo.modelType}`
  );
}
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
