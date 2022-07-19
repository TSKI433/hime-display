// 对模型进行控制的Store
import { defineStore } from "pinia";
export const useControlStore = defineStore("control", {
  state: () => ({
    currentModelType: "",
    modelControlInfoLoading: false,
    modelControlInfo: null,
  }),
});
