<template>
  <el-aside>
    <div class="menu">
      <hime-menu-item
        v-for="menuItem in menuItems"
        :item-name="$t('menu.' + menuItem)"
        :svg-icon-name="menuItem"
      ></hime-menu-item>
    </div>
  </el-aside>
</template>

<script setup>
import HimeMenuItem from "./MenuItem.vue";
const menuItems = ["general", "display", "control", "model", "source", "about"];
</script>

<style lang="scss">
.el-aside {
  width: 72px;
  padding: 40px 8px;
}
</style>
