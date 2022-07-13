// 几经考虑，还是把配置数据库也搬到控制面板了，IPC通信实在是麻烦了，不如直接在控制面板的preload中加载数据库
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import path from "path";
import { APP_DATA_PATH } from "./paths";
const APP_CONFIG_PATH = path.join(APP_DATA_PATH, "config.json");
const db = low(new lowFileSync(APP_CONFIG_PATH));
// 不是我想重复写代码，这个config和database绝对用不了class的继承，preload暴露的对象直接把原型链全灭了，所以只能一个一个写函数，也不用class了
export function value() {
  return db.value();
}
export function write(value, data) {
  return db.set(value, data).write();
}
