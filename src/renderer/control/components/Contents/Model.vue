<template>
  <div class="hime-content">
    <hime-title-with-divider>{{ $t("menu.model") }}</hime-title-with-divider>
    <el-form label-position="top" class="hime-el-form--large-label">
      <el-form-item label="模型数据库">
        <el-table
          :data="appStore.database.model"
          @current-change="changeCurrentModelInfo"
          size="small"
          height="300"
          highlight-current-row
          tooltip-effect="light"
          class="hime-current-row--adjust-bg-color hime-el-table--model"
        >
          <el-table-column type="index" width="40" />
          <el-table-column label="名称" prop="name" show-overflow-tooltip />
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
                {{ props.row.extensionName }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          @click="loadModelNow()"
          :disabled="appStore.displayWindowId === -1 || !modelTableSelected"
          >载入当前模型</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import { ref, toRaw, markRaw, reactive } from "vue";
import { useAppStore } from "@control/store/app";
import { useControlStore } from "@control/store/control";
const appStore = useAppStore();
const controlStore = useControlStore();
const currentModelInfo = reactive({ value: null });
const modelTableSelected = ref(false);
const ipcAPI = window.nodeAPI.ipc;
function changeCurrentModelInfo(currentRow) {
  modelTableSelected.value = true;
  currentModelInfo.value = currentRow;
}
function loadModelNow() {
  const rawModelInfo = toRaw(currentModelInfo.value);
  controlStore.currentModelType = rawModelInfo.modelType;
  controlStore.modelControlInfoLoading = true;
  controlStore.modelControlInfo = null;
  ipcAPI.loadModel(appStore.displayWindowId, rawModelInfo);
  console.log(
    `[Hime Display] Load model: name:${rawModelInfo.name}, modelType:${rawModelInfo.modelType}`
  );
  ipcAPI.receiveModelControlInfo((event, modelControlInfo) => {
    // 关键点，使用markRaw包装对象。一些模型，比如MMD的层级结构复杂的离谱，能往下嵌套十几级，涉及到四五百，甚至更多的骨骼，用成响应式对象会直接影响到性能
    // 按现在这种写法，modelControlInfo在发生引用值改变时依旧可以响应式变化，例如设定controlStore.modelControlInfo={}是可以响应式改变UI的，只是改变modelControlInfo内部的东西不会触发UI变化
    controlStore.modelControlInfo = markRaw(modelControlInfo);
    controlStore.modelControlInfoLoading = false;
  });
}
</script>

<style lang="scss">
.hime-el-table--model {
  margin-bottom: 10px;
}
.hime-current-row--adjust-bg-color {
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
