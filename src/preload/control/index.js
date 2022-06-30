import { contextBridge } from "electron";
import * as database from "./Database";
contextBridge.exposeInMainWorld("nodeAPI", {
  database,
});
