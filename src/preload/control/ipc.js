import { ipcRenderer } from "electron";
export function selectPath() {
  return ipcRenderer.invoke("control:select-path", "controlPanel");
}
export function launchDisplayWindow() {
  ipcRenderer.send("control:launch-display-window");
}
export function handleReadyRendererCommunication(callback) {
  ipcRenderer.on("main:ready-renderer-communication", callback);
}
export function handleWindowAllReadyToShow(callback) {
  ipcRenderer.once("main:window-all-ready-to-show", callback);
}
export function displayTest(displayWindowId) {
  ipcRenderer.sendTo(displayWindowId, "control:test");
}
