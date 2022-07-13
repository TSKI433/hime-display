import { ipcRenderer } from "electron";
// 建立窗口连接转由渲染进程发起，因为刷新页面不会触发主进程里的ready-to-show事件
export function displayWindowLoaded() {
  ipcRenderer.send("display:display-window-loaded");
}
ipcRenderer.on("control:test", () => {
  console.log("control:test");
});
export function handleLoadModel(callback) {
  ipcRenderer.on("control:load-model", callback);
}
