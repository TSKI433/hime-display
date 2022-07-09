import { ipcRenderer } from "electron";
export async function selectPath() {
  return await ipcRenderer.invoke("application:select-path", "controlPanel");
}
