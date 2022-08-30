<template>
  <div
    class="menu-item"
    :class="{ active: appStore.ui.activeMenuItem === menuItem }"
    @click="appStore.ui.activeMenuItem = menuItem"
  >
    <svg-icon :name="'sf-' + menuItem"></svg-icon>
    <div :style="{ 'font-size': itemNameFontSize }">
      {{ $t("menu." + menuItem) }}
    </div>
  </div>
</template>

<script setup>
import SvgIcon from "@control/components/Common/SvgIcon.vue";
import { useAppStore } from "@control/store/app";
import { useTranslation } from "i18next-vue";
const { i18next } = useTranslation();
// 日语的菜单有部分片假名过长导致折行，本想采用计算是否换行以对字体进行缩小，但是这东西意外的难以获取，所以暂时改为直接判断文本内容的方式吧
// import { ref, onMounted } from "vue";
// const itemNameRef = ref();
// onMounted(() => {
//   console.log(itemNameRef.value.scrollHeight);
// });
import { computed } from "vue";
const props = defineProps({
  menuItem: String,
});
const itemNameFontSize = computed(() => {
  if (
    ["ディスプレイ", "コントロール"].includes(
      i18next.t("menu." + props.menuItem)
    )
  ) {
    return "0.6rem";
  }
  return "0.85rem";
});
const appStore = useAppStore();
</script>

<style lang="scss">
.menu-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  font-weight: bold;
  // font-size: 0.7rem;兼容日语，已改为动态判断
  border-radius: 10px;
  padding: 8px 0;
  div {
    color: var(--el-text-color-regular);
  }
  svg {
    width: 24px;
    height: 24px;
    margin-bottom: 3px;
    use {
      fill: var(--el-text-color-regular);
    }
  }
}
.menu-item.active {
  div {
    color: var(--el-color-primary);
  }
  svg {
    use {
      fill: var(--el-color-primary);
    }
  }
  background-color: $menu-background-color-active;
}
</style>
