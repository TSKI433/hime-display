import { EventEmitter } from "events";
import { windowsOptions } from "../options/windows";
import { BrowserWindow } from "electron";
import { logger } from "../core/Logger";
export class WindowManager extends EventEmitter {
  constructor(configDB) {
    super();
    this.configDB = configDB;
    this.windows = {
      control: null,
      display: null,
    };
    this.windowIds = {
      control: -1,
      display: -1,
    };
  }
  openWindow(windowName) {
    const pageOptions = windowsOptions[windowName];
    const pageType = pageOptions.pageType;
    if (this.windows[pageType] !== null) {
      // return new Error(`${pageType} window opened again before set to null`);
      // this.windows[pageType].show();
      return this.windows[pageType];
    }
    const window = new BrowserWindow(pageOptions.attrs);
    logger.info(
      `[Hime Display] new window created, windowName: ${windowName}, ID: ${window.webContents.id}`
    );
    this.windows[pageType] = window;
    this.windowIds[pageType] = window.webContents.id;
    window.loadURL(pageOptions.url);
    if (import.meta.env.DEV && pageOptions.dev.autoOpenDevTool) {
      window.webContents.openDevTools();
    }
    window.on("closed", () => {
      this.windows[pageType] = null;
      this.windowIds[pageType] = -1;
      this.allUpdateWindowIds();
    });
    if (windowName === "displayFullScreen") {
      window.maximize();
      window.setIgnoreMouseEvents(true, {
        forward: true,
      });
      if (this.configDB.get(["display", "keep-display-at-top"]).value()) {
        window.setAlwaysOnTop(true, "screen-saver", 1);
      }
      if (this.configDB.get(["display", "show-in-all-workspaces"]).value()) {
        window.setVisibleOnAllWorkspaces(true, {
          visibleOnFullScreen: true, //在所有窗口上显示，全屏应用也不例外
        });
      }
    }
    if (windowName === "controlPanel") {
      //保持display窗口一直处于聚焦状态，以处理鼠标事件
      // window.on("blur", () => {
      //   if (this.windows.display !== null) {
      //     this.windows.display.focus();
      //   }
      // });
    }
    this.allUpdateWindowIds();
    return this.windows[pageType];
  }
  sendMessageToWindow(windowName, message, ...args) {
    const window = this.windows[windowName];
    if (window === null) {
      return;
    }
    logger.info(`[Hime Display] send to ${windowName}: ${message}`, ...args);
    window.webContents.send(message, ...args);
  }
  allUpdateWindowIds() {
    Object.keys(this.windows).forEach((key) => {
      this.updateWindowIds(key);
    });
  }
  updateWindowIds(windowName) {
    this.sendMessageToWindow(
      windowName,
      "main:update-window-ids",
      this.windowIds
    );
  }
  // 备选方案，使用MessageChannel实现两个渲染进程的通信
  // buildMessagePort() {
  //   const { port1, port2 } = new MessageChannel();
  //   this.windows.control.webContents.postMessage("buildMessagePort", null, [
  //     port1,
  //   ]);
  //   this.windows.display.webContents.postMessage("buildMessagePort", null, [
  //     port2,
  //   ]);
  // }
}
