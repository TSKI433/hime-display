<template>
  <div class="menu-item">
    <svg-icon :name="'menu-' + svgIconName"></svg-icon>
    {{ itemName }}
  </div>
</template>

<script setup>
import SvgIcon from "@control/components/SvgIcon.vue";
const props = defineProps({
  itemName: String,
  svgIconName: String,
});
</script>

<style lang="scss">
.menu-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  font-weight: bold;
  font-size: small;
  color: $menu-color;
  margin-bottom: 18px;
  svg {
    width: 32px;
    height: 32px;
    use {
      fill: $menu-color;
    }
  }
}
</style>
