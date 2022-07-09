import { defineStore } from "pinia";
const defineAppStore = defineStore("app", {
  state: () => ({
    initialized: false,
    ui: {
      activeMenuItem: "source",
    },
    database: {
      sourcePathList: [],
    },
  }),
});
export const useAppStore = function () {
  const appStore = defineAppStore();
  if (!appStore.initialized) {
    const database = window.nodeAPI.database;
    appStore.database.sourcePathList = database.get("sourcePath");
  }
  return appStore;
};
