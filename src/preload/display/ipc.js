import { ipcRenderer } from "electron";
ipcRenderer.on("control:test", () => {
  console.log("control:test");
});
