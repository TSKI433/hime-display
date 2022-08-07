import { ModelManager } from "./ModelManager";
import { setModelBaseTransfrom } from "@display/utils/2d/utils";
// 由于live2d的特殊需求，没用模块系统载入pixi.js，pixi-spine模块的载入依赖于模块化pixi.js，因此暂时用成umd版本吧
// import { Spine } from "pixi-spine";
export class SpineManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "Spine";
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
  }
  switchOut() {
    // this._removeEventListeners();
    // this._sendToModelControl = null;
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
      this.app.loader.reset();
    }
    const modelFile = modelInfo.entranceFile;
    this.app.loader
      .add("spineCharacter", modelFile)
      .load((loder, resources) => {
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
        this.app.start();
      });
  }
  onSendToModelControl() {}
}
