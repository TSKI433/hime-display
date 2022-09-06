import { defineStore } from "pinia";
export const useAppStore = defineStore("app", {
  state: () => ({
    // initialized: false,
    ui: {
      activeMenuItem: "model",
    },
    database: {
      // 防止下方的splice爆炸
      // sourcePathInfo: [],
    },
    config: {},
    displayWindowId: -1,
    // 上方的原始值无法直接进行监听，此属性用于响应式监听展示器状态
    displayWindowOpened: {
      value: false,
    },
  }),
  actions: {
    syncDatabase() {
      // database直接赋值会失去响应性，如果watch监视了这里的this.database.sourcePathInfo，对this.database直接赋值，watch将直接失效。现在看来pinia对数据的封装应该是等效于reactive的
      // const database = window.nodeAPI.database.value();
      // this.database.sourcePathInfo.splice(0);
      // sourcePathInfo也不能直接赋值，因为到时候是监视sourcePathInfo，反正说来说去就是sourcePathInfo的指向不能变，看到一种方法是在对象下再封装一层数据，但是这样依赖database的结构都变了，因此这里就一点一点的往里面填数据吧
      // database.sourcePathInfo.forEach((source) => {
      //   this.database.sourcePathInfo.push(source);
      // });
      // this.database.model = database.model;
      // this.database.motion3D = database.motion3D;
      // this.database.audio3D = database.audio3D;

      // 好吧目前不用watch了以后，这么搞似乎问题也不大
      this.database = window.nodeAPI.database.value();
    },
    syncConfig() {
      const confingValue = window.nodeAPI.config.value();
      this.config.general = confingValue.general;
      this.config.display = confingValue.display;
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
