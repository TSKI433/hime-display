import { ipcRenderer } from "electron";
ipcRenderer.on("control:test", () => {
  console.log("control:test");
});
export function handleLoadModel(callback) {
  ipcRenderer.on("control:load-model", callback);
}
