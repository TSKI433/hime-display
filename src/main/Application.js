import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
export class Application extends EventEmitter {
  constructor() {
    super();
    // this.isReady = false;
    this.init();
  }
  init() {
    this.windowManager = new WindowManager();
  }
  startApp(page, options) {
    const win = this.windowManager.openWindow(page, options);
    win.once("ready-to-show", () => {
      // this.isReady = true;
      this.emit("ready");
    });
  }
}
