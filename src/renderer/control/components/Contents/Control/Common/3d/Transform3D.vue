<template>
  <!-- 遇到一个坑，如果template下级有多个元素的话，下方的input事件就会无法正确向上传递 -->
  <div class="hime-transform--3d">
    <config-item
      label="位置"
      label-position="top"
      class="hime-transform--3d__item"
    >
      <!-- 多层组件嵌套导致input事件无法从底层的el-input-number向上传递，因此需要在上级组件再次设定事件传递， -->
      <config-item :label="i" v-for="i in xyz">
        <el-input-number
          :precision="2"
          v-model="transformObject.position[i]"
          @input="$emit('input')"
          :disabled="disabled"
        ></el-input-number>
      </config-item>
    </config-item>
    <config-item
      label="欧拉旋转"
      label-position="top"
      class="hime-transform--3d__item"
    >
      <config-item :label="i" v-for="i in xyz">
        <el-input-number
          :precision="2"
          v-model="transformObject.rotation[i]"
          @input="$emit('input')"
          :disabled="disabled"
        ></el-input-number>
      </config-item>
    </config-item>
    <config-item
      label="缩放"
      label-position="top"
      class="hime-transform--3d__item"
    >
      <config-item :label="i" v-for="i in xyz">
        <el-input-number
          :precision="2"
          v-model="transformObject.scale[i]"
          @input="$emit('input')"
          :disabled="disabled"
        ></el-input-number>
      </config-item>
    </config-item>
  </div>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
// 由于VRoid和MMD的模型大小不在一个量级上，且VRoid模型更改大小会导致模型的物理模拟炸毛，这里根据实际情况改变位置设定步长
const xyz = ["x", "y", "z"];
const props = defineProps({
  positionStep: Number,
  transformObject: Object,
  disabled: Boolean,
});
</script>

<style lang="scss">
.hime-transform--3d {
  display: flex;
  .hime-transform--3d__item {
    margin-right: 20px;
    margin-top: 12px;
  }
}
</style>
