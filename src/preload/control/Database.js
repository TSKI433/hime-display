// 由于数据库仅在控制面板使用而不在主进程以及展示器使用，决定直接在控制面板的preload中加载数据库，减少IPC通信，优化性能
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import { ipcRenderer } from "electron";
import { defalutDatabase } from "./defalutDatabase";
// console.time("application:query-database-path");
// 应用的许多后续操作必须要等到数据库加载完成，若使用异步请求可能有一定概率导致无法访问数据库报错
const APP_DATABASE_PATH = ipcRenderer.sendSync(
  "application:query-database-path"
);
// console.timeEnd("application:query-database-path");
const db = low(new lowFileSync(APP_DATABASE_PATH));
db.defaults(defalutDatabase).write();

export function read() {
  db.read();
}

export function get(value) {
  return db.get(value).value();
}
