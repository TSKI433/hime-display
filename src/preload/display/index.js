import { contextBridge } from "electron";
contextBridge.exposeInMainWorld("nodeAPI", {
  abc: "456",
});
