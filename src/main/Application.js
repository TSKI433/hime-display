import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
export class Application extends EventEmitter {
  constructor() {
    super();
    this.isReady = false;
    this.init();
  }
  init() {}
  start(page, options) {
    const win = this.showPage(page, options);
    win.once("ready-to-show", () => {
      this.isReady = true;
      this.emit("ready");
    });
  }
  showPage(page, options = {}) {
    const { openedAtLogin } = options;
    // const autoHideWindow = this.configManager.getUserConfig('auto-hide-window')
    return this.windowManager.openWindow(page, {
      hidden: openedAtLogin,
      // hidden: openedAtLogin || autoHideWindow
    });
  }
}
