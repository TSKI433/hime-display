// 由于数据库仅在控制面板使用而不在主进程以及展示器使用，决定直接在控制面板的preload中加载数据库，减少IPC通信，优化性能
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import { ipcRenderer } from "electron";
import { defalutDatabase } from "./defalutDatabase";
// console.time("query-database-path");
const APP_DATABASE_PATH = ipcRenderer.sendSync("query-database-path");
// console.timeEnd("query-database-path");
const db = low(new lowFileSync(APP_DATABASE_PATH));
db.defaults(defalutDatabase).write();
export function read() {
  db.read();
}
export function get(value) {
  return db.get(value).value();
}
