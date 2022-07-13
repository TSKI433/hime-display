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
    // 无需再做判断，因为两窗口若是真的已经连接，必定不会触发loaded事件
    // 不过其实有另一种思路可以用这个变量，让每个窗口加载时主动发送消息判断连接状态，没这么做是因为之前没有考虑到，其实刷新页面后窗口ID不变……现在这个机制即使窗口ID变了都没问题。不过我也担心这种方案在两页面同时启动时会因为一个页面未加载完成导致没有建立连接
    // this.isControlAndDisplayLinked = false;
    this.isControlAndDisplayLinking = false;
  }
  openWindow(windowName) {
    const pageOptions = windowsOptions[windowName];
    const pageType = pageOptions.pageType;
    if (this.windows[pageType] !== null) {
      // return new Error(`${pageType} window opened again before set to null`);
      this.windows[pageType].show();
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
      if (pageType === "display" && this.windows.control !== null) {
        // this.isControlAndDisplayLinked = false;
        this.windows.control.webContents.send("main:display-window-closed");
      } else if (pageType === "control" && this.windows.display !== null) {
        // this.isControlAndDisplayLinked = false;
        this.windows.display.webContents.send("main:control-window-closed");
      }
    });
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
    // 见buildControlDisplayLink函数声明
    window.isReadyToShow = false;
    window.once("ready-to-show", () => {
      window.isReadyToShow = true;
    });
    // 为了应对页面没有关闭，而是刷新的情况，重新更改了逻辑
    // if (this.windows.control !== null && this.windows.display !== null) {
    //   this.buildControlDisplayLink();
    // }
    return this.windows[pageType];
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
  buildControlDisplayLink() {
    // 判断isControlAndDisplayLinking主要是为了处理第一个页面触发buildControlDisplayLink时还没完成连接，第二个页面再次出发该函数的情况
    if (
      this.isControlAndDisplayLinking ||
      this.windows.control === null ||
      this.windows.display === null
    ) {
      return;
    }
    this.isControlAndDisplayLinking = true;
    logger.info(
      "[Hime Display] Control window and display window are both opened, try to info each other"
    );
    /*
    实操发现，如果使用window.webContents.send()在ready-to-show事件之前直接发送消息，预加载脚本里设定监听器可以收到，但浏览器上下文中设定监听器收不到，这将导致两窗口无法正常建立通信，因此这里设定了ready-to-show监听器
    然而，还存在一种情况，有一个窗口早就创建了，ready-to-show事件早就触发了，因此在openWindow函数里，创建窗口后立马设定了ready-to-show的监听器，改变isReadyToShow的值，用于此处的判断
    */
    const promises = [];
    Object.entries(this.windows).forEach(([key, window]) => {
      promises.push(
        new Promise((resolve, reject) => {
          if (window.isReadyToShow) {
            logger.info(
              `[Hime Display] ${key} window is already ready to show`
            );
            window.webContents.send(
              "main:ready-renderer-communication",
              this.windowIds
            );
            resolve();
          } else {
            window.on("ready-to-show", () => {
              logger.info(`[Hime Display] ${key} window is just ready to show`);
              window.webContents.send(
                "main:ready-renderer-communication",
                this.windowIds
              );
              resolve();
            });
          }
        })
      );
    });
    // 必须等双方都完成加载后才能确保两个渲染进程成功通信
    Promise.all(promises).then(() => {
      // this.isControlAndDisplayLinked = true;
      Object.values(this.windows).forEach((window) => {
        window.webContents.send("main:window-all-ready-to-show");
        this.isControlAndDisplayLinking = false;
      });
    });
  }
}
