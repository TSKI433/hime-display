<template>
  <div class="hime-content">
    <!-- <el-form label-position="top" class="hime-el-form--large-label"> -->
    <hime-title-with-divider>{{ $t("menu.display") }}</hime-title-with-divider>
    <el-scrollbar height="100%">
      <el-form label-width="170px" class="hime-el-form--config">
        <el-form-item :label="$t('display.window')">
          <config-item :label="$t('display.window-type')">
            <!-- 由于日语片假名实在太长了，不得不妥协一下换个组件…… -->
            <!-- <el-radio-group v-model="appStore.config.display['display-mode']">
                <el-radio-button label="displayFullScreen">
                {{ $t("display.fullscreen") }}
              </el-radio-button>
              <el-radio-button label="displayWindowed">
                {{ $t("display.windowed") }}
              </el-radio-button>
            </el-radio-group> -->
            <el-select v-model="appStore.config.display['display-mode']">
              <!-- 我感觉这里的element plus给我整懵了，填在label里面的东西其实却是value？ -->
              <el-option
                :label="$t('display.fullscreen')"
                value="displayFullScreen"
              />
              <el-option
                :label="$t('display.windowed')"
                value="displayWindowed"
              />
            </el-select>
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('display.show')">
          <config-item :label="$t('display.pixel-ratio')">
            <!-- <el-radio-group v-model="appStore.config.display['pixel-ratio']">
              <el-radio-button label="normal"> Normal </el-radio-button>
              <el-radio-button label="retina"> Retina </el-radio-button>
              <el-radio-button label="system"> Auto </el-radio-button>
            </el-radio-group> -->
            <el-select v-model="appStore.config.display['pixel-ratio']">
              <el-option label="Normal" value="normal" />
              <el-option label="Retina" value="retina" />
              <el-option label="System" value="system" />
            </el-select>
          </config-item>
          <config-item :label="$t('display.show-fps')">
            <el-switch v-model="appStore.config.display['show-fps']" />
          </config-item>
          <config-item :label="$t('display.antialias')">
            <el-switch v-model="appStore.config.display['antialias']" />
          </config-item>
          <config-item :label="$t('display.auto-load-last')">
            <el-switch v-model="appStore.config.display['auto-load-last']" />
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('display.transparent-display')">
          <config-item :label="$t('display.click-through')">
            <!-- <el-radio-group v-model="appStore.config.display['click-through']">
              <el-radio-button label="all">
                {{ $t("display.all-area") }}
              </el-radio-button>
              <el-radio-button label="transparent">
                {{ $t("display.transparent-area") }}
              </el-radio-button>
            </el-radio-group> -->
            <el-select v-model="appStore.config.display['click-through']">
              <el-option :label="$t('display.all-area')" value="all" />
              <el-option
                :label="$t('display.transparent-area')"
                value="transparent"
              />
            </el-select>
          </config-item>
          <config-item :label="$t('display.show-area') + '(macOS)'">
            <!-- <el-radio-group v-model="appStore.config.display['display-range']">
              <el-radio-button label="singleDesktop">
                {{ $t("display.single-desktop") }}
              </el-radio-button>
              <el-radio-button label="allDesktops">
                {{ $t("display.all-desktops") }}
              </el-radio-button>
              <el-radio-button label="allWorkspaces">
                {{ $t("display.all-workspaces") }}
              </el-radio-button>
            </el-radio-group> -->
            <el-select v-model="appStore.config.display['display-range']">
              <!-- 我感觉这里的element plus给我整懵了，填在label里面的东西其实却是value？ -->
              <el-option
                :label="$t('display.single-desktop')"
                value="singleDesktop"
              />
              <el-option
                :label="$t('display.all-desktops')"
                value="allDesktops"
              />
              <el-option
                :label="$t('display.all-workspaces')"
                value="allWorkspaces"
              />
            </el-select>
          </config-item>
          <config-item :label="$t('display.always-on-top')">
            <el-switch
              v-model="appStore.config.display['keep-display-at-top']"
            />
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('display.windowed-display')">
          <config-item :label="$t('display.background-color')">
            <el-color-picker
              v-model="appStore.config.display.background"
              color-format="hex"
            />
          </config-item>
        </el-form-item>
        <!-- 虽然3D和2D分别有很多共有的配置，但实际使用时发现不同模型类型的最佳默认值存在较大差异，例如2D的显示范围，一般来讲spine模型更加小巧，而VRoid的默认轮廓线效果也很爆炸，因此这里都改成了独立的设置 -->
        <el-form-item :label="$t('display.live2d-render')">
          <config-item :label="$t('display.width-range')">
            <div class="hime-el-slicder--with-label">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['live2d-initial-width-range']"
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
          <config-item :label="$t('display.height-range')">
            <div class="hime-el-slicder--with-label">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['live2d-initial-height-range']"
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
          <config-item :label="$t('display.drag-to-move')">
            <el-switch v-model="appStore.config.display['live2d-draggable']" />
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('display.spine-render')">
          <config-item :label="$t('display.width-range')">
            <div class="hime-el-slicder--with-label">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['spine-initial-width-range']"
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
          <config-item :label="$t('display.height-range')">
            <div class="hime-el-slicder--with-label">
              <span> 0% </span>
              <el-slider
                v-model="appStore.config.display['spine-initial-height-range']"
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
          <config-item :label="$t('display.drag-to-move')">
            <el-switch v-model="appStore.config.display['spine-draggable']" />
          </config-item>
          <config-item :label="$t('display.premultiply-alpha')">
            <el-switch
              v-model="appStore.config.display['spine-premultiply-alpha']"
            />
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('display.mmd-render')">
          <config-item :label="$t('display.outline-effect')">
            <el-switch
              v-model="appStore.config.display['mmd-outline-effect']"
            />
          </config-item>
          <config-item :label="$t('display.camera-orbit-control')">
            <el-switch
              v-model="appStore.config.display['mmd-orbit-controls']"
            />
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('display.vroid-render')">
          <config-item :label="$t('display.outline-effect')">
            <el-switch
              v-model="appStore.config.display['vroid-outline-effect']"
            />
          </config-item>
          <config-item :label="$t('display.camera-orbit-control')">
            <el-switch
              v-model="appStore.config.display['vroid-orbit-controls']"
            />
          </config-item>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <el-divider class="hime-el-divider" />
    <div class="display-option">
      <div class="display-option__state">
        <span>{{ $t("display.display-window-state") }}</span>
        <el-tag
          effect="light"
          :type="appStore.displayWindowId === -1 ? 'warning' : 'primary'"
        >
          {{
            appStore.displayWindowId !== -1
              ? $t("display.launched")
              : $t("display.not-launched")
          }}
        </el-tag>
      </div>
      <div class="display-option__control">
        <el-button
          @click="ipcAPI.screenshot"
          :disabled="appStore.displayWindowId === -1"
          plain
        >
          截图
        </el-button>
        <el-button @click="launchDisplayWindow" plain>{{
          appStore.displayWindowId !== -1
            ? $t("display.reload")
            : $t("display.launch")
        }}</el-button>
        <el-button
          @click="closeDisplayWindow"
          type="danger"
          :disabled="appStore.displayWindowId === -1"
          plain
          >{{ $t("display.close") }}</el-button
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
