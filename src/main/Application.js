import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
import { ThemeManager } from "./ui/ThemeManager";
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import { APP_CONFIG_PATH, APP_DATABASE_PATH } from "./options/paths";
import { defaultConfig } from "./options/defaultConfig";
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
    ipcMain.on("control:query-database-path", (event) => {
      event.returnValue = APP_DATABASE_PATH;
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
      this.openWindow(this.configDB.get("display-mode").value());
    });
    ipcMain.on("control:relaunch-display-window", () => {
      // 使用destroy方法，防止使用close导致关闭窗口受阻
      this.windowManager.windows.display.destroy();
      this.openWindow(this.configDB.get("display-mode").value());
    });
    ipcMain.on("control:close-display-window", () => {
      this.windowManager.windows.display.destroy();
    });
    ipcMain.on("control:control-window-loaded", () => {
      // 无需判断，因为两窗口若是真的已经连接，必定不会触发loaded事件
      // if (!this.windowManager.isControlAndDisplayLinked) {
      this.windowManager.buildControlDisplayLink();
      // }
    });
    ipcMain.on("display:display-window-loaded", () => {
      // if (!this.windowManager.isControlAndDisplayLinked) {
      this.windowManager.buildControlDisplayLink();
      // }
    });
  }
  quitApp() {}
}
