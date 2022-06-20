import { EventEmitter } from "events";
import { windowsOptions } from "../options/windows";
import { BrowserWindow } from "electron";
export class WindowManager extends EventEmitter {
  constructor() {
    super();
    this.windows = {};
  }
  openWindow(page, options) {
    const pageOptions = windowsOptions[page];
    this.windows[page] = new BrowserWindow(pageOptions.attrs);
    if (pageOptions.url) {
      window.loadURL(pageOptions.url);
    }
    return this.windows[page];
  }
}
