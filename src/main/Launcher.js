import { EventEmitter } from "events";
import { app } from "electron";
// import is from "electron-is";
import { ExceptionHandler } from "./core/ExceptionHandler";
import { logger } from "./core/Logger";
import { Application } from "./Application";
export class Launcher extends EventEmitter {
  constructor() {
    super();
    this.file = "";
    this.init();
  }

  init() {
    this.exceptionHandler = new ExceptionHandler();
    // this.openedAtLogin = is.macOS()
    //   ? app.getLoginItemSettings().wasOpenedAtLogin
    //   : false;
    // logger.info("[Hime Display] openedAtLogin:", this.openedAtLogin);
    this.handleAppEvents();
  }
  handleAppEvents() {
    app.on("ready", () => {
      this.application = new Application();
      this.application.startApp();
      // this.application.on("ready", () => {
      // this.sendFileToApplication();
      // });
    });
    app.on("activate", () => {
      if (this.application) {
        logger.info("[Hime Display] activate");
        // this.application.openWindow("controlPanel");
        this.application.windowManager.windows.control.show();
      }
    });
    // 为了实现缓存不被清理的效果，展示器的close事件的默认行为已经被阻止，若不对app执行exit，应用会因为展示器未关闭而不退出，这里在应用希望退出时强制关闭展示器来解决这个问题
    app.on("before-quit", () => {
      this.application.windowManager.windows.control.destroy();
    });
    app.on("will-quit", () => {
      logger.info("[Hime Display] will-quit");
      if (this.application) {
        this.application.quitApp();
      }
    });
    // 监听此事件后，将不会在所有窗口退出时自动退出
    app.on("window-all-closed", () => {});
  }
}
