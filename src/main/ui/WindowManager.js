import { EventEmitter } from "events";
import { windowsOptions } from "../options/windows";
import { BrowserWindow } from "electron";
import { logger } from "../core/Logger";
export class WindowManager extends EventEmitter {
  constructor() {
    super();
    this.windows = {};
  }
  openWindow(windowName) {
    if (this.windows[windowName] !== undefined) {
      return this.windows[windowName];
    }
    const pageOptions = windowsOptions[windowName];
    const window = new BrowserWindow(pageOptions.attrs);
    this.windows[windowName] = window;
    if (pageOptions.url) {
      window.loadURL(pageOptions.url);
    }
    if (import.meta.env.DEV) {
      if (pageOptions.dev.autoOpenDevTool) {
        window.webContents.openDevTools();
      }
    }
    // window.once("ready-to-show", () => {
    //   window.show();
    // });
    return this.windows[windowName];
  }

  getAllWindows() {
    return Object.values(this.windows);
  }
  sendMessageToWindow(window, message, ...args) {
    if (!window) {
      return;
    }
    logger.info("[Hime Display] send message:", message, ...args);
    window.webContents.send(message, ...args);
  }
  sendMessageToAllWindow(message, ...args) {
    this.getAllWindows().forEach((window) => {
      this.sendMessageToWindow(window, message, ...args);
    });
  }
}
