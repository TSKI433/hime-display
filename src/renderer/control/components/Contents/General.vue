<template>
  <div class="content--hime">
    <hime-title-with-divider>{{ $t("menu.general") }}</hime-title-with-divider>
    <el-form label-width="200px">
      <el-scrollbar height="100%">
        <el-form label-width="200px" class="el-form--config--hime">
          <el-form-item label="启动应用配置">
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
        </el-form>
      </el-scrollbar>
    </el-form>
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
</script>

<style lang="scss"></style>
