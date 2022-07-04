<template>
  <div
    class="menu-item"
    :class="{ active: appStore.activeMenuItem === itemName }"
    @click="appStore.activeMenuItem = itemName"
  >
    <svg-icon :name="'menu-' + svgIconName"></svg-icon>
    <div>
      {{ itemName }}
    </div>
  </div>
</template>

<script setup>
import SvgIcon from "@control/components/SvgIcon.vue";
import { useAppStore } from "@control/store/app";
const props = defineProps({
  itemName: String,
  svgIconName: String,
});
const appStore = useAppStore();
</script>

<style lang="scss">
.menu-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  font-weight: bold;
  font-size: 0.7rem;
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
