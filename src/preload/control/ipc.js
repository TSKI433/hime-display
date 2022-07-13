import { ipcRenderer } from "electron";
// 建立窗口连接转由渲染进程发起，因为刷新页面不会触发主进程里的ready-to-show事件
export function controlWindowLoaded() {
  ipcRenderer.send("control:control-window-loaded");
}
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
export function handleReadyRendererCommunication(callback) {
  ipcRenderer.on("main:ready-renderer-communication", callback);
}
export function handleWindowAllReadyToShow(callback) {
  ipcRenderer.once("main:window-all-ready-to-show", callback);
}
export function handleDisplayWindowClosed(callback) {
  ipcRenderer.once("main:display-window-closed", callback);
}
export function displayTest(displayWindowId) {
  ipcRenderer.sendTo(displayWindowId, "control:test");
}
export function loadModel(displayWindowId, modelInfo) {
  ipcRenderer.sendTo(displayWindowId, "control:load-model", modelInfo);
}
