import * as PIXI from "pixi.js";
import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { SpineManager } from "./SpineManager";
export class SpineManager42 extends SpineManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "Spine42";
    this.PIXI = PIXI;
  }
  switchIn() {
    this.app = new this.PIXI.Application();
    this.app.init({
      ...this.getApplicationConfig(),
      backgroundAlpha: 0,
    });
  }
  switchOut() {
    // this._removeEventListeners();
    // this._sendToModelControl = null;
    this.shouldRender = false;
    this.instantConfig = null;
    // destroy以后无法直接获得这个上下文了
    const gl = this.app.renderer.context.gl;
    this.app.destroy(true, true);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.app = null;
    this.model?.destroy();
    this.model = null;
    this.internalModel = null;
  }

  loadModel(modelInfo) {
    return new Promise(async (resolve, reject) => {
      try {
        this._initInstantConfig();
        this._clearModel();
        const modelFile = modelInfo.entranceFile;
        // 将modelFile中的扩展名(skel或json)替换为atlas
        const atlasFile = modelFile.replace(/\.(skel|json)$/, ".atlas");

        this.PIXI.Assets.setPreferences({
          preferWorkers: false,
        });
        this.PIXI.Assets.add({ alias: "spineData", src: modelFile });
        this.PIXI.Assets.add({ alias: "spineAtlas", src: atlasFile });
        await this.PIXI.Assets.load("spineData");
        await this.PIXI.Assets.load("spineAtlas");

        this.internalModel = Spine.from({
          skeleton: "spineData",
          atlas: "spineAtlas",
          scale: 1.0,
        });
        this.internalModel.spineData = this.internalModel.skeleton.data;

        this._setupModel();
        resolve(this._buildModelControlInfo(modelInfo));
      } catch (error) {
        reject(error);
      }
    });
  }
  _clearModel() {
    if (this.model !== null && !this.model.destroied) {
      this.model.destroy();
      // this.app.loader.reset();
      this.PIXI.Assets.reset();
    }
  }
}
