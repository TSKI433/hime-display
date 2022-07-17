import { ipcRenderer } from "electron";
export function selectPath() {
  return ipcRenderer.invoke("control:select-path", "controlPanel");
}
export function launchDisplayWindow() {
  ipcRenderer.send("control:launch-display-window");
}
export function relaunchDisplayWindow() {
  ipcRenderer.send("control:relaunch-display-window");
}
export function closeDisplayWindow() {
  ipcRenderer.send("control:close-display-window");
}
export function queryWindowIds() {
  return ipcRenderer.invoke("control:query-window-ids");
}
export function handleUpdateWindowIds(callback) {
  ipcRenderer.on("main:update-window-ids", callback);
}
export function loadModel(displayWindowId, modelInfo) {
  ipcRenderer.sendTo(displayWindowId, "control:load-model", modelInfo);
}
export function receiveModelControlData(callback) {
  ipcRenderer.once("display:model-control-data", callback);
}
