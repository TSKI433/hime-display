import { ipcRenderer } from "electron";
export function selectPath() {
  return ipcRenderer.invoke("application:select-path", "controlPanel");
}
export function launchDisplayWindow() {
  ipcRenderer.send("application:launch-display-window");
}
