<template>
  <el-form label-position="top">
    <hime-title-with-divider>{{ $t("menu.source") }}</hime-title-with-divider>
    <el-form-item label="数据源">
      <!-- row-key用于辨识row，解决expend输入内容后自动折叠的问题 -->
      <el-table
        :data="tableData"
        :border="true"
        row-key="path"
        ref="sourceTable"
        class="source-table"
        size="small"
        tooltip-effect="light"
      >
        <!-- 使用width="1"隐藏默认小箭头 -->
        <el-table-column type="expand" width="1">
          <template #default="props">
            <div style="padding: 5px 20px">
              <el-form
                label-position="top"
                class="source-expend-form"
                :inline="true"
              >
                <el-form-item label="来源标签">
                  <el-input
                    placeholder="来源标签"
                    v-model="props.row.tagName"
                    style="width: 75px; margin-top: 2px"
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
        <el-table-column label="路径" prop="path" show-overflow-tooltip />
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
        <el-table-column label="来源标签" prop="tagName" width="130" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="props">
            <el-tooltip :show-after="600" effect="light">
              <template #default>
                <svg-icon-el-button
                  size="small"
                  name="source"
                ></svg-icon-el-button>
              </template>
              <template #content> 在文件浏览器中显示 </template>
            </el-tooltip>
            <el-tooltip :show-after="600" effect="light">
              <template #default>
                <svg-icon-el-button
                  size="small"
                  name="refresh"
                ></svg-icon-el-button>
              </template>
              <template #content> 重新检索 </template>
            </el-tooltip>
            <el-tooltip :show-after="600" effect="light">
              <template #default>
                <svg-icon-el-button
                  size="small"
                  name="edit"
                  @click="expendRow(props.row)"
                ></svg-icon-el-button>
              </template>
              <template #content> 编辑路径信息 </template>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item label="数据信息">
      <el-table> </el-table>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import SvgIconElButton from "@control/components/Common/SvgIconElButton.vue";
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
const sourceTypes = ["live2d", "spine", "vrm", "mmd", "motion3D", "audio3D"];
const sourceTable = ref();
function expendRow(row) {
  sourceTable.value.toggleRowExpansion(row);
  // 这不是script setup里的用法
  // console.log(this.$refs);
  // this.$refs.sourceTable.toggleRowExpansion(row);
}
const tableData = reactive([
  {
    path: "Lorem ipsum dolor sit amet.",
    tagName: "vrm",
    sourceTypes: {
      live2d: false,
      spine: false,
      mmd: false,
      vrm: false,
      motion3D: false,
      audio3D: false,
    },
  },
  {
    path: "Lorem ipsum dolor sit amet consectetur adipisicing.",
    tagName: "mmd",
    sourceTypes: {
      live2d: false,
      spine: false,
      mmd: false,
      vrm: false,
      motion3D: false,
      audio3D: false,
    },
  },
]);
</script>

<style lang="scss">
// .el-table .el-table__cell {
//   padding: 6px 0;
// }
.el-table th.el-table__cell {
  background-color: rgba(0, 0, 0, 0);
}
//element plus的样式里有一个.el-form-item .el-form-item选择器会把margin-bottom设为0，这里覆盖一下
// .el-form-item .source-expend-form .el-form-item {
//   margin-bottom: 18px;
// }
// 配合上方的width="1"使用，可以隐藏默认的小箭头
.source-table .el-table__expand-icon {
  color: transparent;
}
// .source-expend-form input {
//   width: 80px;
// }
// .el-form--default.el-form--label-top .el-form-item .el-form-item__label {
//   font-size: var(--el-font-size-extra-large);
//   line-height: initial;
// }
</style>
