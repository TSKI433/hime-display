// 对模型进行控制的Store
import { defineStore } from "pinia";
export const useControlStore = defineStore("control", {
  state: () => ({
    currentModelType: "",
    modelControlDataLoading: false,
    modelControlData: null,
  }),
});
