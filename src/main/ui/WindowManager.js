import { EventEmitter } from "events";
import { windowsOptions } from "../options/windows";
import { BrowserWindow } from "electron";
import { logger } from "../core/Logger";
export class WindowManager extends EventEmitter {
  constructor() {
    super();
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
    if (this.windows[pageOptions.pageType] !== null) {
      // return new Error(`${pageOptions.pageType} window opened again before set to null`);
      this.windows[pageOptions.pageType].show();
      return this.windows[pageOptions.pageType];
    }
    const window = new BrowserWindow(pageOptions.attrs);
    this.windows[pageOptions.pageType] = window;
    this.windowIds[pageOptions.pageType] = window.webContents.id;
    window.on("closed", () => {
      this.windows[pageOptions.pageType] = null;
      this.windowIds[pageOptions.pageType] = -1;
    });
    window.loadURL(pageOptions.url);
    if (import.meta.env.DEV && pageOptions.dev.autoOpenDevTool) {
      window.webContents.openDevTools();
    }
    if (windowName === "displayFullScreen") {
      window.maximize();
      window.setIgnoreMouseEvents(true, {
        forward: true,
      });
      window.setAlwaysOnTop(true, "screen-saver", 1);
      window.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true, //在所有窗口上显示，全屏应用也不例外
      });
    }
    if (windowName === "controlPanel") {
      //保持display窗口一直处于聚焦状态，以处理鼠标事件
      window.on("blur", () => {
        if (this.windows.display !== null) {
          this.windows.display.focus();
        }
      });
    }
    if (this.windows.control !== null && this.windows.display !== null) {
      this.infoWindowIdEachOther();
    }
    // window.once("ready-to-show", () => {
    //   window.show();
    // });
    return this.windows[pageOptions.pageType];
  }
  getAllWindows() {
    return Object.values(this.windows);
  }
  sendMessageToWindow(windowName, message, ...args) {
    const window = this.windows[windowName];
    if (window === null) {
      return;
    }
    logger.info("[Hime Display] send message:", message, ...args);
    window.webContents.send(message, ...args);
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
  // 告知双方windowId，用于直接建立渲染器进程通信
  infoWindowIdEachOther() {
    logger.info(
      "[Hime Display] Control window and display window are both opened, try to info each other"
    );
    const controlWindow = this.windows.control;
    const displayWindow = this.windows.display;
    const promises = [
      new Promise((resolve, reject) => {
        controlWindow.on("ready-to-show", () => {
          controlWindow.webContents.send("main:info-window-id", this.windowIds);
          resolve();
        });
      }),
      new Promise((resolve, reject) => {
        displayWindow.on("ready-to-show", () => {
          displayWindow.webContents.send("main:info-window-id", this.windowIds);
          resolve();
        });
      }),
    ];
    // 必须等双方都完成加载后才能确保两个渲染进程成功通信
    Promise.all(promises).then(() => {
      controlWindow.webContents.send("main:window-all-ready-to-show");
      displayWindow.webContents.send("main:window-all-ready-to-show");
    });
  }
}
