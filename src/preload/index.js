import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  showDialog: (msg) => ipcRenderer.invoke("show-dialog", msg),
});
