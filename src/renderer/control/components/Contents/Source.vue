<template>
  <div class="hime-content">
    <hime-title-with-divider>{{ $t("menu.source") }}</hime-title-with-divider>
    <el-form label-position="top" class="hime-el-form--large-label">
      <el-form-item :label="$t('source.data-source')">
        <!-- row-key用于辨识row，解决expand输入内容后自动折叠，以及一旦展开就变成全部展开的问题 -->
        <el-table
          :data="appStore.database.sourcePathInfo"
          :border="true"
          row-key="sourcePath"
          ref="sourceTable"
          class="hime-el-table--source-path"
          size="small"
          tooltip-effect="light"
          max-height="160"
        >
          <!-- 使用width="1"隐藏默认小箭头 -->
          <el-table-column type="expand" width="1">
            <template #default="props">
              <div class="hime-el-table__expanded-container">
                <el-form
                  label-position="top"
                  class="hime-el-form--expanded"
                  :inline="true"
                >
                  <el-form-item :label="$t('source.search-type')">
                    <!-- 官方文档里面没有说el-checkbox-button有change事件，但是经过实际测试是有的，然后就拿来用了 -->
                    <el-checkbox-button
                      v-for="sourceType in sourceTypes"
                      v-model="props.row.sourceTypes[sourceType]"
                      :key="sourceType"
                      :label="sourceType"
                      @change="writeSourcePathInfo"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('source.source-path')"
            prop="sourcePath"
            show-overflow-tooltip
          />
          <!-- 备选方案：通过滚动展示过长的路径名
        <el-table-column label="路径" prop="path">
          <template #default="props">
            <el-scrollbar>
              <div style="padding: 0 10px">
                {{ props.row.path }}
              </div>
            </el-scrollbar>
          </template>
        </el-table-column> -->
          <el-table-column
            :label="$t('source.operate')"
            width="210"
            align="center"
          >
            <template #default="props">
              <el-tooltip :show-after="600" effect="light">
                <template #default>
                  <!-- 发现props里有个文档里没说的expanded属性，正好可以拿来用 -->
                  <svg-icon-el-button
                    size="small"
                    :name="'sf-' + (props.expanded ? 'close' : 'edit')"
                    @click="expandRow(props.row)"
                  ></svg-icon-el-button>
                </template>
                <template #content>
                  {{
                    props.expanded
                      ? $t("source.end-edit-search-type")
                      : $t("source.edit-search-type")
                  }}
                </template>
              </el-tooltip>
              <el-tooltip :show-after="600" effect="light">
                <template #default>
                  <svg-icon-el-button
                    size="small"
                    name="sf-source"
                    @click="showInFolder(props.row.sourcePath)"
                  ></svg-icon-el-button>
                </template>
                <template #content>
                  {{ $t("source.show-in-file-browser") }}</template
                >
              </el-tooltip>
              <el-tooltip :show-after="600" effect="light">
                <template #default>
                  <svg-icon-el-button
                    size="small"
                    name="sf-refresh"
                    @click="loadFromSourcePath(props.row)"
                  ></svg-icon-el-button>
                </template>
                <template #content> {{ $t("source.refresh") }} </template>
              </el-tooltip>
              <el-popconfirm
                :title="$t('source.delete-source-confirm')"
                @confirm="deleteSourcePath(props.$index)"
              >
                <template #reference>
                  <!-- 嵌套使用el-popconfirm和el-tooltip需要加一层div包裹，但这会导致样式变化 -->
                  <div style="display: inline-block; margin-left: 12px">
                    <el-tooltip :show-after="600" effect="light">
                      <template #default>
                        <svg-icon-el-button
                          size="small"
                          name="sf-delete"
                        ></svg-icon-el-button>
                      </template>
                      <template #content>
                        {{ $t("source.delete-source") }}
                      </template>
                    </el-tooltip>
                  </div>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button @click="addSourePath">{{
          $t("source.add-source")
        }}</el-button>
        <el-button @click="loadFromSourcePathAll">{{
          $t("source.search-all-source")
        }}</el-button>
      </el-form-item>
      <el-form-item :label="$t('source.statistic-info')">
        <el-table :data="totalInfo" size="small" :border="true">
          <el-table-column
            v-for="(totalCount, totalName) in totalInfo[0]"
            :prop="totalName"
            :label="totalName"
            align="center"
          >
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, toRaw, computed } from "vue";
import SvgIconElButton from "@control/components/Common/SvgIconElButton.vue";
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const sourceTypes = ["Live2D", "Spine", "VRoid", "MMD", "motion3D", "audio3D"];
const sourceTable = ref();
const totalInfo = computed(() => [
  {
    Live2D: appStore.database.model.filter((item) => {
      return item.modelType === "Live2D";
    }).length,
    Spine: appStore.database.model.filter((item) => {
      return item.modelType === "Spine";
    }).length,
    VRoid: appStore.database.model.filter((item) => {
      return item.modelType === "VRoid";
    }).length,
    MMD: appStore.database.model.filter((item) => {
      return item.modelType === "MMD";
    }).length,
    motion3D: appStore.database.motion3D.length,
    audio3D: appStore.database.audio3D.length,
  },
]);
// 不能watch了，我人要废了……因为同步数据库也会触发watch的，需要的时候我还是手动写入数据吧
// // 实时更新数据库
// watch(appStore.database.sourcePathInfo, (newValue) => {
//   // 这里没办法只有把整个source数据传过去
//   window.nodeAPI.database.write("sourcePathInfo", toRaw(newValue));
// });
function writeSourcePathInfo() {
  window.nodeAPI.database.write(
    "sourcePathInfo",
    toRaw(appStore.database.sourcePathInfo)
  );
}
function expandRow(row) {
  sourceTable.value.toggleRowExpansion(row);
  // 这不是script setup里的用法
  // console.log(this.$refs);
  // this.$refs.sourceTable.toggleRowExpansion(row);
}
function showInFolder(path) {
  window.nodeAPI.showInFolder(path);
}
function deleteSourcePath(index) {
  // 移除数据源相关的数据条目
  const sourcePath = appStore.database.sourcePathInfo[index].sourcePath;
  window.nodeAPI.database.removeDataFromSourcePath(sourcePath);
  appStore.syncDatabase();
  // 千万别在这条语句下方同步数据库，不然直接把preload里面的旧sourcePathInfo数据弄过来了
  appStore.database.sourcePathInfo.splice(index, 1);
  writeSourcePathInfo();
}
function addSourePath() {
  window.nodeAPI.ipc.selectPath().then((path) => {
    if (path.length > 0) {
      // 这里不自动执行loadFromSourcePath是有深刻原因的，用户或许并不希望载入所有的sourceTypes，因此应当等到筛选sourceTypes后再手动载入
      appStore.database.sourcePathInfo.push({
        sourcePath: path[0],
        tagName: "",
        sourceTypes: {
          Live2D: true,
          Spine: true,
          MMD: true,
          VRoid: true,
          motion3D: true,
          audio3D: true,
        },
      });
      writeSourcePathInfo();
    }
  });
}
function loadFromSourcePath(sourcePathInfo) {
  window.nodeAPI.database
    .loadDataFromSourcePathInfo(toRaw(sourcePathInfo))
    .then(() => {
      appStore.syncDatabase();
    });
}
function loadFromSourcePathAll() {
  const promises = [];
  appStore.database.sourcePathInfo.forEach((sourcePathInfo) => {
    promises.push(
      window.nodeAPI.database.loadDataFromSourcePathInfo(toRaw(sourcePathInfo))
    );
  });
  Promise.all(promises).then(() => {
    appStore.syncDatabase();
  });
}
</script>

<style lang="scss">
.hime-el-table--source-path {
  margin-bottom: 10px;
  .el-table__expand-icon {
    // 配合上方的width="1"使用，可以隐藏默认的小箭头
    color: transparent;
  }
  .el-table__expanded-cell {
    .hime-el-table__expanded-container {
      padding: 5px 0 5px 20px;
    }
    .hime-el-table__expanded-input--tag {
      width: 75px;
      margin-top: 2px;
    }
  }
}

// 直接将size设为small就行了
// .el-table .el-table__cell {
//   padding: 6px 0;
// }
//element plus的样式里有一个.el-form-item .el-form-item选择器会把margin-bottom设为0，这里覆盖一下
// .el-form-item .source--form .el-form-item {
//   margin-bottom: 18px;
// }
// .hime-el-form--expanded input {
//   width: 80px;
// }
</style>
