import { defineStore } from "pinia";
export const useAppStore = defineStore("app", {
  state: () => ({
    // initialized: false,
    ui: {
      activeMenuItem: "source",
    },
    database: {},
    config: {},
    displayWindowId: -1,
  }),
  actions: {
    syncDatabase() {
      this.database = window.nodeAPI.database.value();
    },
    syncConfig() {
      this.config = window.nodeAPI.config.value();
    },
  },
});
// export const useAppStore = function () {
//   const appStore = defineAppStore();
//   if (!appStore.initialized) {
//     appStore.initialized = true;
//     appStore.syncDatabase();
//   }
//   return appStore;
// };
