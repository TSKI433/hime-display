import { Application } from "@display/Application";
window.app = new Application();
const ipcAPI = window.nodeAPI.ipc;
window.onerror = function (message) {
  //   console.log(message, source, lineno, colno, error);
  ipcAPI.throwError(app.controlWindowId, message);
};
// 上方法的操作无法捕获异步函数里面的错误
window.addEventListener("unhandledrejection", function (event) {
  ipcAPI.throwError(app.controlWindowId, event.reason.message);
});
