import { EventEmitter } from "events";
import { app } from "electron";
import is from "electron-is";
import { ExceptionHandler } from "./core/ExceptionHandler";
import { logger } from "./core/Logger";
import { Application } from "./Application";
import {
  splitArgv,
  //  parseArgvAsUrl,
  parseArgvAsFile,
} from "./utils";
import { EMPTY_STRING } from "@shared/constants";
export class Launcher extends EventEmitter {
  constructor() {
    super();
    // this.url = EMPTY_STRING;
    this.file = EMPTY_STRING;
    this.makeSingleInstance(() => {
      this.init();
    });
  }
  makeSingleInstance(callback) {
    // Mac App Store Sandboxed App not support requestSingleInstanceLock
    // if (is.mas()) {
    //   callback && callback();
    //   return;
    // }

    const gotSingleLock = app.requestSingleInstanceLock();

    if (!gotSingleLock) {
      app.quit();
    } else {
      app.on("second-instance", (event, argv, workingDirectory) => {
        global.application.showPage("index");
        if (!is.macOS() && argv.length > 1) {
          this.handleAppLaunchArgv(argv);
        }
      });

      callback && callback();
    }
  }

  init() {
    this.exceptionHandler = new ExceptionHandler();

    this.openedAtLogin = is.macOS()
      ? app.getLoginItemSettings().wasOpenedAtLogin
      : false;

    if (process.argv.length > 1) {
      this.handleAppLaunchArgv(process.argv);
    }

    logger.info("[Hime Display] openedAtLogin:", this.openedAtLogin);

    this.handleAppEvents();
  }

  handleAppEvents() {
    // this.handleOpenUrl();
    this.handleOpenFile();

    this.handelAppReady();
    this.handleAppWillQuit();
  }

  /**
   * handleOpenUrl
   * Event 'open-url' macOS only
   * "name": "Hime Display Protocol",
   * "schemes": ["mo", "Hime Display"]
   */
  // handleOpenUrl() {
  //   if (is.mas() || !is.macOS()) {
  //     return;
  //   }
  //   app.on("open-url", (event, url) => {
  //     logger.info(`[Hime Display] open-url: ${url}`);
  //     event.preventDefault();
  //     this.url = url;
  //     this.sendUrlToApplication();
  //   });
  // }

  /**
   * handleOpenFile
   * Event 'open-file' macOS only
   * handle open torrent file
   */
  handleOpenFile() {
    if (!is.macOS()) {
      return;
    }
    app.on("open-file", (event, path) => {
      logger.info(`[Hime Display] open-file: ${path}`);
      event.preventDefault();
      this.file = path;
      this.sendFileToApplication();
    });
  }

  /**
   * handleAppLaunchArgv
   * For Windows, Linux
   * @param {array} argv
   */
  handleAppLaunchArgv(argv) {
    logger.info("[Hime Display] handleAppLaunchArgv:", argv);

    // args: array, extra: map
    const { args, extra } = splitArgv(argv);
    logger.info("[Hime Display] split argv args:", args);
    logger.info("[Hime Display] split argv extra:", extra);
    if (extra["--opened-at-login"] === "1") {
      this.openedAtLogin = true;
    }

    const file = parseArgvAsFile(args);
    if (file) {
      this.file = file;
      this.sendFileToApplication();
    }

    // const url = parseArgvAsUrl(args);
    // if (url) {
    //   this.url = url;
    //   this.sendUrlToApplication();
    // }
  }

  // sendUrlToApplication() {
  //   if (this.url && global.application && global.application.isReady) {
  //     global.application.handleProtocol(this.url);
  //     this.url = EMPTY_STRING;
  //   }
  // }

  sendFileToApplication() {
    if (this.file && global.application && global.application.isReady) {
      global.application.handleFile(this.file);
      this.file = EMPTY_STRING;
    }
  }

  handelAppReady() {
    app.on("ready", () => {
      global.application = new Application();

      const { openedAtLogin } = this;
      global.application.start("index", {
        openedAtLogin,
      });

      global.application.on("ready", () => {
        // this.sendUrlToApplication();

        this.sendFileToApplication();
      });
    });

    app.on("activate", () => {
      if (global.application) {
        logger.info("[Hime Display] activate");
        global.application.showPage("index");
      }
    });
  }

  handleAppWillQuit() {
    app.on("will-quit", () => {
      logger.info("[Hime Display] will-quit");
      if (global.application) {
        global.application.stop();
      }
    });
  }
}
