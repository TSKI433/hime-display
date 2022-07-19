// 由于数据库仅在控制面板使用而不在主进程以及展示器使用，决定直接在控制面板的preload中加载数据库，减少IPC通信，优化性能
import low from "lowdb";
import lowFileSync from "lowdb/adapters/FileSync";
import fs from "fs";
import util from "util";
import path from "path";
import { defalutDatabase } from "@shared/defaults/defalutDatabase";
import { APP_DATA_PATH } from "./paths";
const APP_DATABASE_PATH = path.join(APP_DATA_PATH, "database.json");
const db = low(new lowFileSync(APP_DATABASE_PATH));
db.defaults(defalutDatabase).write();
export function value() {
  return db.value();
}
export function write(value, data) {
  db.set(value, data).write();
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
  const extensionName = path.extname(fileDir);
  switch (extensionName) {
    case ".json": {
      // 回调函数往上无法嵌套，转换成Promise
      const fileData = await util.promisify(fs.readFile)(fileDir);
      const fileJson = JSON.parse(fileData.toString());
      if (sourceTypes["Live2D"]) {
        processLive2dJson(fileDir, fileJson);
        processSpineJson(fileDir, fileJson);
      }
      break;
    }
    case ".pmx": {
      if (sourceTypes["MMD"]) {
        processPmx(fileDir);
      }
      break;
    }
    case ".vrm": {
      if (sourceTypes["VRoid"]) {
        processVrm(fileDir);
      }
      break;
    }
    case ".skel": {
      if (sourceTypes["Spine"]) {
        processSkel(fileDir);
      }
      break;
    }
    case ".vmd": {
      if (sourceTypes["motion3D"]) {
        processVmd(fileDir);
      }
      break;
    }
  }
}
function processLive2dJson(fileDir, fileJson) {
  if ("model" in fileJson) {
    writeModelInfo({
      name: splitModelName(fileDir),
      modelType: "Live2D",
      extensionName: "moc",
      // Windows下使用file:会导致路径出错，热重载开发环境下不使用file:会导致路径报错
      entranceFile:
        (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir),
      // has_motion: "motions" in fileJson ? true : false;
    });
  } else if ("FileReferences" in fileJson) {
    writeModelInfo({
      name: splitModelName(fileDir),
      modelType: "Live2D",
      extensionName: "moc3",
      entranceFile:
        (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir),
      // has_motion:"Motions" in fileJson.FileReferences ? true : false
    });
  }
}
function processPmx(fileDir) {
  writeModelInfo({
    name: splitModelName(fileDir),
    modelType: "MMD",
    extensionName: "pmx",
    entranceFile:
      (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir),
  });
}
function processVrm(fileDir) {
  writeModelInfo({
    name: splitModelName(fileDir),
    modelType: "VRoid",
    extensionName: "vrm",
    entranceFile:
      (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir),
  });
}
// todo: spine模型比较特殊，即使是加载模型，版本也不向下兼容……因此之后有必要进一步对模型版本进行判断
function processSkel(fileDir) {
  writeModelInfo({
    name: splitModelName(fileDir),
    modelType: "Spine",
    extensionName: "skel",
    entranceFile:
      (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir),
  });
}
function processSpineJson(fileDir, fileJson) {
  if ("skeleton" in fileJson && "spine" in fileJson.skeleton) {
    writeModelInfo({
      name: splitModelName(fileDir),
      modelType: "Spine",
      extensionName: "json",
      entranceFile:
        (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir),
    });
  }
}
function processVmd(fileDir) {
  writeMotion3DInfo({
    name: path.basename(fileDir),
    extensionName: "vmd",
    entranceFile:
      (import.meta.env.DEV ? "file://" : "") + path.resolve(fileDir),
  });
}
// 因为有些模型入口文件名完全没有辨识度，如model.json，以模型入口文件的的上级目录名作为模型名称
function splitModelName(fileDir) {
  // 同时切分Windows和UNIX路径
  return path.dirname(fileDir).split("/").pop().split("\\").pop();
}
function writeModelInfo(modelInfo) {
  //  防止重复写入模型数据
  if (db.get("model").findIndex(modelInfo).value() == -1) {
    db.get("model").push(modelInfo).write();
  }
}
function writeMotion3DInfo(motionInfo) {
  if (db.get("motion3D").findIndex(motionInfo).value() == -1) {
    db.get("motion3D").push(motionInfo).write();
  }
}
