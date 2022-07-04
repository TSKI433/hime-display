<template>
  <el-aside>
    <div class="menu">
      <hime-menu-item
        v-for="itemName in menuItems"
        :item-name="itemName"
        :svg-icon-name="itemName"
      ></hime-menu-item>
    </div>
  </el-aside>
</template>

<script setup>
import HimeMenuItem from "./MenuItem.vue";
const menuItems = ["Gernal", "Control", "Model", "Display", "Source", "About"];
</script>

<style lang="scss">
.el-aside {
  width: 72px;
  padding: 40px 8px;
}
</style>
