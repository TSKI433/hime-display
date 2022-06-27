import { app } from "electron";
import { resolve } from "path";
export const APP_DATA_PATH = app.getPath("userData");
export const APP_CONFIG_PATH = resolve(APP_DATA_PATH, "config.json");
export const APP_MODEL_DB_PATH = resolve(APP_DATA_PATH, "modelDB.json");
