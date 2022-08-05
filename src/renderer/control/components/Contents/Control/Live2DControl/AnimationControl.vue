<template>
  <config-item label="动作数据库" label-position="top">
    <el-table
      :data="motions"
      @current-change="changeCurrentMotion"
      highlight-current-row
      height="300"
      size="small"
      tooltip-effect="light"
    >
      <el-table-column label="名称" show-overflow-tooltip align="center">
        <template #default="scope">
          <!-- moc与moc3的入口文件名称略有区别 -->
          {{
            (scope.row.File || scope.row.file) &&
            /(?<=\/?)[^\/]+(?=\.(json|mtn))/.exec(
              scope.row.File || scope.row.file
            )[0]
          }}
        </template>
      </el-table-column>
      <el-table-column label="动作组" prop="group" width="200" align="center">
      </el-table-column>
    </el-table>
  </config-item>
  <config-item label="操作">
    <el-button @click="loadMotionNow"> 载入当前动作 </el-button>
  </config-item>
</template>

<script setup>
import { computed, ref, toRaw } from "vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
let currentMotion = null;
const motionTabelSelected = ref(false);
const props = defineProps({
  motionInfo: Object,
});
const motions = computed(function () {
  const motionList = [];
  Object.keys(props.motionInfo).forEach((motionGroupName) => {
    props.motionInfo[motionGroupName].forEach((motion, index) => {
      motion.group = motionGroupName;
      motionList.push(motion);
    });
  });
  return motionList;
});
function changeCurrentMotion(currentRow) {
  motionTabelSelected.value = true;
  currentMotion = currentRow;
}
function loadMotionNow() {
  ipcAPI.sendToModelManager(appStore.displayWindowId, {
    channel: "control:load-motion",
    data: {
      motion: toRaw(currentMotion),
    },
  });
}
</script>

<style lang="scss"></style>
