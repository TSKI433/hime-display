import { ModelManager } from "./ModelManager";
import { setModelBaseTransfrom, draggable } from "@display/utils/2d/utils";
// 由于live2d的特殊需求，没用模块系统载入pixi.js，pixi-spine模块的载入依赖于模块化pixi.js，因此暂时用成umd版本吧
// import { Spine } from "pixi-spine";
export class SpineManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "Spine";
    this.instantConfig = null;
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
  }
  switchOut() {
    // this._removeEventListeners();
    // this._sendToModelControl = null;
    this.instantConfig = null;
    // destroy以后无法直接获得这个上下文了
    const gl = this.app.renderer.context.gl;
    this.app.destroy();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.STENCIL_BUFFER_BIT);
  }
  loadModel(modelInfo) {
    return new Promise((resolve, reject) => {
      this._initInstantConfig();
      this._clearModel();
      const modelFile = modelInfo.entranceFile;
      this.app.loader
        .add("spineCharacter", modelFile)
        .load((loader, resources) => {
          // 学着pixi-live2d-display开始套娃……
          this.internalModel = new PIXI.spine.Spine(
            resources.spineCharacter.spineData
          );
          const localRect = this.internalModel.getLocalBounds();
          this.internalModel.position.set(-localRect.x, -localRect.y);
          this.model = new PIXI.Container();
          this.model.addChild(this.internalModel);
          setModelBaseTransfrom(this.model, this.config.display);
          this.app.stage.addChild(this.model);
          this.model.interactive = true;
          if (this.config.display["2d-draggable"]) {
            draggable(this.model);
          }
          this.model.on("dragging", this._updateModelTransform.bind(this));
          this._bindEventAnimation();
          this.app.start();

          resolve(this._buildModelControlInfo(modelInfo));
        });
    });
  }
  _initInstantConfig() {
    this.instantConfig = {
      clickAnimation: "random",
      dragAnimation: "none",
    };
  }
  _clearModel() {
    if (this.model !== null && !this.model.destroied) {
      this.model.destroy();
      this.app.loader.reset();
    }
  }
  _updateModelTransform() {
    this._sendToModelControl({
      channel: "manager:update-model-transform",
      data: {
        x: this.model.x,
        y: this.model.y,
        // 目前缩放不提供xy方向的分别缩放
        scale: this.model.scale.x,
      },
    });
  }
  _bindEventAnimation() {
    // 对于Spine，点击动画默认播放一次，拖拽动画循环播放
    this.model.on("click", () => {
      // 防止拖拽过程连带触发点击事件，只要dragEmitted为true，说明pointermove事件绝对被触发过
      // 这里有一个很巧妙的地方，如果不调用draggable函数，dragEmitted只能是undefined，下方判断依旧能正确触发，因此不需要手动判断是否启动了拖拽
      if (!this.model.dragEmitted) {
        this._loadMotionByPath(this.instantConfig.clickAnimation, false);
      }
    });
    this.model.on("dragstart", () => {
      this._loadMotionByPath(this.instantConfig.dragAnimation, true);
    });
    this.model.on("dragend", () => {
      this.internalModel.state.setEmptyAnimations(0.3);
    });
  }
  _buildModelControlInfo(modelInfo) {
    const motionInfo = [];
    this.internalModel.spineData.animations.forEach((animation) => {
      motionInfo.push({
        name: animation.name,
        duration: Number(animation.duration.toFixed(2)),
      });
    });
    const modelControlInfo = {
      description: {
        name: modelInfo.name,
        extensionName: modelInfo.extensionName,
        versionNumber: this.internalModel.spineData.version,
        animationCount: this.internalModel.spineData.animations.length,
        boneCount: this.internalModel.spineData.bones.length,
        slotCount: this.internalModel.spineData.slots.length,
        ikCount: this.internalModel.spineData.ikConstraints.length,
        skinCount: this.internalModel.spineData.skins.length,
      },
      motion: motionInfo,
    };
    return modelControlInfo;
  }
  onSendToModelControl(callback) {
    this._sendToModelControl = callback;
  }
  handleMessage(message) {
    switch (message.channel) {
      case "control:play-motion": {
        const {
          motion: { name },
          animationLoop,
        } = message.data;
        this.internalModel.state.setAnimation(0, name, animationLoop);
        break;
      }
      case "control:quit-motion": {
        // 需要提供一个动画转换为空轨道的时长，这里直接设定为1秒了
        this.internalModel.state.setEmptyAnimations(1);
        // 下方的方法会导致模型维持在当前动作的最后一帧
        // this.internalModel.state.clearTracks();
        break;
      }
      case "control:change-instant-config": {
        const { name, value } = message.data;
        this.instantConfig[name] = value;
        break;
      }
      case "control:set-model-transform": {
        this.model.x = message.data.x;
        this.model.y = message.data.y;
        this.model.scale.set(message.data.scale);
        break;
      }
      case "control:query-model-transform": {
        this._updateModelTransform();
        break;
      }
    }
  }
  _loadMotionByPath(motionPath, loop) {
    if (motionPath === "none") {
      return;
    } else if (motionPath === "random") {
      const animationNames = this.internalModel.spineData.animations.map(
        (a) => a.name
      );
      this.internalModel.state.setAnimation(
        0,
        animationNames[Math.floor(Math.random() * animationNames.length)],
        loop
      );
    } else {
      this.internalModel.state.setAnimation(0, motionPath, loop);
    }
  }
}
