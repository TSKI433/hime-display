import { resolve } from "path";
import { DEV_SERVER_PORT } from "@shared/constants";
export const windowsOptions = {
  controlPanel: {
    attrs: {
      title: "Hime Display 控制面板",
      // Windows下会有一个菜单栏的高度
      height: 519 + (process.platform == "win32" ? 55 : 0),
      width: 560,
      titleBarStyle: "hidden",
      vibrancy: "window",
      autoHideMenuBar: true,
      titleBarOverlay: true,
      // visualEffectState: "active",
      autoHideMenuBar: true,
      // skipTaskbar: true,
      // show: false,
      webPreferences: {
        // nodeIntegration: true,
        // contextIsolation: false,
        // webSecurity: false,
        devTools: import.meta.env.DEV,
        preload: resolve(__dirname, "./preload.cjs.js"),
      },
    },
    url: import.meta.env.DEV
      ? `http://localhost:${DEV_SERVER_PORT}/control/control.html`
      : "file://" + resolve(__dirname, "../control/control.html"),
  },
  displayFullScreen: {
    attrs: {
      title: "Hime Display",
      frame: false, //去除边框
      hasShadow: false, //live2d模型会动，导致阴影出问题，所以干脆不要了
      transparent: true, //让窗口透明
      autoHideMenuBar: true,
      skipTaskbar: true,
      webPreferences: {
        // nodeIntegration: true,
        // contextIsolation: false,
        // webSecurity: false,
        devTools: import.meta.env.DEV,
      },
    },
    url: import.meta.env.DEV
      ? `http://localhost:${DEV_SERVER_PORT}/display/display.html`
      : "file://" + resolve(__dirname, "../renderer/display/display.html"),
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
        // webSecurity: false,
        devTools: import.meta.env.DEV,
      },
    },
    url: import.meta.env.DEV
      ? `http://localhost:${DEV_SERVER_PORT}/display/display.html`
      : "file://" + resolve(__dirname, "../renderer/display/display.html"),
  },
};
