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
    if (
      this.windowName === "displayFullScreen" &&
      this.config.display["click-through"] === "transparent"
    ) {
      this.rgba = new Uint8Array(4);
      this.ignoreFlag = true;
      this.detectClickThrough();
    }
    this.state = {
      modelLoaded: false,
      // 由于控制面板不会关闭，缓存不会清除，模型的基础信息就不必在这里发过去了
      // modelControlInfo: null,
    };
    this.setBackgroundColor();
    this.initStats();
    this.initManagers();
    this.handleWindowResize();
    // 在发送windowsID之前处理好其他的事情才能实现启动时加载模型
    this.initControlWindowId();
    // 通信处理必须在windowID处理之后再开启
    this.handleIpcMessages();
  }
  initControlWindowId() {
    this.controlWindowId = -1;
    this.nodeAPI.ipc.queryWindowIds().then((windowIds) => {
      console.log("[Hime Display] queryWindowIds:", windowIds);
      this.controlWindowId = windowIds.control;
    });
    // 忘记加event，脑瘫行为！！！坑了我不下五次，合着之前控制器一直都不知道控制面板的id了是吧
    this.nodeAPI.ipc.handleUpdateWindowIds((event, windowIds) => {
      console.log("[Hime Display] handleUpdateWindowIds:", windowIds);
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
          this.nodeAPI.ipc.sendToModelControl(message);
        });
      }
      this.managers.now.loadModel(modelInfo).then((modelControlInfo) => {
        this.state.modelLoaded = true;
        // this.state.modelControlInfo = modelControlInfo;
        this.nodeAPI.ipc.sendModelControlInfo(modelControlInfo);
      });
    });
    this.nodeAPI.ipc.handleSendToModelManager((event, message) => {
      console.log(
        `[Hime Display] Receive message from control: ${message.channel}, data:`,
        message.data
      );
      this.managers.now.handleMessage(message);
    });
    this.nodeAPI.ipc.handleQueryDisplayWindowState(() => {
      this.nodeAPI.ipc.sendDisplayWindowState(this.state);
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
  detectClickThrough() {
    // Windows7获取不到webgl2的上下文，因此获取webgl，如果获取了一种type的上下文，再获取其他上下文会报错，但是获取webgl2失败并不影响
    // 无论是pixi.js还是three.js都会有现获取webgl2的上下文，找不到再切换到webgl，因此我这里的操作即使在启动渲染进程之前操作也不会有问题
    // 但要是在渲染启动之前获取过webgl的上下文，那webgl2就没戏了
    // 我怎么又栽在这个该死的参数preserveDrawingBuffer上了？？？？？？
    // 说实话我感觉这webgl的接口做的是真的阴间，文档找不到多少，也没有谁告诉我抠个像素要把preserveDrawingBuffer设为true啊，（虽然我之前弄过一次了，忘了……）
    // 然后关于获取上下文，相当于是第一次获取时进行一个初始化，之后全是返回第一次获取到的实例，换句话说，如果运行了this.canvas.getContext("webgl2")后再运行this.canvas.getContext("webgl2", { preserveDrawingBuffer: true })的话，这个preserveDrawingBuffer根本就没有被正确配置，而且一点提示都没有
    this.context =
      this.canvas.getContext("webgl2", { preserveDrawingBuffer: true }) ||
      this.canvas.getContext("webgl", { preserveDrawingBuffer: true });
    const detect = (event) => {
      this.context.readPixels(
        event.clientX * this.resolution,
        this.canvas.height - event.clientY * this.resolution, //2d坐标系和3d坐标系的转换，坐标原点由左上角变为屏幕左下角
        1,
        1,
        this.context.RGBA,
        this.context.UNSIGNED_BYTE,
        this.rgba
      );
      if (this.rgba[3] != 0 && this.ignoreFlag == true) {
        console.log("[Hime Display] Click through detected", false);
        this.nodeAPI.ipc.setIgnoreMouseEvents(false);
        this.ignoreFlag = false;
      } else if (this.rgba[3] == 0 && this.ignoreFlag == false) {
        console.log("[Hime Display] Click through detected", true);
        this.nodeAPI.ipc.setIgnoreMouseEvents(true, { forward: true });
        this.ignoreFlag = true;
      }
    };
    // 对比之下，pointermove事件返回的坐标带有小数
    this.canvas.addEventListener("mousemove", detect);
  }
}
