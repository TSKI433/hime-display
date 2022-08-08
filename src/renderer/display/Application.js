import { Live2dManager } from "@display/managers/Live2dManager";
import { MmdManager } from "@display/managers/MmdManager";
import { VroidManager } from "@display/managers/VroidManager";
import { SpineManager } from "@display/managers/SpineManager";
export class Application {
  constructor() {
    this.init();
  }
  async init() {
    this.nodeAPI = window.nodeAPI;
    // 来自控制面板的配置项
    const configData = await this.nodeAPI.ipc.queryConfig();
    this.config = configData.config;
    this.windowName = configData.windowName;
    this.canvas = document.getElementById("display-canvas");
    const pixelRatioConfig = this.config.display["pixel-ratio"];
    this.resolution =
      pixelRatioConfig === "system"
        ? window.devicePixelRatio
        : pixelRatioConfig === "retina"
        ? 2
        : 1;
    this.antialias = this.config.display["antialias"];
    this.initControlWindowId();
    this.handleIpcMessages();
    this.setBackgroundColor();
    this.initStats();
    this.initManagers();
    this.handleWindowResize();
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
      // 通过managers.now切换的一大优势就是，事件监听无需手动切换
      if (this.managers.now?.modelType !== modelInfo.modelType) {
        this.managers.now?.switchOut();
        this.managers.now = this.managers[modelInfo.modelType];
        this.managers.now.switchIn();
        this.managers.now.onSendToModelControl((message) => {
          this.nodeAPI.ipc.sendToModelControl(this.controlWindowId, message);
        });
      }
      this.managers.now.loadModel(modelInfo).then((modelControlInfo) => {
        this.nodeAPI.ipc.sendModelControlInfo(
          this.controlWindowId,
          modelControlInfo
        );
      });
    });
    this.nodeAPI.ipc.handleSendToModelManager((event, message) => {
      console.log(
        `[Hime Display] Receive message from control: ${message.channel}, data:`,
        message.data
      );
      this.managers.now.handleMessage(message);
    });
  }
  setBackgroundColor() {
    // 在全屏状态下设定背景颜色要出大问题啊
    if (this.windowName === "displayWindowed") {
      document.body.style.background = this.config.display["background"];
    }
  }
  initStats() {
    this.stats = null;
    if (this.config.display["show-fps"]) {
      this.stats = new Stats();
      document.body.appendChild(this.stats.domElement);
    }
  }
  handleWindowResize() {
    window.addEventListener("resize", () => {
      if (this.managers.now !== null) {
        this.managers.now.onWindowResize();
      }
    });
  }
}
