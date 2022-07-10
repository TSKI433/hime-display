import { defineStore } from "pinia";
const defineAppStore = defineStore("app", {
  state: () => ({
    initialized: false,
    ui: {
      activeMenuItem: "source",
    },
    database: {
      sourcePathInfo: [],
      model: [],
      motion3D: [],
      audio3D: [],
    },
  }),
  actions: {
    syncDatabase() {
      const database = window.nodeAPI.database;
      this.database.sourcePathInfo = database.get("sourcePathInfo");
      this.database.model = database.get("model");
      this.database.motion3D = database.get("motion3D");
      this.database.audio3D = database.get("audio3D");
    },
  },
});
export const useAppStore = function () {
  const appStore = defineAppStore();
  if (!appStore.initialized) {
    appStore.initialized = true;
    appStore.syncDatabase();
  }
  return appStore;
};
