import { EventEmitter } from "events";
import { windowsOptions } from "../options/windows";
import { BrowserWindow } from "electron";
import { logger } from "../core/Logger";
import is from "electron-is";
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
    // 此标识主要用于展示器判断自身类型
    window.windowName = windowName;
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
        // 之前这个级别太高了，搞不好会出大问题……
        // window.setAlwaysOnTop(true, "screen-saver", 1);
        // 对于macOS而言，默认的层级已经足够了，但Windows在该层级下无法置顶
        if (is.macOS()) {
          window.setAlwaysOnTop(true);
        } else {
          window.setAlwaysOnTop(true, "screen-saver");
        }
      }

      switch (this.configDB.get(["display", "display-range"]).value()) {
        case "singleDesktop": {
          break;
        }
        case "allDesktops": {
          window.setVisibleOnAllWorkspaces(true);
          break;
        }
        case "allWorkspaces": {
          window.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true, //在所有窗口上显示，全屏应用也不例外，目前已证实这个操作会带来一些问题，例如菜单栏无法正确显示，好像跟内部的进程转换有关
            // 实测该项目设定为true时，在全屏状态下窗口不会显示
            // skipTransformProcessType: true,
          });
          break;
        }
      }
    }
    if (windowName === "controlPanel") {
      if (this.configDB.get(["general", "open-control-at-launch"]).value()) {
        window.once("ready-to-show", () => {
          window.show();
        });
      }
      //保持display窗口一直处于聚焦状态，以处理鼠标事件
      window.on("blur", () => {
        if (this.windows.display?.windowName === "displayFullScreen") {
          this.windows.display.focus();
        }
      });
      // 更改机制，目前控制面板永远不会被关闭，只会隐藏
      window.on("close", (event) => {
        event.preventDefault();
        window.hide();
      });
    }
    // 为实现启动展示器自动加载之前的模型，需要在这里关闭事件通知，因为展示器窗口是在启动触发下方函数时，展示器只是开始加载了，并不一定准备好了接受消息，这时告知控制面板展示器已经准备好了的话，控制面板发送的消息无法被接收到
    // this.allUpdateWindowIds();
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
      "main2control&display:update-window-ids",
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
