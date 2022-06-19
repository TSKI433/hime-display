import is from "electron-is";
import Store from "electron-store";
export class ConsfigManager {
  constructor() {
    this.systemConfig = {};
    this.userConfig = {};
    this.init();
  }
  init() {
    this.initSystemConfig();
    this.initUserConfig();
  }
  initSystemConfig() {}
  initUserConfig() {}
}
