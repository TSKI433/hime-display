<template>
  <config-item label="Parameter" label-position="top">
    <!-- 添加参数保存开关 -->
    <config-item label="参数保存设置">
      <el-switch v-model="paramSaveEnabled" @change="onParamSaveChange" />
      <el-button
        size="small"
        type="primary"
        :disabled="!paramSaveEnabled"
        @click="showParamSelector = true"
        style="margin-left: 10px"
      >
        选择参数
      </el-button>
    </config-item>

    <!-- 参数选择对话框 -->
    <el-dialog
      title="选择要保存的参数"
      v-model="showParamSelector"
      width="500px"
    >
      <el-checkbox-group v-model="selectedParams">
        <el-checkbox
          v-for="paramId in parameterInfo._parameterIds"
          :key="paramId"
          :label="paramId"
        >
          {{ paramId }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="showParamSelector = false">取消</el-button>
        <el-button type="primary" @click="saveParamSelection">确定</el-button>
      </template>
    </el-dialog>

    <config-item :label="$t('control.parameter.target-select')">
      <el-select
        v-model="selectedParameterId"
        @change="bindParameterId"
        filterable
      >
        <el-option
          v-for="parameterId in parameterInfo._parameterIds"
          :label="parameterId"
          :value="parameterId"
        />
      </el-select>
    </config-item>
    <config-item
      :label="$t('control.parameter.parameter-control')"
      style="width: 100%"
    >
      <el-slider
        v-model="parameterValue"
        :min="parameterInfo._parameterMinimumValues[selectedParameterIndex]"
        :max="parameterInfo._parameterMaximumValues[selectedParameterIndex]"
        :step="0.1"
        style="width: 60%; margin-left: 10px"
        :disabled="selectedParameterId === ''"
        @change="onSliderChange"
      />
    </config-item>
  </config-item>
  <el-divider style="margin: 12px 0" />
  <config-item
    :label="$t('control.parameter.part-opacity')"
    label-position="top"
  >
    <config-item :label="$t('control.parameter.target-select')">
      <el-select v-model="selectedPartId" @change="bindPartId" filterable>
        <el-option v-for="partId in partInfo" :label="partId" :value="partId" />
      </el-select>
    </config-item>
    <config-item
      :label="$t('control.parameter.parameter-control')"
      style="width: 100%"
    >
      <el-slider
        v-model="partOpacity"
        :min="0"
        :max="1"
        :step="0.05"
        style="width: 60%; margin-left: 10px"
        :disabled="selectedPartId === ''"
        @input="setPartOpacity"
      />
    </config-item>
  </config-item>
  <el-divider style="margin: 12px 0" />
  <config-item :label="$t('control.parameter.mouse-focus')">
    <el-switch v-model="trackMouse.value" />
  </config-item>
  <config-item :label="$t('control.parameter.auto-breath')">
    <el-switch v-model="autoBreath.value" />
  </config-item>
  <config-item :label="$t('control.parameter.auto-eye-blink')">
    <el-switch v-model="autoEyeBlink.value" />
  </config-item>
</template>

<script setup>
import ConfigItem from "@control/components/Common/ConfigItem.vue";
import { computed, ref, watch, reactive, toRaw, onMounted } from "vue";
import { useAppStore } from "@control/store/app";
const appStore = useAppStore();
const ipcAPI = window.nodeAPI.ipc;
const props = defineProps({
  parameterInfo: Object,
  partInfo: Object,
});

// 参数保存相关
const paramSaveEnabled = ref(true);
const showParamSelector = ref(false);
const selectedParams = ref([]);

// 加载已保存的配置
onMounted(async () => {
  try {
    const config = await ipcAPI.loadParamSaveConfig?.();
    if (config) {
      paramSaveEnabled.value = config.enabled ?? true;
      selectedParams.value = config.selectedParams ?? [];
    }
  } catch (error) {
    console.warn("加载参数保存配置失败:", error);
  }
});

function onParamSaveChange() {
  saveParamSelection();
}

function saveParamSelection() {
  // 确保 selectedParams 是普通数组，不包含特殊对象
  const paramsToSave = selectedParams.value.map(id => String(id));
  
  // 保存到主进程
  ipcAPI.saveParamSaveConfig({
    enabled: paramSaveEnabled.value,
    selectedParams: paramsToSave,
  });
  
  // 立即通知展示器更新保存的参数列表
  ipcAPI.sendToModelManager({
    channel: "control:update-param-selection",
    data: {
      enabled: paramSaveEnabled.value,
      selectedParams: paramsToSave
    }
  });
  
  showParamSelector.value = false;
}

// 原有代码保持不变
const selectedParameterId = ref("");
const parameterValue = ref(0);
const selectedParameterIndex = computed(() => {
  return props.parameterInfo._parameterIds.indexOf(selectedParameterId.value);
});

function bindParameterId() {
  if (selectedParameterId.value === "") return;
  ipcAPI.sendToModelManager({
    channel: "control:bind-parameter",
    data: {
      parameterId: selectedParameterId.value,
    },
  });
}

function setParameterValue() {
  ipcAPI.sendToModelManager({
    channel: "control:set-parameter",
    data: {
      parameterId: selectedParameterId.value,
      value: parameterValue.value,
    },
  });
}

watch(parameterValue, setParameterValue);

const selectedPartId = ref("");
const partOpacity = ref(0);

function bindPartId() {
  if (selectedPartId.value === "") return;
  ipcAPI.sendToModelManager({
    channel: "control:bind-part",
    data: {
      partId: selectedPartId.value,
    },
  });
}

function setPartOpacity() {
  ipcAPI.sendToModelManager({
    channel: "control:set-part",
    data: {
      partId: selectedPartId.value,
      value: partOpacity.value,
    },
  });
}

watch(partOpacity, setPartOpacity);

ipcAPI.handleSendToModelControl((event, message) => {
  switch (message.channel) {
    case "manager:update-parameter": {
      parameterValue.value = message.data.value;
      break;
    }
    case "manager:update-part": {
      partOpacity.value = message.data.value;
    }
  }
});

const trackMouse = reactive({
  name: "trackMouse",
  value: true,
});

watch(trackMouse, () => {
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(trackMouse),
  });
});

const autoBreath = reactive({
  name: "autoBreath",
  value: true,
});

watch(autoBreath, () => {
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(autoBreath),
  });
});

const autoEyeBlink = reactive({
  name: "autoEyeBlink",
  value: true,
});

watch(autoEyeBlink, () => {
  ipcAPI.sendToModelManager({
    channel: "control:change-instant-config",
    data: toRaw(autoEyeBlink),
  });
});

function onSliderChange(val) {
  setParameterValue();
  ipcAPI.sendToModelManager({
    channel: "control:save-model-config",
    data: { manual: true },
  });
}
</script>

<style lang="scss"></style>
