import { ipcRenderer } from "electron";
ipcRenderer.on("ping", () => {
  console.log("pong");
});
