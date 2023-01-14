<template>
  <div class="hime-content">
    <hime-title-with-divider>{{ $t("menu.general") }}</hime-title-with-divider>
    <el-scrollbar height="100%">
      <el-form label-width="170px" class="hime-el-form--config">
        <el-form-item :label="$t('general.when-launch')">
          <config-item :label="$t('general.open-control-panel')">
            <el-switch
              v-model="appStore.config.general['open-control-at-launch']"
            />
          </config-item>
          <config-item :label="$t('general.open-display-window')">
            <el-switch
              v-model="appStore.config.general['open-display-at-launch']"
            />
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('general.language')">
          <el-select
            v-model="appStore.config.general.language"
            @change="changeLanguage"
          >
            <el-option
              v-for="(value, label) in languageNames"
              :key="label"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('general.developer-tools')">
          <!-- 配置项的样式被调整过了，这里懒得拉样式，整个div框起来算了 -->
          <div>
            <el-button @click="openDevTool('control')">
              {{ $t("general.control-panel") }}
            </el-button>
            <el-button
              @click="openDevTool('display')"
              :disabled="appStore.displayWindowId === -1"
              >{{ $t("general.display-window") }}</el-button
            >
          </div>
          <config-item label="报错弹窗提示">
            <el-switch v-model="appStore.config.general['error-report']" />
          </config-item>
        </el-form-item>
        <el-form-item :label="$t('general.restore')">
          <el-popconfirm
            :title="$t('general.restore-all-config-confirm')"
            @confirm="resetAllConfig"
          >
            <template #reference>
              <el-button>{{ $t("general.restore-all-config") }}</el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { watch, toRaw } from "vue";
import { useAppStore } from "@control/store/app";
import languageNames from "@shared/locales/languageNames";
import { useTranslation } from "i18next-vue";
const ipcAPI = window.nodeAPI.ipc;
const { i18next } = useTranslation();
const appStore = useAppStore();
watch(appStore.config.general, (newValue) => {
  window.nodeAPI.config.write("general", toRaw(newValue));
});
function changeLanguage(language) {
  ipcAPI.changeLanguage(language);
  i18next.changeLanguage(language);
}
function openDevTool(type) {
  ipcAPI.openDevTool(type);
}
function resetAllConfig() {
  window.nodeAPI.config.resetAllConfig();
  appStore.syncConfig();
  // 手动触发语言更改
  changeLanguage(appStore.config.general.language);
}
</script>

<style lang="scss"></style>
