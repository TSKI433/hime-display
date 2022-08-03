import { ModelManager } from "./ModelManager";
import { ParameterMonitor, PartMonitor } from "@display/utils/live2d/Monitor";
export class Live2dManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "Live2D";
    this._sendToModelControl = null;
    this.shouldRender = false;
    this.parameterMonitor = null;
  }
  switchIn() {
    this.app = new PIXI.Application({
      autoStart: true,
      view: this.canvas,
      // 即使canvas已经通过CSS配置占满全屏，不做这一影响设置依旧会使得画面拉伸
      resizeTo: window,
      antialias: true,
      autoDensity: true,
      transparent: true,
      resolution: this.resolution,
    });
    this.parameterMonitor = new ParameterMonitor();
    this.partMonitor = new PartMonitor();
  }
  switchOut() {
    this._sendToModelControl = null;
    this.shouldRender = false;
    this.parameterMonitor = null;
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
      autoUpdate: false,
    });

    const model = this.model;
    const app = this.app;
    app.stage.addChild(model);
    const displayConfig = this.config.display;
    const configWidth =
      (innerWidth *
        (displayConfig["2d-initial-width-range"][1] -
          displayConfig["2d-initial-width-range"][0])) /
      100;
    const configHeight =
      (innerHeight *
        (displayConfig["2d-initial-height-range"][1] -
          displayConfig["2d-initial-height-range"][0])) /
      100;
    const scaleX = configWidth / model.width;
    const scaleY = configHeight / model.height;
    model.scale.set(Math.min(scaleX, scaleY));
    // model.x = app.renderer.view.width / this.resolution - model.width;
    // model.y = app.renderer.view.height / this.resolution - model.height;
    model.x = (innerWidth * displayConfig["2d-initial-width-range"][0]) / 100;
    model.y = (innerHeight * displayConfig["2d-initial-height-range"][0]) / 100;
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
    // 销毁模型后不再调用
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
}
