import { ipcRenderer } from "electron";
export function selectPath() {
  return ipcRenderer.invoke("control:select-path", "controlPanel");
}
export function launchDisplayWindow() {
  ipcRenderer.send("control:launch-display-window");
}
export function handleInfoWindowId(callback) {
  ipcRenderer.on("main:info-window-id", callback);
}
export function handleWindowAllReadyToShow(callback) {
  ipcRenderer.on("main:window-all-ready-to-show", callback);
}
export function sendToDisplay(...args) {
  ipcRenderer.sendTo(...args);
}
