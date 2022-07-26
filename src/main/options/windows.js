import { resolve } from "path";
import { DEV_SERVER_PORT } from "@shared/constants";
export const windowsOptions = {
  controlPanel: {
    attrs: {
      title: "Hime Display 控制面板",
      height: 600,
      width: 700,
      titleBarStyle: "hidden",
      vibrancy: "menu",
      autoHideMenuBar: true,
      titleBarOverlay: true,
      // visualEffectState: "active",
      // skipTaskbar: true,
      // show: false,
      webPreferences: {
        // nodeIntegration: true,
        // contextIsolation: false,
        // webSecurity: false,
        devTools: import.meta.env.DEV,
        preload: resolve(__dirname, "./control-preload.cjs.js"),
      },
    },
    url: import.meta.env.DEV
      ? `http://localhost:${DEV_SERVER_PORT}/control/control.html`
      : "file://" + resolve(__dirname, "../control/control.html"),
    dev: {
      autoOpenDevTool: true,
    },
    pageType: "control",
  },
  displayFullScreen: {
    attrs: {
      title: "Hime Display",
      frame: false, //去除边框
      hasShadow: false, //live2d模型会动，导致阴影出问题，所以干脆不要了
      transparent: true, //让窗口透明
      autoHideMenuBar: true,
      skipTaskbar: true,
      roundedCorners: false, //去除边角圆角，本来就是要占满整个屏幕的，stats面板被圆角弄掉一块实在有点难看
      webPreferences: {
        // nodeIntegration: true,
        // contextIsolation: false,
        // 便于访问本地文件
        webSecurity: false,
        devTools: import.meta.env.DEV,
        preload: resolve(__dirname, "./display-preload.cjs.js"),
      },
    },
    url: import.meta.env.DEV
      ? `http://localhost:${DEV_SERVER_PORT}/display/display.html`
      : "file://" + resolve(__dirname, "../renderer/display/display.html"),
    dev: {
      autoOpenDevTool: true,
    },
    pageType: "display",
  },
  displayWindowed: {
    attrs: {
      title: "Hime Display",
      // frame: false, //去除边框
      // hasShadow: false, //live2d模型会动，导致阴影出问题，所以干脆不要了
      // transparent: true, //让窗口透明
      // autoHideMenuBar: true,
      // skipTaskbar: true,
      webPreferences: {
        // nodeIntegration: true,
        // contextIsolation: false,
        webSecurity: false,
        devTools: import.meta.env.DEV,
        preload: resolve(__dirname, "./display-preload.cjs.js"),
      },
    },
    url: import.meta.env.DEV
      ? `http://localhost:${DEV_SERVER_PORT}/display/display.html`
      : "file://" + resolve(__dirname, "../renderer/display/display.html"),
    dev: {
      autoOpenDevTool: true,
    },
    pageType: "display",
  },
};
