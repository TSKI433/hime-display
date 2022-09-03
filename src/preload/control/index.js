import { contextBridge } from "electron";
import { shell } from "electron";
import * as database from "./database";
import * as config from "./config";
import * as ipc from "./ipc";
import "./theme";
contextBridge.exposeInMainWorld("nodeAPI", {
  database,
  config,
  ipc,
  showInFolder,
  openLink,
});
function showInFolder(path) {
  shell.showItemInFolder(path);
}
function openLink(link) {
  shell.openExternal(link);
}
