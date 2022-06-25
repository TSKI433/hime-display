import low from "lowdb";
import lowFilrSync from "lowdb/adapters/FileSync";
import { APP_DATA_PATH } from "@shared/paths";
export class ConfigManager {
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
