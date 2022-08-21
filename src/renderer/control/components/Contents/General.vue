<template>
  <div class="hime-content">
    <hime-title-with-divider>{{ $t("menu.general") }}</hime-title-with-divider>
    <el-scrollbar height="100%">
      <el-form label-width="170px" class="hime-el-form--config">
        <el-form-item label="启动应用">
          <config-item label="打开控制面板">
            <el-switch
              v-model="appStore.config.general['open-control-at-launch']"
            />
          </config-item>
          <config-item label="打开展示器">
            <el-switch
              v-model="appStore.config.general['open-display-at-launch']"
            />
          </config-item>
        </el-form-item>
        <el-form-item label="语言">
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
        <el-form-item label="开发者工具">
          <!-- 配置项的样式被调整过了，这里懒得拉样式，整个div框起来算了 -->
          <div>
            <el-button
              @click="openDevTool('display')"
              :disabled="appStore.displayWindowId === -1"
              >展示器</el-button
            >
            <el-button @click="openDevTool('control')">控制器</el-button>
          </div>
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
const { i18next } = useTranslation();
const appStore = useAppStore();
watch(appStore.config.general, (newValue) => {
  window.nodeAPI.config.write("general", toRaw(newValue));
});
function changeLanguage(language) {
  i18next.changeLanguage(language);
}
function openDevTool(type) {
  window.nodeAPI.ipc.openDevTool(type);
}
</script>

<style lang="scss"></style>
