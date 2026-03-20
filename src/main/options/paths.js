import { app } from "electron";
import { resolve } from "path";
const appDir = resolve(app.getAppPath(), "..");
export const APP_DATA_PATH = resolve(appDir,"DATA");
export const APP_CONFIG_PATH = resolve(APP_DATA_PATH, "config.json");
export const APP_DATABASE_PATH = resolve(APP_DATA_PATH, "database.json");
export const CHROMIUM_PREFERENCE_PATH = resolve(APP_DATA_PATH, "Preferences");


