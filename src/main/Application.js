import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import { APP_CONFIG_PATH, APP_DATABASE_PATH } from "./options/paths";
import { defaultConfig } from "./options/defaultConfig";
import { ipcMain } from "electron";
export class Application extends EventEmitter {
  constructor() {
    super();
    // this.isReady = false;
    this.init();
  }
  init() {
    this.windowManager = new WindowManager();
    this.initConfigDB();
    this.handleIpcMessages();
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
  handleIpcMessages() {
    // 向子进程提供数据库存储目录
    ipcMain.on("query-database-path", (event) => {
      event.returnValue = APP_DATABASE_PATH;
    });
  }
  quitApp() {}
}
