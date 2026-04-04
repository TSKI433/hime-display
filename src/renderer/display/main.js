// 路径修复补丁 - 必须在所有代码之前运行
import '../../patches/fixLive2DModuleFilePath.js';
import { Application } from "@display/Application";

window.app = new Application();
const ipcAPI = window.nodeAPI.ipc;
window.onerror = function (message) {
  //   console.log(message, source, lineno, colno, error);
  ipcAPI.throwError(message);
};
// 上方法的操作无法捕获异步函数里面的错误
window.addEventListener("unhandledrejection", function (event) {
  ipcAPI.throwError(event.reason.message);
});
