import { Live2dManager } from "@display/managers/live2d/Live2dManager";
export class Application {
  constructor() {
    this.init();
  }
  init() {
    // 来自控制面板的配置项
    this.settings = {};
    this.nodeAPI = window.nodeAPI;
    this.canvas = document.getElementById("display-canvas");
    this.initControlWindowId();
    this.initManagers();
    this.handleIpcMessages();
  }
  initControlWindowId() {
    this.controlWindowId = -1;
    this.nodeAPI.ipc.queryWindowIds().then((windowIds) => {
      this.controlWindowId = windowIds.control;
    });
    this.nodeAPI.ipc.handleUpdateWindowIds((windowIds) => {
      this.controlWindowId = windowIds.control;
    });
  }
  initManagers() {
    this.managers = {
      now: null,
    };
    this.managers.live2d = new Live2dManager(this.canvas);
  }
  switchManager() {}
  handleIpcMessages() {
    this.nodeAPI.ipc.handleLoadModel((event, modelInfo) => {
      console.log(
        `[Hime Display] Load model: name:${modelInfo.name}, modelType:${modelInfo.modelType}`
      );
      if (this.managers.now?.modelType !== modelInfo.modelType) {
        this.managers.now?.switchOut();
        this.managers.now = this.managers[modelInfo.modelType];
        this.managers.now.switchIn();
      }
      this.managers.now.loadModel(modelInfo);
    });
  }
}
