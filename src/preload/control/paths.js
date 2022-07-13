import { ipcRenderer } from "electron";
// console.time("control:query-database-path");
// 应用的许多后续操作必须要等到数据库加载完成，若使用异步请求可能有一定概率导致无法访问数据库报错
// 毕竟涉及到主进程通信，能少一次算一次，数据库路径到后方再拼接吧
export const APP_DATA_PATH = ipcRenderer.sendSync("control:query-data-path");
// console.timeEnd("control:query-database-path");
