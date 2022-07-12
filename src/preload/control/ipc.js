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
