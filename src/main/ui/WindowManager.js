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
    this.windows[page] = new BrowserWindow(pageOptions);
    return this.windows[page];
  }
}
