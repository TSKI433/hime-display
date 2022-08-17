export class ModelManager {
  constructor(parentApp) {
    this.canvas = parentApp.canvas;
    this.config = parentApp.config;
    this.stats = parentApp.stats;
    this.resolution = parentApp.resolution;
    this.antialias = parentApp.antialias;
    this.model = null;
  }
  onSendToModelControl(callback) {
    this._sendToModelControl = callback;
  }
}
