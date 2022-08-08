import { ModelManager } from "./ModelManager";
import { ParameterMonitor, PartMonitor } from "@display/utils/live2d/Monitor";
import { Live2DFaceMeshCaptureManager as FaceMeshCaptureManager } from "@display/utils/capture/Live2DFaceMeshCaptureManager";
import { setModelBaseTransfrom } from "@display/utils/2d/utils";
export class Live2dManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "Live2D";
    this._sendToModelControl = null;
    this.shouldRender = false;
    this.parameterMonitor = null;
    this.captureManagerNow = null;
    this.focusPosition = null;
  }
  switchIn() {
    this.app = new PIXI.Application({
      autoStart: true,
      view: this.canvas,
      // 即使canvas已经通过CSS配置占满全屏，不做这一影响设置依旧会使得画面拉伸
      resizeTo: window,
      antialias: this.antialias,
      autoDensity: true,
      transparent: true,
      resolution: this.resolution,
    });
    this.parameterMonitor = new ParameterMonitor();
    this.partMonitor = new PartMonitor();
    this._addEventListeners();
  }
  switchOut() {
    // 移除事件监听放到了this.focusPosition=null之前，不然我感觉有可能focusPosition又被初始化了，不过照理说是同步代码的话应该不会出现这个问题，反正switchOut的顺序无所谓，就这么安排了
    this._removeEventListeners();
    this._sendToModelControl = null;
    this.shouldRender = false;
    this.parameterMonitor = null;
    this.captureManagerNow = null;
    this.focusPosition = null;

    // destroy以后无法直接获得这个上下文了
    const gl = this.app.renderer.context.gl;
    this.app.destroy();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.STENCIL_BUFFER_BIT);
  }
  async loadModel(modelInfo) {
    if (this.model !== null && !this.model.destroied) {
      this.model.destroy();
    }
    this.model = await PIXI.live2d.Live2DModel.from(modelInfo.entranceFile, {
      // 更新和交互都交由之后手动控制
      autoUpdate: false,
      autoInteract: false,
    });

    const model = this.model;
    const app = this.app;
    app.stage.addChild(model);
    const displayConfig = this.config.display;
    setModelBaseTransfrom(model, displayConfig);
    this.then = performance.now();
    this.shouldRender = true;
    requestAnimationFrame(this._render.bind(this));
    const internalModel = this.model.internalModel;
    const coreModel = internalModel.coreModel;
    const modelControlInfo = {
      description: {
        name: modelInfo.name,
        extensionName: modelInfo.extensionName,
        vertexCount: coreModel._model.drawables.count,
        groupCount: Object.keys(internalModel.settings.groups).length,
        hitAreaCount: Object.keys(internalModel.hitAreas).length,
        motionGroupCount: Object.keys(internalModel.settings.motions).length,
        motionCount: Object.keys(internalModel.settings.motions).reduce(
          (acc, cur) => acc + internalModel.settings.motions[cur].length,
          0
        ),
        partCount: coreModel._model.parts.count,
        parameterCount: coreModel._model.parameters.count,
      },
      parameter: {
        // live2d的parameter没有固定值域
        _parameterIds: coreModel._parameterIds,
        _parameterMinimumValues: coreModel._parameterMinimumValues,
        _parameterMaximumValues: coreModel._parameterMaximumValues,
      },
      part: coreModel._partIds,
      motion: internalModel.settings.motions,
    };
    return modelControlInfo;
    // model.on("hit", (hitAreas) => {
    //   if (hitAreas.includes("body")) {
    //     model.motion("tap_body");
    //   }
    // });
  }
  _render(now) {
    if (!this.shouldRender) {
      return;
    }
    if (this.stats !== null) {
      this.stats.begin();
      this.stats.end();
    }
    // 如果正在进行面部捕捉，鼠标跟踪会将捕捉结果覆盖掉
    if (this.focusPosition !== null && this.captureManagerNow === null) {
      // 不像文档（https://guansss.github.io/pixi-live2d-display/interactions/）这样直接将focus函数写在事件监听里，而是在渲染时调用，应该能减少非必要的focus运行次数
      this.model.focus(this.focusPosition.x, this.focusPosition.y);
    }
    // 销毁模型后不再调用
    // 经过实际测试，发现使用pixi官方的app.ticker.add操作（https://pixijs.io/guides/basics/getting-started.html）似乎会丢失自动鼠标跟踪（虽然现在也不用自动跟踪了……）
    if (!this.model.destroyed) {
      this.model.update(now - this.then);
      this.then = now;
      requestAnimationFrame(this._render.bind(this));
    }
    if (this.parameterMonitor.checkUpdate()) {
      this._sendToModelControl({
        channel: "manager:update-parameter",
        data: {
          value: this.parameterMonitor.value,
        },
      });
    }
    if (this.partMonitor.checkUpdate()) {
      this._sendToModelControl({
        channel: "manager:update-part",
        data: {
          value: this.partMonitor.value,
        },
      });
    }
  }
  onSendToModelControl(callback) {
    this._sendToModelControl = callback;
  }
  handleMessage(message) {
    switch (message.channel) {
      case "control:bind-parameter": {
        this._bindParameter(message.data.parameterId);
        break;
      }
      case "control:set-parameter": {
        this._setParameter(message.data);
        break;
      }
      case "control:bind-part": {
        this._bindPart(message.data.partId);
        break;
      }
      case "control:set-part": {
        this._setPart(message.data);
        break;
      }
      case "control:play-motion": {
        const motionIndex = this.model.internalModel.settings.motions[
          message.data.motion.group
        ].findIndex((motion) => motion.File === message.data.motion.File);
        this.model.motion(message.data.motion.group, motionIndex);
        break;
      }
      // 目前看来，面部捕捉和动画播放并不冲突，所以可以同时进行，动画播放的优先级高于面部捕捉
      case "control:launch-capture": {
        // 先把focus位置转正了，不然rig结果头可能是偏的
        this.model.internalModel.focusController.targetX = 0;
        this.model.internalModel.focusController.targetY = 0;
        this.captureManagerNow = new FaceMeshCaptureManager();
        this.captureManagerNow.setTarget(this.model);
        this.captureManagerNow.start();
        break;
      }
      case "control:quit-capture": {
        this.captureManagerNow.quitCapture();
        this.captureManagerNow = null;
        break;
      }
    }
  }
  _bindParameter(parameterId) {
    this.parameterMonitor.bind(parameterId, this.model);
  }
  _setParameter({ parameterId, value }) {
    const parameterIndex =
      this.model.internalModel.coreModel._parameterIds.indexOf(parameterId);
    this.model.internalModel.coreModel._parameterValues[parameterIndex] = value;
    // 直接手动更新Monitor的数值，防止checkUpdate机制循环发送更新消息
    this.parameterMonitor.value = value;
  }
  _bindPart(partId) {
    this.partMonitor.bind(partId, this.model);
  }
  _setPart({ partId, value }) {
    const partIndex =
      this.model.internalModel.coreModel._partIds.indexOf(partId);
    this.model.internalModel.coreModel._partOpacities[partIndex] = value;
    // 直接手动更新Monitor的数值，防止checkUpdate机制循环发送更新消息
    this.partMonitor.value = value;
  }
  _addEventListeners() {
    document.addEventListener("pointermove", this.onPointerMove);
  }
  _removeEventListeners() {
    document.removeEventListener("pointermove", this.onPointerMove);
  }
  // 不使用箭头函数会导致this的指向出错，若使用bind更改this指向，会导致返回的function和原函数不同，无法移出事件监听器
  onPointerMove = (event) => {
    if (this.focusPosition === null) {
      // 初次检测，初始化focusPosition
      this.focusPosition = {};
    }
    this.focusPosition.x = event.clientX;
    this.focusPosition.y = event.clientY;
  };
}
