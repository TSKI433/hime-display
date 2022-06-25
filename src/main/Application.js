import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
import { ConfigManager } from "./core/ConfigManager";
export class Application extends EventEmitter {
  constructor() {
    super();
    // this.isReady = false;
    this.init();
  }
  init() {
    this.windowManager = new WindowManager();
    this.configManager = new ConfigManager();
  }
  startApp() {
    if (this.configManager.configDB.get("open-control-at-launch").value()) {
      const win = this.openWindow("controlPanel");
      win.once("ready-to-show", () => {
        // this.isReady = true;
        this.emit("ready");
      });
    }
  }
  openWindow(windowName) {
    return this.windowManager.openWindow(windowName);
  }
  quitApp() {}
}
