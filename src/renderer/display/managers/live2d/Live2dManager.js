import { ModelManager } from "../ModelManager";
export class Live2dManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "Live2D";
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
    const scaleX = (innerWidth * 0.34) / model.width;
    const scaleY = (innerHeight * 0.8) / model.height;
    model.scale.set(Math.min(scaleX, scaleY));
    model.x = app.renderer.view.width / this.resolution - model.width;
    model.y = app.renderer.view.height / this.resolution - model.height;
    let then = performance.now();
    //  直接用function的话this的指向是错的
    const tick = (now) => {
      if (this.stats !== null) {
        this.stats.begin();
        this.stats.end();
      }
      // 销毁模型后不再调用
      if (!model.destroyed) {
        model.update(now - then);
        then = now;
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
    // model.on("hit", (hitAreas) => {
    //   if (hitAreas.includes("body")) {
    //     model.motion("tap_body");
    //   }
    // });
  }
  onSendToModelControl() {}
}
