<template>
  <div class="content--hime el-form--config--hime">
    <!-- <el-form label-position="top" class="el-form--large-label--hime"> -->
    <hime-title-with-divider>{{ $t("menu.display") }}</hime-title-with-divider>
    <el-scrollbar height="100%">
      <el-form label-width="200px" class="el-form--config--hime">
        <el-form-item label="展示器窗口设置">
          <sub-config-item label="窗口类型">
            <el-radio-group v-model="appStore.config.display['display-mode']">
              <!-- 我感觉这里的element plus给我整懵了，填在label里面的东西其实却是value？ -->
              <el-radio-button label="displayFullScreen">
                全屏透明
              </el-radio-button>
              <el-radio-button label="displayWindowed">
                有框窗口
              </el-radio-button>
            </el-radio-group>
          </sub-config-item>
          <sub-config-item label="覆盖于其他窗口上方">
            <el-switch
              v-model="appStore.config.display['keep-display-at-top']"
            />
          </sub-config-item>
          <sub-config-item label="在所有工作区显示">
            <el-switch
              v-model="appStore.config.display['show-in-all-workspaces']"
            />
          </sub-config-item>
        </el-form-item>
        <el-form-item label="显示设置">
          <sub-config-item label="显示像素比">
            <el-radio-group v-model="appStore.config.display['pixel-ratio']">
              <el-radio-button label="normal"> 普通 </el-radio-button>
              <el-radio-button label="retina"> 视网膜 </el-radio-button>
              <el-radio-button label="system"> 系统配置 </el-radio-button>
            </el-radio-group>
          </sub-config-item>
          <sub-config-item label="显示帧率">
            <el-switch v-model="appStore.config.display['show-fps']" />
          </sub-config-item>
          <sub-config-item label="抗锯齿">
            <el-switch v-model="appStore.config.display['antialias']" />
          </sub-config-item>
          <sub-config-item label="模型视线跟踪鼠标">
            <el-switch v-model="appStore.config.display['model-mouse-track']" />
          </sub-config-item>
          <sub-config-item label="背景颜色">
            <el-color-picker
              v-model="appStore.config.display.background"
              show-alpha
              color-format="hex"
            />
          </sub-config-item>
        </el-form-item>
        <el-form-item label="2D默认屏幕模型范围">
          <sub-config-item label="宽度">
            <div class="el-slicder--with-label--hime">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['2d-initial-width-range']"
                class="el-slider--hime"
                show-tooltip
                :format-tooltip="(value) => value + '%'"
                range
                :min="0"
                :max="100"
              />
              <span> 100% </span>
            </div>
          </sub-config-item>
          <sub-config-item label="高度">
            <div class="el-slicder--with-label--hime">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['2d-initial-height-range']"
                class="el-slider--hime"
                show-tooltip
                :format-tooltip="(value) => value + '%'"
                range
                :min="0"
                :max="100"
              />
              <span> 100% </span>
            </div>
          </sub-config-item>
        </el-form-item>
        <el-form-item label="3D渲染配置">
          <sub-config-item label="相机类型">
            <el-radio-group v-model="appStore.config.display['3d-camera-type']">
              <el-radio-button label="perspective">透视相机</el-radio-button>
              <el-radio-button label="orthographic">正交相机</el-radio-button>
            </el-radio-group>
          </sub-config-item>
          <sub-config-item label="物理模拟">
            <el-switch
              v-model="appStore.config.display['3d-physics-simulation']"
            />
          </sub-config-item>

          <sub-config-item label="环境光">
            <el-switch v-model="appStore.config.display['3d-ambient-light']" />
          </sub-config-item>
          <sub-config-item label="平行光">
            <el-switch v-model="appStore.config.display['3d-direct-light']" />
          </sub-config-item>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <el-divider class="el-divider--hime" />
    <div class="display-option">
      <div class="display-option__state">
        <span>展示器状态</span>
        <el-tag
          effect="light"
          :type="appStore.displayWindowId === -1 ? 'warning' : ''"
        >
          {{ appStore.displayWindowId !== -1 ? "已启动" : "未启动" }}
        </el-tag>
      </div>
      <div class="display-option__control">
        <el-button @click="launchDisplayWindow" plain>{{
          appStore.displayWindowId !== -1 ? "重载" : "启动"
        }}</el-button>
        <el-button
          @click="closeDisplayWindow"
          type="danger"
          :disabled="appStore.displayWindowId === -1"
          plain
          >关闭</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import SubConfigItem from "@control/components/Common/SubConfigItem.vue";
import { watch, toRaw } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
watch(appStore.config.display, (newValue) => {
  window.nodeAPI.config.write("display", toRaw(newValue));
});
function launchDisplayWindow() {
  if (appStore.displayWindowId !== -1) {
    ipcAPI.relaunchDisplayWindow();
  } else {
    ipcAPI.launchDisplayWindow();
  }
}
function closeDisplayWindow() {
  ipcAPI.closeDisplayWindow();
}
</script>

<style lang="scss">
.el-slider--hime {
  width: 80%;
  margin-left: 12px;
  margin-right: 12px;
}
.display-option {
  display: flex;
  margin: 0 20px;
  // height: 30px;
  .display-option__state {
    display: flex;
    flex: 1;
    align-items: center;
    > span:nth-child(1) {
      margin-right: 10px;
      font-size: var(--el-font-size-large);
      font-weight: bold;
    }
  }
}
// 弃用布局方案
// .display-option {
//   position: relative;
//   margin: 0 20px;
//   // height: 30px;
//   .display-option__state {
//     display: flex;
//     > span:nth-child(1) {
//       margin-right: 10px;
//       font-size: var(--el-font-size-large);
//       font-weight: bold;
//     }
//   }
//   .display-option__control {
//     position: absolute;
//     right: 0;
//     top: 0;
//   }
// }
</style>
