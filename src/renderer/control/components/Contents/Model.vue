<template>
  <div class="hime-content">
    <hime-title-with-divider>{{ $t("menu.model") }}</hime-title-with-divider>
    <el-form label-position="top" class="hime-el-form--large-label">
      <el-form-item :label="$t('model.model-db')">
        <el-input
          v-model="searchModelText"
          :placeholder="$t('model.search-model')"
          clearable
          class="hime-el-input--model-search"
        />
        <el-table
          :data="filterModelData"
          @current-change="changeCurrentModelInfo"
          size="small"
          height="350"
          highlight-current-row
          tooltip-effect="light"
          class="hime-current-row--adjust-bg-color hime-el-table--model"
        >
          <el-table-column type="index" width="60" align="center" />
          <el-table-column
            :label="$t('model.name')"
            prop="name"
            width="280"
            show-overflow-tooltip
            sortable
          />
          <el-table-column :label="'版本'" prop="name" align="center">
            <template #default="props">
              {{ props.row.version ?? "--" }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('model.type')"
            :filters="[
              { text: 'Live2D', value: 'Live2D' },
              { text: 'MMD', value: 'MMD' },
              { text: 'VRoid', value: 'VRoid' },
              { text: 'Spine', value: 'Spine' },
            ]"
            :filter-method="
              (value, row) => {
                return row.modelType === value;
              }
            "
            align="center"
          >
            <template #default="props">
              <el-tag
                effect="light"
                :color="props.row.themeColor + '22'"
                :style="{
                  color: props.row.themeColor,
                  'border-color': props.row.themeColor + '44',
                }"
              >
                {{ props.row.modelType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('model.extension')"
            :filters="[
              { text: 'moc', value: 'moc' },
              { text: 'moc3', value: 'moc3' },
              { text: 'pmx', value: 'pmx' },
              { text: 'vrm', value: 'vrm' },
              { text: 'json', value: 'json' },
            ]"
            :filter-method="
              (value, row) => {
                return row.extensionName === value;
              }
            "
            align="center"
          >
            <template #default="props">
              <el-tag effect="light" type="info">
                {{ props.row.extensionName }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          @click="loadModelNow(currentModelInfo.value)"
          :disabled="appStore.displayWindowId === -1 || !modelTableSelected"
          >{{ $t("model.load-selected-model") }}</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import { ref, toRaw, markRaw, reactive, computed, watch } from "vue";
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
function loadModelNow(modelInfo) {
  const rawModelInfo = toRaw(modelInfo);
  controlStore.currentModelType = rawModelInfo.modelType;
  controlStore.modelControlInfoLoading = true;
  controlStore.modelControlInfo = null;
  // 更新数据库中的当前模型信息
  appStore.database.modelNow = rawModelInfo;
  window.nodeAPI.database.write("modelNow", rawModelInfo);
  ipcAPI.loadModel(rawModelInfo);
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
// 如果这个页面没有加载过，这里的watch就不会生效，导致无法在打开应用时自动加载上次的模型
// 默认打开页面一直是这个Model页面，换了一个页面才发现这个问题，后来想了一下，还是就把默认的启动页面设定为model吧
watch(appStore.displayWindowOpened, (value) => {
  console.log("[Hime Display] displayWindowId changed", value.value);
  if (value.value) {
    ipcAPI.queryDisplayWindowState();
    ipcAPI.handleDisplayWindowState((event, message) => {
      console.log("[Hime Display] displayWindowState", message);
      if (
        !message.modelLoaded &&
        appStore.config.display["auto-load-last"] &&
        appStore.database.modelNow !== null
      ) {
        loadModelNow(appStore.database.modelNow);
      }
      // 下方代码用于处理控制面板重新后模型信息清空的问题，但是用这种机制来处理的话，模型控制的instant config难以被同步到控制面板上，目前该用不关闭控制面板，在主进程改为隐藏的操作来解决这个问题
      // else  if (message.modelLoaded) {
      //   controlStore.currentModelType = appStore.database.modelNow.modelType;
      //   controlStore.modelControlInfo = markRaw(message.modelControlInfo);
      //   controlStore.modelControlInfoLoading = false;
      // }
    });
  }
});
const searchModelText = ref("");
const filterModelData = computed(() =>
  appStore.database.model.filter(
    (data) =>
      !searchModelText.value ||
      data.name.toLowerCase().includes(searchModelText.value.toLowerCase())
  )
);
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
.hime-el-input--model-search {
  margin-bottom: 8px;
}
</style>
