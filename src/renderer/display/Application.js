import { Live2dManager } from "@display/managers/live2d/Live2dManager";
export class Application {
  constructor() {
    this.init();
  }
  init() {
    this.canvas = document.getElementById("display-canvas");
    this.initManagers();
  }
  initManagers() {
    this.managers = {};
    this.managers.live2d = new Live2dManager(this.canvas);
  }
  switchManager() {}
}
