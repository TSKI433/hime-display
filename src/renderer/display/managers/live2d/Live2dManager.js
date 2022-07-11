export class Live2dManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.model = null;
    this.resolution = 2;
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
    this.model = await PIXI.live2d.Live2DModel.from(modelInfo.entranceFile);
    const model = this.model;
    const app = this.app;
    app.stage.addChild(model);
    const scaleX = (innerWidth * 0.34) / model.width;
    const scaleY = (innerHeight * 0.8) / model.height;
    model.scale.set(Math.min(scaleX, scaleY));
    model.x = app.renderer.view.width / this.resolution - model.width;
    model.y = app.renderer.view.height / this.resolution - model.height;
    // model.on("hit", (hitAreas) => {
    //   if (hitAreas.includes("body")) {
    //     model.motion("tap_body");
    //   }
    // });
  }
}
