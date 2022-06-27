import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import { APP_CONFIG_PATH } from "@shared/paths";
import { defaultConfig } from "./options/configs";
export class Application extends EventEmitter {
  constructor() {
    super();
    // this.isReady = false;
    this.init();
  }
  init() {
    this.windowManager = new WindowManager();
    this.initConfigDB();
  }
  startApp() {
    if (this.configDB.get("open-control-at-launch").value()) {
      this.openWindow("controlPanel");
    }

    if (this.configDB.get("open-display-at-launch").value()) {
      this.openWindow(this.configDB.get("display-mode").value());
    }

    // win.once("ready-to-show", () => {
    // this.isReady = true;
    // this.emit("ready");
    // });
  }
  openWindow(windowName) {
    return this.windowManager.openWindow(windowName);
  }
  initConfigDB() {
    this.configDB = low(new lowFileSync(APP_CONFIG_PATH));
    this.configDB.defaults(defaultConfig).write();
  }
  quitApp() {}
}
