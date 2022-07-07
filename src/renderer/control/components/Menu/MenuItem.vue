<template>
  <div
    class="menu-item"
    :class="{ active: appStore.activeMenuItem === svgIconName }"
    @click="appStore.activeMenuItem = svgIconName"
  >
    <svg-icon :name="svgIconName"></svg-icon>
    <div :style="{ 'font-size': itemNameFontSize }">
      {{ itemName }}
    </div>
  </div>
</template>

<script setup>
import SvgIcon from "@control/components/Common/SvgIcon.vue";
import { useAppStore } from "@control/store/app";
// 日语的菜单有部分片假名过长导致折行，本想采用计算是否换行以对字体进行缩小，但是这东西意外的难以获取，所以暂时改为直接判断文本内容的方式吧
// import { ref, onMounted } from "vue";
// const itemNameRef = ref();
// onMounted(() => {
//   console.log(itemNameRef.value.scrollHeight);
// });
import { computed } from "vue";
const props = defineProps({
  itemName: String,
  svgIconName: String,
});
const itemNameFontSize = computed(() => {
  if (["デイスプレー", "コントロール"].includes(props.itemName)) {
    return "0.5rem";
  }
  return "0.7rem";
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
    color: $menu-color;
    user-select: none;
  }
  svg {
    width: 24px;
    height: 24px;
    margin-bottom: 3px;
    use {
      fill: $menu-color;
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
