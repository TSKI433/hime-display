import { nativeTheme } from "electron";
import { EventEmitter } from "events";
export class ThemeManager extends EventEmitter {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.handelEvents();
  }
  handelEvents() {
    nativeTheme.on("updated", () => {
      this.emit("system-theme-change", this.getSystemTheme());
    });
  }
  getSystemTheme() {
    return nativeTheme.shouldUseDarkColors ? "dark" : "light";
  }
}
