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
    const window = new BrowserWindow(pageOptions.attrs);
    this.windows[page] = window;
    if (pageOptions.url) {
      window.loadURL(pageOptions.url);
    }
    // window.once("ready-to-show", () => {
    //   window.show();
    // });
    return this.windows[page];
  }
}
