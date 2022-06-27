import { contextBridge } from "electron";
contextBridge.exposeInMainWorld("NodeAPI", {
  abc: "456",
});
