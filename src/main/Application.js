import { EventEmitter } from "events";
import { WindowManager } from "./ui/WindowManager";
import { ThemeManager } from "./ui/ThemeManager";
import { TrayManager } from "./ui/TrayManager";
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import {
  APP_CONFIG_PATH,
  APP_DATA_PATH,
  CHROMIUM_PREFERENCE_PATH,
} from "./options/paths";
import { defaultConfig } from "@shared/defaults/defaultConfig";
import { ipcMain, dialog, systemPreferences, app } from "electron";
import is from "electron-is";
import i18next from "@shared/locales/i18next";

export class Application extends EventEmitter {
  constructor() {
    super();
    // this.isReady = false;
    this.init();
  }
  init() {
    this.setChromiumPreference();
    this.initConfigDB();
    this.initLanguage();
    this.initWindowManager();
    this.initThemeManager();
    this.initTrayManager();
    this.handleIpcMessages();
  }
  startApp() {
    // 为了实现展示器加载上一次的模型这种操作，控制面板必须要在启动应用的时候启动，只是show与hide的区别，而这个判断已经下方到windowManager里面去了
    this.openWindow("controlPanel");
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
  setChromiumPreference() {
    // 每一次启动应用时，将默认的开发者工具窗口设定为一个独立的窗口，防止全屏透明的展示器打开窗口内开发者工具的时候透明失效
    low(new lowFileSync(CHROMIUM_PREFERENCE_PATH))
      .set("electron.devtools.preferences.currentDockState", '"undocked"')
      .write();
  }
  initConfigDB() {
    this.configDB = low(new lowFileSync(APP_CONFIG_PATH));
    // 看样子lowdb的这个defaults只能浅层defaults，到第二级就不管用了
    this.configDB.defaults(defaultConfig).write();
  }
  initLanguage() {
    i18next.changeLanguage(this.configDB.get(["general", "language"]).value());
  }
  initWindowManager() {
    // 启动window时也需要读取配置数据库
    this.windowManager = new WindowManager(this.configDB);
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
  initTrayManager() {
    this.trayManager = new TrayManager();
    this.trayManager.buildMenu();
    this.trayManager.on("tray:open-control-window", () => {
      // this.openWindow("controlPanel");
      // 更改机制，目前控制面板永远不会被关闭，只会隐藏
      this.windowManager.windows.control.show();
    });
    this.trayManager.on("tray:open-display-window", () => {
      this.openWindow(this.configDB.get(["display", "display-mode"]).value());
    });
    this.trayManager.on("tray:quit-app", () => {
      // 改用exit有两个目的
      // 1.防止一些特殊情况无法退出
      // 2.目前的控制面板一直是一个隐藏状态，会阻止引用的退出，虽然可以手动调用一个close再退出，懒得……
      app.exit();
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
      // 因为关闭了新建窗口的this.allUpdateWindowIds();，对展示器的通知状态只能在这里进行
      this.windowManager.updateWindowIds("display");
      return this.windowManager.windowIds;
    });
    ipcMain.handle("display:query-window-ids", () => {
      // 控制面板有必要确认展示器的模型载入状态，刷新页面后模型也会变为未载入状态
      // 这里仅向控制面板发送消息，如果展示器发送消息，展示器的windowId在query状态同时成了update，会导致奇怪的问题，id直接变undefined了
      // 为实现启动展示器自动加载之前的模型，也必须这么设计，而且还要把主进程检测到窗口打开时的广播操作关了，因为这个时候新建的窗口可能还没有准备接收消息
      this.windowManager.updateWindowIds("control");
      return this.windowManager.windowIds;
    });
    ipcMain.handle("display:query-config", () => {
      return {
        config: this.configDB.value(),
        // 属于是让windowName搭个顺风车……免得初始化的时候多弄出一个通信来
        windowName: this.windowManager.windows.display.windowName,
      };
    });
    ipcMain.on("control:update-config", () => {
      this.configDB.read();
    });
    ipcMain.on("control:open-dev-tool", (event, type) => {
      if (
        type === "display" &&
        this.windowManager.windows.display.windowName === "displayFullScreen"
      ) {
        dialog
          .showMessageBox(this.windowManager.windows.control, {
            type: "info",
            message: i18next.t("message.display-open-dev-title"),
            detail: i18next.t("message.display-open-dev-detail"),
            buttons: [
              i18next.t("message.confirm"),
              i18next.t("message.cancel"),
            ],
            defaultId: 0,
            cancelId: 1,
          })
          .then((result) => {
            result.response === 0 &&
              this.windowManager.windows[type].webContents.openDevTools();
          });
      } else {
        this.windowManager.windows[type].webContents.openDevTools();
      }
    });
    ipcMain.handle("display:ask-for-media-access", () => {
      return this.askForMediaAccess();
    });
    ipcMain.on("display:set-ignore-mouse-events", (event, ...args) => {
      this.windowManager.windows.display.setIgnoreMouseEvents(...args);
    });
    ipcMain.on("control:change-language", (event, language) => {
      console.log("[Hime Display] change language to", language);
      i18next.changeLanguage(language);
      this.trayManager.buildMenu();
    });
  }
  async askForMediaAccess() {
    if (is.macOS()) {
      return systemPreferences.askForMediaAccess("camera");
    } else {
      return true;
    }
  }
  quitApp() {}
}
