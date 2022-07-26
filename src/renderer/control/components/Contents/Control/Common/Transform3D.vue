<template>
  <el-form class="el-form--config--hime" label-position="top" :inline="true">
    <el-form-item label="位置">
      <config-item :label="i" v-for="i in xyz">
        <el-input-number
          size="small"
          :precision="2"
          v-model="transformObject.position[i]"
          @input="$emit('input')"
        ></el-input-number>
      </config-item>
    </el-form-item>
    <el-form-item label="欧拉角">
      <config-item :label="i" v-for="i in xyz">
        <el-input-number
          size="small"
          :precision="2"
          v-model="transformObject.rotation[i]"
          @input="$emit('input')"
        ></el-input-number>
      </config-item>
    </el-form-item>
    <el-form-item label="缩放">
      <config-item :label="i" v-for="i in xyz">
        <el-input-number
          size="small"
          :precision="2"
          v-model="transformObject.scale[i]"
          @input="$emit('input')"
        ></el-input-number>
      </config-item>
    </el-form-item>
    <div>四元数（不存在的……不会真有哪个神仙打算手动用四元数控制旋转吧）</div>
  </el-form>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
// 由于VRoid和MMD的模型大小不在一个量级上，且VRoid模型更改大小会导致模型的物理模拟炸毛，这里根据实际情况改变位置设定步长
const xyz = ["x", "y", "z"];
const props = defineProps({
  positionStep: Number,
  transformObject: Object,
});
</script>

<style lang="scss"></style>
