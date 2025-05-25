import { ModelManager } from "./ModelManager";
import { setModelBaseTransfrom, draggable } from "@display/utils/2d/utils";
import imageLoaderAdapter from "@display/utils/spine/premultipliedImageLoader";
// 由于live2d的特殊需求，没用模块系统载入pixi.js，pixi-spine模块的载入依赖于模块化pixi.js，因此暂时用成umd版本吧
// import { Spine } from "pixi-spine";
export class SpineManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "Spine";
    this.instantConfig = null;

    this.app = null;
    this.model = null;
    this.internalModel = null;
    this.PIXI = window.PIXI;
  }
  getApplicationConfig() {
    return {
      // 之后手动触发渲染
      autoStart: false,
      view: document.getElementById("display-canvas"),
      // 即使canvas已经通过CSS配置占满全屏，不做这一影响设置依旧会使得画面拉伸
      resizeTo: window,
      antialias: this.antialias,
      autoDensity: true,
      transparent: true,
      resolution: this.resolution,
    };
  }

  switchIn() {
    this.app = new this.PIXI.Application(this.getApplicationConfig());
  }
  switchOut() {
    // this._removeEventListeners();
    // this._sendToModelControl = null;
    this.shouldRender = false;
    this.instantConfig = null;
    // destroy以后无法直接获得这个上下文了
    const gl = this.app.renderer.context.gl;
    this.app.destroy();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    this.app = null;
    this.model?.destroy();
    this.model = null;
    this.internalModel = null;
  }
  loadModel(modelInfo) {
    return new Promise((resolve, reject) => {
      this._initInstantConfig();
      this._clearModel();
      const modelFile = modelInfo.entranceFile;
      this.app.loader
        .add(
          "spineCharacter",
          modelFile,
          this.config.display["spine-premultiply-alpha"]
            ? {
                metadata: { imageLoader: imageLoaderAdapter },
              }
            : undefined
        )
        .load((loader, resources) => {
          // 不清除缓存的话，重复加载时天天报warn看着不舒服
          this.PIXI.utils.clearTextureCache();
          // 学着pixi-live2d-display开始套娃……
          this.internalModel = new this.PIXI.spine.Spine(
            resources.spineCharacter.spineData
          );
          this._setupModel();
          resolve(this._buildModelControlInfo(modelInfo));
        });
    });
  }
  _setupModel() {
    // 官方的setSkinByName函数有点问题，自己重新写了一个强制切换皮肤的函数
    this.internalModel.skeleton.setSkinByNameForce =
      function setSkinByNameForce(name) {
        for (let i = 0; i < this.slots.length; i++) {
          this.slots[i].attachment = null;
        }
        this.skin = undefined;
        this.setSkinByName(name);
      };
    const localRect = this.internalModel.getLocalBounds();
    this.internalModel.position.set(-localRect.x, -localRect.y);
    this.model = new this.PIXI.Container();
    this.model.addChild(this.internalModel);
    this.app.stage.addChild(this.model);
    setModelBaseTransfrom(this.model, this.config.display, "spine");
    this.model.interactive = true;
    if (this.config.display["spine-draggable"]) {
      draggable(this.model);
    }
    this.model.on("dragging", this._updateModelTransform.bind(this));
    this._bindEventAnimation();
    if (!this.shouldRender) {
      this._startRender();
    }
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
    // 拖拽结束后置空动画对于一些模型会导致问题，因为模型的默认姿态很诡异……
    this.model.on("dragend", () => {
      // 对于没有设定事件动画的情况，不进行动作清除
      if (this.instantConfig.dragAnimation !== "none") {
        this.internalModel.state.setEmptyAnimations(0.3);
      }
    });
  }
  _startRender() {
    this.shouldRender = true;
    this._render();
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
      description: [
        { label: "name", value: modelInfo.name },
        { label: "extension-name", value: modelInfo.extensionName },
        {
          label: "version-number",
          value: this.internalModel.spineData.version,
        },
        {
          label: "motion-count",
          value: this.internalModel.spineData.animations.length,
        },
        {
          label: "bone-count",
          value: this.internalModel.spineData.bones.length,
        },
        {
          label: "slot-count",
          value: this.internalModel.spineData.slots.length,
        },
        {
          label: "ik-count",
          value: this.internalModel.spineData.ikConstraints.length,
        },
        {
          label: "skin-count",
          value: this.internalModel.spineData.skins.length,
        },
      ],
      motion: motionInfo,
      skin: this.internalModel.spineData.skins.map((skin) => skin.name),
    };
    return modelControlInfo;
  }
  _render() {
    this.app.ticker.start();
    this.app.ticker.add((delta) => {
      if (!this.shouldRender) {
        this.app.ticker.stop();
        return;
      }
      if (this.stats !== null) {
        this.stats.begin();
        this.stats.end();
      }
      this.app.render();
    });
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
      case "control:set-skin": {
        this.internalModel.skeleton.setSkinByNameForce(message.data.skin);
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
