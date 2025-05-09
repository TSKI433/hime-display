import { Live2dManager } from "@display/modelManagers/Live2dManager";
import { MmdManager } from "@display/modelManagers/MmdManager";
import { VroidManager } from "@display/modelManagers/VroidManager";
import { SpineManager } from "@display/modelManagers/SpineManager";
import { SpineManager42 } from "@display/modelManagers/SpineManager42";
import { RecordManager } from "@display/utils/record/RecordManager";

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
    this.resetCanvas();
    const pixelRatioConfig = this.config.display["pixel-ratio"];
    this.resolution =
      pixelRatioConfig === "system"
        ? window.devicePixelRatio
        : pixelRatioConfig === "retina"
        ? 2
        : 1;
    this.antialias = this.config.display["antialias"];
    this.state = {
      modelLoaded: false,
      // 由于控制面板不会关闭，缓存不会清除，模型的基础信息就不必在这里发过去了
      // modelControlInfo: null,
    };
    this.currentModelInfo = null;
    this.recordManager = new RecordManager(this);
    this.setBackgroundColor();
    this.initStats();
    this.initModelManagers();
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
  initModelManagers() {
    this.modelManagers = {
      now: null,
    };
    this.modelManagers.Live2D = new Live2dManager(this);
    this.modelManagers.MMD = new MmdManager(this);
    this.modelManagers.VRoid = new VroidManager(this);
    this.modelManagers.Spine = new SpineManager(this);
    this.modelManagers.Spine42 = new SpineManager42(this);
  }
  handleIpcMessages() {
    this.nodeAPI.ipc.handleLoadModel((event, modelInfo) => {
      console.log(
        `[Hime Display] Load model: name:${modelInfo.name}, modelType:${modelInfo.modelType}`
      );
      this.currentModelInfo = modelInfo;
      let managerType;
      if (modelInfo.modelType === "Spine") {
        const version = modelInfo.version;
        if (version === undefined) {
          managerType = "Spine";
        } else {
          const versionNumber = version.split(".").slice(0, 2).join(".");
          switch (versionNumber) {
            case "3.7":
            case "3.8":
            case "4.0":
            case "4.1":
              managerType = "Spine";
              break;
            case "4.2":
              managerType = "Spine42";
              break;
            default:
              throw new Error(
                `不支持的Spine版本: ${versionNumber}，请使用3.8或4.2版本的模型`
              );
          }
        }
      } else {
        managerType = modelInfo.modelType;
      }
      // 通过managers.now切换的一大优势就是，事件监听无需手动切换
      if (this.modelManagers.now?.modelType !== managerType) {
        this.modelManagers.now?.switchOut();
        this.resetCanvas();
        this.modelManagers.now = this.modelManagers[managerType];
        this.modelManagers.now.switchIn();
        this.modelManagers.now.onSendToModelControl((message) => {
          this.nodeAPI.ipc.sendToModelControl(message);
        });
      }
      this.modelManagers.now.loadModel(modelInfo).then((modelControlInfo) => {
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
      this.modelManagers.now.handleMessage(message);
    });
    this.nodeAPI.ipc.handleQueryDisplayWindowState(() => {
      this.nodeAPI.ipc.sendDisplayWindowState(this.state);
    });
    this.nodeAPI.ipc.handleScreenshot((event) => {
      console.log("[Hime Display] Screenshot");
      this.recordManager.takeScreenshot();
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
      if (
        this.modelManagers.now !== null &&
        this.modelManagers.now.onWindowResize
      ) {
        this.modelManagers.now.onWindowResize();
      }
    });
  }
  resetCanvas() {
    // 加载spine4.2采用了pixi v8，不知道在destry进行了什么阴间操作，会导致gl上下文报废
    // 此时重新用pixi初始化app的话会报错Invalid value of `0` passed to `checkMaxIfStatementsInShader`
    // three也无法成功初始化
    // 懒得深究原理，直接每次切出时销毁canvas，重新创建一个新的canvas
    this.canvas?.remove();
    this.canvas = document.createElement("canvas");
    this.canvas.id = "display-canvas";
    document.body.insertBefore(this.canvas, document.body.firstChild);
    // Windows7获取不到webgl2的上下文，因此获取webgl，如果获取了一种type的上下文，再获取其他上下文会报错，但是获取webgl2失败并不影响
    // 无论是pixi.js还是three.js都会有现获取webgl2的上下文，找不到再切换到webgl，因此我这里的操作即使在启动渲染进程之前操作也不会有问题
    // 但要是在渲染启动之前获取过webgl的上下文，那webgl2就没戏了
    // 我怎么又栽在这个该死的参数preserveDrawingBuffer上了？？？？？？
    // 说实话我感觉这webgl的接口做的是真的阴间，文档找不到多少，也没有谁告诉我抠个像素要把preserveDrawingBuffer设为true啊，（虽然我之前弄过一次了，忘了……）
    // 然后关于获取上下文，相当于是第一次获取时进行一个初始化，之后全是返回第一次获取到的实例，换句话说，如果运行了this.canvas.getContext("webgl2")后再运行this.canvas.getContext("webgl2", { preserveDrawingBuffer: true })的话，这个preserveDrawingBuffer根本就没有被正确配置，而且一点提示都没有
    this.context =
      this.canvas.getContext("webgl2", { preserveDrawingBuffer: true }) ||
      this.canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (
      this.windowName === "displayFullScreen" &&
      this.config.display["click-through"] === "transparent"
    ) {
      this.rgba = new Uint8Array(4);
      this.ignoreFlag = true;
      this.detectClickThrough();
    }
  }
  detectClickThrough() {
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
