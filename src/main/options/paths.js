import { app } from "electron";
import { resolve } from "path";
export const APP_DATA_PATH = app.getPath("userData");
export const APP_CONFIG_PATH = resolve(APP_DATA_PATH, "config.json");
export const APP_DATABASE_PATH = resolve(APP_DATA_PATH, "database.json");
export const CHROMIUM_PREFERENCE_PATH = resolve(APP_DATA_PATH, "Preferences");
