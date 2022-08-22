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
export function receiveModelControlInfo(callback) {
  ipcRenderer.once("display:model-control-info", callback);
}
export function sendToModelManager(displayWindowId, message) {
  ipcRenderer.sendTo(displayWindowId, "control:send-to-model-manager", message);
}
export function handleSendToModelControl(callback) {
  console.log("handleSendToModelControl");
  ipcRenderer.on("display:send-to-model-control", callback);
}
export function removeManagerListeners() {
  ipcRenderer.removeAllListeners("display:send-to-model-control");
}
export function openDevTool(type) {
  ipcRenderer.send("control:open-dev-tool", type);
}
export function changeLanguage(language) {
  ipcRenderer.send("control:change-language", language);
}
