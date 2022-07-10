import { ipcRenderer } from "electron";
export function selectPath() {
  return ipcRenderer.invoke("application:select-path", "controlPanel");
}
