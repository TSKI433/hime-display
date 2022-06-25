import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import { APP_CONFIG_PATH } from "@shared/paths";
const defaultConfig = {
  "open-control-at-launch": true,
  "open-display-at-launch": true,
};
export class ConfigManager {
  constructor() {
    this.init();
  }
  init() {
    this.configDB = low(new lowFileSync(APP_CONFIG_PATH));
    this.reset();
  }
  reset() {
    this.configDB.defaults(defaultConfig).write();
  }
}
