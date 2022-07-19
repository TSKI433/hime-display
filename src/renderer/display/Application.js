import { Live2dManager } from "@display/managers/live2d/Live2dManager";
import { MmdManager } from "@display/managers/mmd/MmdManager";
import { VroidManager } from "./managers/vroid/VroidManager";
import { SpineManager } from "./managers/spine/SpineManager";
export class Application {
  constructor() {
    this.init();
  }
  async init() {
    // 来自控制面板的配置项
    this.nodeAPI = window.nodeAPI;
    this.canvas = document.getElementById("display-canvas");
    this.resolution = window.devicePixelRatio;
    this.initControlWindowId();
    this.handleIpcMessages();
    this.config = await this.nodeAPI.ipc.queryConfig();
    this.initStats();
    this.initManagers();
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
    this.managers.Live2D = new Live2dManager(this);
    this.managers.MMD = new MmdManager(this);
    this.managers.VRoid = new VroidManager(this);
    this.managers.Spine = new SpineManager(this);
  }
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
      this.managers.now.loadModel(modelInfo).then((modelControlInfo) => {
        this.nodeAPI.ipc.sendModelControlInfo(
          this.controlWindowId,
          modelControlInfo
        );
      });
    });
  }
  initStats() {
    this.stats = null;
    if (this.config.display["show-fps"]) {
      this.stats = new Stats();
      document.body.appendChild(this.stats.domElement);
    }
  }
}
