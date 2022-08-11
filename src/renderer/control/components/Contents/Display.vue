<template>
  <div class="hime-content">
    <!-- <el-form label-position="top" class="hime-el-form--large-label"> -->
    <hime-title-with-divider>{{ $t("menu.display") }}</hime-title-with-divider>
    <el-scrollbar height="100%">
      <el-form label-width="200px" class="hime-el-form--config">
        <el-form-item label="展示器窗口设置">
          <config-item label="窗口类型">
            <el-radio-group v-model="appStore.config.display['display-mode']">
              <!-- 我感觉这里的element plus给我整懵了，填在label里面的东西其实却是value？ -->
              <el-radio-button label="displayFullScreen">
                全屏透明
              </el-radio-button>
              <el-radio-button label="displayWindowed">
                有框窗口
              </el-radio-button>
            </el-radio-group>
          </config-item>
        </el-form-item>
        <el-form-item label="模型显示设置">
          <config-item label="显示像素比">
            <el-radio-group v-model="appStore.config.display['pixel-ratio']">
              <el-radio-button label="normal"> 普通 </el-radio-button>
              <el-radio-button label="retina"> 视网膜 </el-radio-button>
              <el-radio-button label="system"> 系统配置 </el-radio-button>
            </el-radio-group>
          </config-item>
          <config-item label="显示帧率">
            <el-switch v-model="appStore.config.display['show-fps']" />
          </config-item>
          <config-item label="抗锯齿">
            <el-switch v-model="appStore.config.display['antialias']" />
          </config-item>
        </el-form-item>
        <el-form-item label="透明窗口配置">
          <config-item label="点击穿透">
            <el-radio-group v-model="appStore.config.display['click-through']">
              <el-radio-button label="all"> 所有区域 </el-radio-button>
              <el-radio-button label="transparent"> 透明区域 </el-radio-button>
            </el-radio-group>
          </config-item>
          <config-item label="覆盖于其他窗口上方">
            <el-switch
              v-model="appStore.config.display['keep-display-at-top']"
            />
          </config-item>
          <config-item label="在所有工作区显示">
            <el-switch
              v-model="appStore.config.display['show-in-all-workspaces']"
            />
          </config-item>
        </el-form-item>
        <el-form-item label="有框窗口配置">
          <config-item label="背景颜色">
            <el-color-picker
              v-model="appStore.config.display.background"
              show-alpha
              color-format="hex"
            />
          </config-item>
        </el-form-item>
        <el-form-item label="2D渲染配置">
          <config-item label="宽度">
            <div class="hime-el-slicder--with-label">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['2d-initial-width-range']"
                class="hime-el-slider"
                show-tooltip
                :format-tooltip="(value) => value + '%'"
                range
                :min="0"
                :max="100"
              />
              <span> 100% </span>
            </div>
          </config-item>
          <config-item label="高度">
            <div class="hime-el-slicder--with-label">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['2d-initial-height-range']"
                class="hime-el-slider"
                show-tooltip
                :format-tooltip="(value) => value + '%'"
                range
                :min="0"
                :max="100"
              />
              <span> 100% </span>
            </div>
          </config-item>
          <config-item label="拖拽移动">
            <el-switch v-model="appStore.config.display['2d-draggable']" />
          </config-item>
        </el-form-item>
        <el-form-item label="3D渲染配置">
          <config-item label="轮廓线效果">
            <el-switch v-model="appStore.config.display['3d-outline-effect']" />
          </config-item>
          <config-item label="相机轨道控制">
            <el-switch v-model="appStore.config.display['3d-orbit-controls']" />
          </config-item>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <el-divider class="hime-el-divider" />
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
import ConfigItem from "@control/components/Common/ConfigItem.vue";
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
.hime-el-slider {
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
