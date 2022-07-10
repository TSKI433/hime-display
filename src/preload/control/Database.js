// 由于数据库仅在控制面板使用而不在主进程以及展示器使用，决定直接在控制面板的preload中加载数据库，减少IPC通信，优化性能
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import fs from "fs";
import util from "util";
import path from "path";
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
export function push(value, data) {
  return db.get(value).push(data).write();
}
export function write(value, data) {
  return db.set(value, data).write();
}
export async function loadDataFromSourcePathInfo(sourcePathInfo) {
  await loadDataFromPath(sourcePathInfo.sourcePath, sourcePathInfo.sourceTypes);
}
async function loadDataFromPath(dataPath, sourceTypes) {
  //根据文件路径读取文件，返回文件列表
  // 全部使用箭头函数，确保this对象可以传进去
  const files = await util.promisify(fs.readdir)(dataPath);
  let promises = [];
  //遍历读取到的文件列表
  // 为了保证顶级的Promise在所有目录读取结束后再返回，这里无法使用forEach，因为这样以来就无法await了，直接在里面forEach里面async整活也做不到让顶级的一步函数等着
  for (const filename of files) {
    //获取当前文件的绝对路径
    const dir = path.join(dataPath, filename);
    //根据文件路径获取文件信息，返回一个fs.Stats对象
    const stats = await util.promisify(fs.stat)(dir);
    const isFile = stats.isFile(); //是文件
    const isDir = stats.isDirectory(); //是文件夹
    if (isFile) {
      //是文件
      detectDatabaseItem(dir, sourceTypes);
    }
    if (isDir) {
      //递归，如果是文件夹，就继续遍历该文件夹下面的文件
      // 这里不能在push里面写await，Promise.all应该接收一个Promise的列表
      promises.push(loadDataFromPath(dir, sourceTypes));
      // 这样写的话和同步都没有区别了
      // await this.refreshModelDB(dir);
    }
  }
  // console.log(sourcePath);
  // 异步的关键
  return Promise.all(promises);
}
async function detectDatabaseItem(fileDir, sourceTypes) {
  if (path.extname(fileDir) == ".json") {
    // 回调函数往上无法嵌套，转换成Promise
    const fileData = await util.promisify(fs.readFile)(fileDir);
    const fileJson = JSON.parse(fileData.toString());
    if (sourceTypes["live2d"]) {
      processLive2dJson(fileDir, fileJson);
    }
  }
}
function processLive2dJson(fileDir, fileJson) {
  const live2dModelInfo = {};
  if ("model" in fileJson) {
    // 同时切分Windows和UNIX路径
    live2dModelInfo.name = path
      .dirname(fileDir)
      .split("/")
      .pop()
      .split("\\")
      .pop();
    live2dModelInfo.modelType = "live2d";
    live2dModelInfo.extentionName = "moc";
    live2dModelInfo.entranceFile =
      // Windows下使用file:会导致路径出错，热重载开发环境下不使用file:会导致路径报错
      (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir);
    // live2dModelInfo.has_motion = "motions" in fileJson ? true : false;
    writeModelInfo(live2dModelInfo);
  } else if ("FileReferences" in fileJson) {
    live2dModelInfo.name = path
      .dirname(fileDir)
      .split("/")
      .pop()
      .split("\\")
      .pop();
    live2dModelInfo.modelType = "live2d";
    live2dModelInfo.extentionName = "moc3";
    live2dModelInfo.entranceFile =
      (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir);
    // live2dModelInfo.has_motion =
    //   "Motions" in fileJson.FileReferences ? true : false;
    // console.log(live2dModelInfo);
    writeModelInfo(live2dModelInfo);
  }
}
function writeModelInfo(modelInfo) {
  //  防止重复写入模型数据
  if (db.get("model").findIndex(modelInfo).value() == -1) {
    db.get("model").push(modelInfo).write();
  }
}
