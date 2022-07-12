import { contextBridge } from "electron";
import * as ipc from "./ipc";
contextBridge.exposeInMainWorld("nodeAPI", {
  ipc,
});
