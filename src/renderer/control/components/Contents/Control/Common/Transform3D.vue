<template>
  <el-form class="el-form--config--hime" label-position="top" :inline="true">
    <el-form-item label="位置">
      <sub-config-item label="x">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
      <sub-config-item label="y">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
      <sub-config-item label="z">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
    </el-form-item>
    <el-form-item label="欧拉角">
      <sub-config-item label="x">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
      <sub-config-item label="y">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
      <sub-config-item label="z">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
    </el-form-item>
    <el-form-item label="缩放">
      <sub-config-item label="x">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
      <sub-config-item label="y">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
      <sub-config-item label="z">
        <el-input-number size="small"></el-input-number>
      </sub-config-item>
    </el-form-item>
    <div>四元数（不存在的……不会真有哪个神仙打算手动用四元数控制旋转吧）</div>
  </el-form>
</template>

<script setup>
import SubConfigItem from "@control/components/Common/SubConfigItem.vue";
// 由于VRoid和MMD的模型大小不在一个量级上，且VRoid模型更改大小会导致模型的物理模拟炸毛，这里根据实际情况改变位置设定步长
const props = defineProps({
  positionStep: Number,
});
</script>

<style lang="scss"></style>
