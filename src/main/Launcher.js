import { EventEmitter } from "events";
import { app } from "electron";
import is from "electron-is";
import { ExceptionHandler } from "./core/ExceptionHandler";
import { logger } from "./core/Logger";
import { Application } from "./Application";
import { EMPTY_STRING } from "@shared/constants";
export class Launcher extends EventEmitter {
  constructor() {
    super();
    this.file = EMPTY_STRING;
    this.init();
  }

  init() {
    this.exceptionHandler = new ExceptionHandler();
    this.openedAtLogin = is.macOS()
      ? app.getLoginItemSettings().wasOpenedAtLogin
      : false;
    logger.info("[Hime Display] openedAtLogin:", this.openedAtLogin);
    this.handleAppEvents();
  }
  handleAppEvents() {
    this.handelAppReady();
    this.handleAppWillQuit();
  }

  handelAppReady() {
    app.on("ready", () => {
      this.application = new Application();
      this.application.startApp("controlPanel", {
        openedAtLogin: this.openedAtLogin,
      });
      this.application.on("ready", () => {
        // this.sendFileToApplication();
      });
    });
    app.on("activate", () => {
      if (this.application) {
        logger.info("[Hime Display] activate");
        this.application.showPage("controlPanel");
      }
    });
  }
  handleAppWillQuit() {
    app.on("will-quit", () => {
      logger.info("[Hime Display] will-quit");
      if (this.application) {
        this.application.quitApp();
      }
    });
    // app.on("window-all-closed", () => {});
  }
}
