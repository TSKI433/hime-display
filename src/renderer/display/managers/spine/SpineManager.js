import { ModelManager } from "../ModelManager";
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
  loadModel(modelInfo) {
    const modelFile = modelInfo.entranceFile;
    this.app.loader
      .add("spineCharacter", modelFile)
      .load((loder, resources) => {
        // this.model = new Spine(resources.spineCharacter.spineData);
        this.model = new PIXI.spine.Spine(resources.spineCharacter.spineData);
        const modelCage = new PIXI.Container();
        modelCage.addChild(this.model);
        // measure the spine animation and position it inside its container to align it to the origin
        const localRect = this.model.getLocalBounds();
        this.model.position.set(-localRect.x, -localRect.y);
        // now we can scale, position and rotate the container as any other display object
        const scale = Math.min(
          (this.app.screen.width * 0.7) / modelCage.width,
          (this.app.screen.height * 0.7) / modelCage.height
        );
        modelCage.scale.set(scale, scale);
        modelCage.position.set(
          (this.app.screen.width - modelCage.width) * 0.5,
          (this.app.screen.height - modelCage.height) * 0.5
        );
        this.app.stage.addChild(modelCage);
        this.app.start();
      });
  }
}
