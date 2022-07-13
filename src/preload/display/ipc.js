import { ipcRenderer } from "electron";
export function handleLoadModel(callback) {
  ipcRenderer.on("control:load-model", callback);
}
export function queryWindowIds() {
  return ipcRenderer.invoke("display:query-window-ids");
}
export function handleUpdateWindowIds(callback) {
  ipcRenderer.on("main:update-window-ids", callback);
}
