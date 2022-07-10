<template>
  <el-form label-position="top" class="form--source">
    <hime-title-with-divider>{{ $t("menu.source") }}</hime-title-with-divider>
    <el-form-item label="数据源">
      <!-- row-key用于辨识row，解决expand输入内容后自动折叠的问题 -->
      <el-table
        :data="appStore.database.sourcePathInfo"
        :border="true"
        row-key="path"
        ref="sourceTable"
        class="el-table--source-path--hime"
        size="small"
        tooltip-effect="light"
      >
        <!-- 使用width="1"隐藏默认小箭头 -->
        <el-table-column type="expand" width="1">
          <template #default="props">
            <div class="el-table__expanded-container--hime">
              <el-form
                label-position="top"
                class="el-form--expanded--hime"
                :inline="true"
              >
                <el-form-item label="来源标签">
                  <el-input
                    placeholder="来源标签"
                    v-model="props.row.tagName"
                    class="el-table__expanded-input--tag--hime"
                  />
                </el-form-item>
                <el-form-item label="数据类型">
                  <el-checkbox-button
                    v-for="sourceType in sourceTypes"
                    v-model="props.row.sourceTypes[sourceType]"
                    :key="sourceType"
                    :label="sourceType"
                  />
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="路径" prop="sourcePath" show-overflow-tooltip />
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
          label="来源标签"
          prop="tagName"
          width="100"
          align="center"
        />
        <el-table-column label="操作" width="210" align="center">
          <template #default="props">
            <el-tooltip :show-after="600" effect="light">
              <template #default>
                <!-- 发现props里有个文档里没说的expanded属性，正好可以拿来用 -->
                <svg-icon-el-button
                  size="small"
                  :name="props.expanded ? 'close' : 'edit'"
                  @click="expandRow(props.row)"
                ></svg-icon-el-button>
              </template>
              <template #content>
                {{ props.expanded ? "结束编辑" : "编辑路径信息" }}
              </template>
            </el-tooltip>
            <el-tooltip :show-after="600" effect="light">
              <template #default>
                <svg-icon-el-button
                  size="small"
                  name="source"
                  @click="showInFolder(props.row.sourcePath)"
                ></svg-icon-el-button>
              </template>
              <template #content> 在文件浏览器中显示 </template>
            </el-tooltip>
            <el-tooltip :show-after="600" effect="light">
              <template #default>
                <svg-icon-el-button
                  size="small"
                  name="refresh"
                  @click="loadFromSourcePath(props.row)"
                ></svg-icon-el-button>
              </template>
              <template #content> 重新检索 </template>
            </el-tooltip>
            <el-tooltip :show-after="600" effect="light">
              <template #default>
                <svg-icon-el-button
                  size="small"
                  name="delete"
                  @click="deleteSourcePath(props.$index)"
                ></svg-icon-el-button>
              </template>
              <template #content> 删除该数据源 </template>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-button @click="addSourePath">添加来源</el-button>
      <el-button @click="loadFromSourcePathAll">全部重新检索</el-button>
    </el-form-item>
    <el-form-item label="数据信息">
      <el-table> </el-table>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { watch, ref, toRaw } from "vue";
import { useAppStore } from "../../store/app";
import SvgIconElButton from "@control/components/Common/SvgIconElButton.vue";
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
const appStore = useAppStore();
const sourceTypes = ["live2d", "spine", "vrm", "mmd", "motion3D", "audio3D"];
const sourceTable = ref();
// 实时更新数据库
watch(appStore.database.sourcePathInfo, (newValue) => {
  // 这里没办法只有把整个source数据传过去
  window.nodeAPI.database.write("sourcePathInfo", toRaw(newValue));
});
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
  appStore.database.sourcePathInfo.splice(index, 1);
}
function addSourePath() {
  window.nodeAPI.ipc.selectPath().then((path) => {
    if (path.length > 0) {
      appStore.database.sourcePathInfo.push({
        sourcePath: path[0],
        tagName: "",
        sourceTypes: {
          live2d: true,
          spine: true,
          mmd: true,
          vrm: true,
          motion3D: true,
          audio3D: true,
        },
      });
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
.el-table--source-path--hime {
  margin-bottom: 10px;
  .el-table__expand-icon {
    // 配合上方的width="1"使用，可以隐藏默认的小箭头
    color: transparent;
  }
  .el-table__expanded-cell {
    .el-table__expanded-container--hime {
      padding: 5px 0 5px 20px;
    }
    .el-table__expanded-input--tag--hime {
      width: 75px;
      margin-top: 2px;
    }
  }
}
.form--source > .el-form-item > .el-form-item__label {
  font-size: var(--el-font-size-extra-large);
  line-height: initial;
}
// 直接将size设为small就行了
// .el-table .el-table__cell {
//   padding: 6px 0;
// }
//element plus的样式里有一个.el-form-item .el-form-item选择器会把margin-bottom设为0，这里覆盖一下
// .el-form-item .source--form .el-form-item {
//   margin-bottom: 18px;
// }
// .el-form--expanded--hime input {
//   width: 80px;
// }
</style>
