<template>
  <el-table
    :data="appStore.database.motion3D"
    @current-change="changeCurrentModelInfo"
    size="small"
    height="300"
    highlight-current-row
  >
    <el-table-column type="index" width="40" />
    <el-table-column label="名称" prop="name" show-overflow-tooltip />
    <el-table-column label="扩展名">
      <template #default="props">
        <el-tag effect="light">
          {{ props.row.extensionName }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { useAppStore } from "@control/store/app";
// 发现奇妙的现象，这里不引入ref不会直接报错，而是先蹦出两三百个vue的警告来
import { ref } from "vue";
const appStore = useAppStore();
let currentMotionInfo = null;
const motionTableSelected = ref(false);
const ipcAPI = window.nodeAPI.ipc;
function changeCurrentModelInfo(currentRow) {
  motionTableSelected.value = true;
  currentMotionInfo = currentRow;
}
</script>

<style lang="scss"></style>
