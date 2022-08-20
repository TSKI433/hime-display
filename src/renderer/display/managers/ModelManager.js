// 所有管理器的祖先
export class ModelManager {
  constructor(parentApp) {
    this.canvas = parentApp.canvas;
    this.config = parentApp.config;
    this.stats = parentApp.stats;
    this.resolution = parentApp.resolution;
    this.antialias = parentApp.antialias;
  }
  onSendToModelControl(callback) {
    this._sendToModelControl = callback;
  }
}
