export class ModelManager {
  constructor(parentApp) {
    this.canvas = parentApp.canvas;
    this.config = parentApp.config;
    this.stats = parentApp.stats;
    this.resolution = parentApp.resolution;
    this.model = null;
  }
}
