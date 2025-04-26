import { ipcRenderer } from "electron";
export function selectPath() {
  return ipcRenderer.invoke("control2main:select-path", "controlPanel");
}
export function launchDisplayWindow() {
  ipcRenderer.send("control2main:launch-display-window");
}
export function relaunchDisplayWindow() {
  ipcRenderer.send("control2main:relaunch-display-window");
}
export function closeDisplayWindow() {
  ipcRenderer.send("control2main:close-display-window");
}
export function queryWindowIds() {
  return ipcRenderer.invoke("control2main:query-window-ids");
}
export function handleUpdateWindowIds(callback) {
  ipcRenderer.on("main2control&display:update-window-ids", callback);
}
export function receiveModelControlInfo(callback) {
  ipcRenderer.once("display2control:model-control-info", callback);
}
export function handleSendToModelControl(callback) {
  console.log("handleSendToModelControl");
  ipcRenderer.on("display2control:send-to-model-control", callback);
}
export function removeManagerListeners() {
  ipcRenderer.removeAllListeners("display2control:send-to-model-control");
}
export function openDevTool(type) {
  ipcRenderer.send("control2main:open-dev-tool", type);
}
export function changeLanguage(language) {
  ipcRenderer.send("control2main:change-language", language);
}
export function handleDisplayWindowState(callback) {
  ipcRenderer.once("display2control:send-display-window-state", callback);
}
export function handleDisplayWindowError(callback) {
  ipcRenderer.on("display2control:error", callback);
}

export function loadModel(modelInfo) {
  ipcRenderer.send("control2display:load-model", modelInfo);
}

export function sendToModelManager(message) {
  ipcRenderer.send("control2display:send-to-model-manager", message);
}

export function queryDisplayWindowState() {
  ipcRenderer.send("control2display:query-display-window-state");
}
