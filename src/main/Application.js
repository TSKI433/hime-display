import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
import { ThemeManager } from "./ui/ThemeManager";
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import { APP_CONFIG_PATH, APP_DATA_PATH } from "./options/paths";
import { defaultConfig } from "@shared/defaults/defaultConfig";
import { ipcMain, dialog } from "electron";
export class Application extends EventEmitter {
  constructor() {
    super();
    // this.isReady = false;
    this.init();
  }
  init() {
    this.initWindowManager();
    this.initThemeManager();
    this.initConfigDB();
    this.handleIpcMessages();
  }
  startApp() {
    if (this.configDB.get(["general", "open-control-at-launch"]).value()) {
      this.openWindow("controlPanel");
    }
    if (this.configDB.get(["general", "open-display-at-launch"]).value()) {
      this.openWindow(this.configDB.get(["display", "display-mode"]).value());
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
  initWindowManager() {
    this.windowManager = new WindowManager();
  }
  initThemeManager() {
    this.themeManager = new ThemeManager();
    this.themeManager.on("system-theme-change", (theme) => {
      this.windowManager.sendMessageToWindow(
        "control",
        "main:update-theme",
        theme
      );
    });
  }
  handleIpcMessages() {
    // 向子进程提供数据库存储目录
    ipcMain.on("control:query-data-path", (event) => {
      event.returnValue = APP_DATA_PATH;
    });
    ipcMain.on("control:query-system-theme", (event) => {
      event.returnValue = this.themeManager.getSystemTheme();
    });
    ipcMain.handle("control:select-path", (windowName) => {
      return dialog.showOpenDialogSync(this.windowManager.windows[windowName], {
        properties: ["openDirectory"],
      });
    });
    ipcMain.on("control:launch-display-window", () => {
      this.openWindow(this.configDB.get(["display", "display-mode"]).value());
    });
    ipcMain.on("control:relaunch-display-window", () => {
      // 使用destroy方法，防止使用close导致关闭窗口受阻
      this.windowManager.windows.display.destroy();
      this.openWindow(this.configDB.get(["display", "display-mode"]).value());
    });
    ipcMain.on("control:close-display-window", () => {
      this.windowManager.windows.display.destroy();
    });
    ipcMain.handle("control:query-window-ids", () => {
      return this.windowManager.windowIds;
    });
    ipcMain.handle("display:query-window-ids", () => {
      return this.windowManager.windowIds;
    });
    ipcMain.handle("display:query-config", () => {
      return this.configDB.value();
    });
    ipcMain.on("control:update-config", () => {
      this.configDB.read();
    });
  }
  quitApp() {}
}
