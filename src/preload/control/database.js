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
export function removeDataFromSourcePath(sourcePath) {
  // 不愧是lodash，极致精简语法，remove({sourcePath})，优雅啊
  // 从本源来讲，要追溯到_.matches，然后再到_.isMatch，然后再搭配上ES6的对象属性简写，最终浓缩成这个简单的语句
  ["model", "motion3D", "audio3D"].forEach((type) => {
    db.get(type).remove({ sourcePath }).write();
  });
}
export async function loadDataFromSourcePathInfo(sourcePathInfo) {
  // 已改变载入机制
  // removeRemovedSourceTypeData(sourcePathInfo);
  // await removeDeletedData(sourcePathInfo.sourcePath);

  removeDataFromSourcePath(sourcePathInfo.sourcePath);
  // 这里的await后面虽然没有任何操作，但是还是必要的，因为可以推住Promise的resolve时机，确保控制面板载入刷新以后的数据
  await loadDataFromPath(
    sourcePathInfo.sourcePath,
    sourcePathInfo.sourceTypes,
    sourcePathInfo.sourcePath
  );
}
// 造了半天我在造个寂寞，跟异步同步扯了半天有意思吗？改变思路，直接把刷新数据源的相关数据全删了重载
// // 若更改过一个数据源的sourceTypes，需要删除一些原来sourceType允许载入的数据
// function removeRemovedSourceTypeData(sourcePathInfo) {
//   db.get("model")
//     .remove(
//       (item) =>
//         item.sourcePath === sourcePathInfo.sourcePath &&
//         !sourcePathInfo.sourceTypes[item.modelType]
//     )
//     .write();
//   if (!sourcePathInfo.sourceTypes.motion3D) {
//     db.get("motion3D")
//       .remove({ sourcePath: sourcePathInfo.sourcePath })
//       .write();
//   }
//   if (!sourcePathInfo.sourceTypes.audio3D) {
//     db.get("audio3D").remove({ sourcePath: sourcePathInfo.sourcePath }).write();
//   }
// }
// // 移除目录中被删除的模型数据
// function removeDeletedData(sourcePath) {
//   const promises = [];
//   ["model", "motion3D", "audio3D"].forEach((type) => {
//     db.get(type)
//       .value()
//       .forEach((item) => {
//         if (item.sourcePath === sourcePath) {
//           promises.push(
//             new Promise((resolve) => {
//               fs.access(
//                 item.entranceFile.slice(7).split("/").join(path.sep),
//                 fs.constants.F_OK,
//                 (err) => {
//                   console.log(item.entranceFile, err);
//                   if (err) {
//                     console.log(`${item.entranceFile} is deleted`);
//                     db.get(type)
//                       .remove({ entranceFile: item.entranceFile })
//                       .write();
//                   }
//                   // 又被坑了，resolve一定要放在if之后，不然一些promise一直没有resolve，导致程序卡在这个程序的await上。
//                   resolve();
//                 }
//               );
//             })
//           );
//         }
//       });
//   });
//   return Promise.all(promises);
// }

// 后面这些函数里面带的sourcePath都是最原始，不受递归影响的那个sourcePath，用于判断一个模型由哪个源检索到的，方便跟随删除
async function loadDataFromPath(dataPath, sourceTypes, sourcePath) {
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
      detectDatabaseItem(dir, sourceTypes, sourcePath);
    }
    if (isDir) {
      //递归，如果是文件夹，就继续遍历该文件夹下面的文件
      // 这里不能在push里面写await，Promise.all应该接收一个Promise的列表
      promises.push(loadDataFromPath(dir, sourceTypes, sourcePath));
      // 这样写的话和同步都没有区别了
      // await this.refreshModelDB(dir);
    }
  }
  // console.log(sourcePath);
  // 异步的关键
  return Promise.all(promises);
}
async function detectDatabaseItem(fileDir, sourceTypes, sourcePath) {
  const extensionName = path.extname(fileDir);
  switch (extensionName) {
    case ".json": {
      // 回调函数往上无法嵌套，转换成Promise
      const fileData = await util.promisify(fs.readFile)(fileDir);
      const fileJson = JSON.parse(fileData.toString());
      if (sourceTypes["Live2D"]) {
        processLive2dJson(fileDir, fileJson, sourcePath);
        processSpineJson(fileDir, fileJson, sourcePath);
      }
      break;
    }
    case ".pmx": {
      if (sourceTypes["MMD"]) {
        processPmx(fileDir, sourcePath);
      }
      break;
    }
    case ".vrm": {
      if (sourceTypes["VRoid"]) {
        processVrm(fileDir, sourcePath);
      }
      break;
    }
    case ".skel": {
      if (sourceTypes["Spine"]) {
        processSkel(fileDir, sourcePath);
      }
      break;
    }
    case ".vmd": {
      if (sourceTypes["motion3D"]) {
        processVmd(fileDir, sourcePath);
      }
      break;
    }
    case ".fbx": {
      if (sourceTypes["motion3D"]) {
        processFbx(fileDir, sourcePath);
      }
      break;
    }
    case ".wav": {
      if (sourceTypes["audio3D"]) {
        processWav(fileDir, sourcePath);
      }
      break;
    }
    case ".mp3": {
      if (sourceTypes["audio3D"]) {
        processMp3(fileDir, sourcePath);
      }
      break;
    }
  }
}
function processLive2dJson(fileDir, fileJson, sourcePath) {
  if ("model" in fileJson) {
    writeModelInfo({
      name: splitDirName(fileDir),
      modelType: "Live2D",
      extensionName: "moc",
      entranceFile: resolveEntrancePath(fileDir),
      sourcePath,
      // has_motion: "motions" in fileJson ? true : false;
    });
  } else if ("FileReferences" in fileJson) {
    writeModelInfo({
      name: splitDirName(fileDir),
      modelType: "Live2D",
      extensionName: "moc3",
      entranceFile: resolveEntrancePath(fileDir),
      sourcePath,
      // has_motion:"Motions" in fileJson.FileReferences ? true : false
    });
  }
}
function processPmx(fileDir, sourcePath) {
  writeModelInfo({
    name: splitDirName(fileDir),
    modelType: "MMD",
    extensionName: "pmx",
    entranceFile: resolveEntrancePath(fileDir),
    sourcePath,
  });
}
function processVrm(fileDir, sourcePath) {
  writeModelInfo({
    name: splitDirName(fileDir),
    modelType: "VRoid",
    extensionName: "vrm",
    entranceFile: resolveEntrancePath(fileDir),
    sourcePath,
  });
}
// todo: spine模型比较特殊，即使是加载模型，版本也不向下兼容……因此之后有必要进一步对模型版本进行判断
function processSkel(fileDir, sourcePath) {
  writeModelInfo({
    name: splitDirName(fileDir),
    modelType: "Spine",
    extensionName: "skel",
    entranceFile: resolveEntrancePath(fileDir),
    sourcePath,
  });
}
function processSpineJson(fileDir, fileJson, sourcePath) {
  if ("skeleton" in fileJson && "spine" in fileJson.skeleton) {
    writeModelInfo({
      name: splitDirName(fileDir),
      modelType: "Spine",
      extensionName: "json",
      entranceFile: resolveEntrancePath(fileDir),
      sourcePath,
    });
  }
}
function processVmd(fileDir, sourcePath) {
  writeMotion3DInfo({
    // 根据我在B碗上的下载经验，有一些配布中都会带有多个版本的vmd，这些文件的名称都不是曲名，但没有办法，只能让用户手动改一下文件名了
    name: path.basename(fileDir),
    extensionName: "vmd",
    entranceFile: resolveEntrancePath(fileDir),
    sourcePath,
  });
}
function processFbx(fileDir, sourcePath) {
  writeMotion3DInfo({
    name: path.basename(fileDir),
    extensionName: "fbx",
    entranceFile: resolveEntrancePath(fileDir),
    sourcePath,
  });
}
function processWav(fileDir, sourcePath) {
  writeAudio3DInfo({
    name: path.basename(fileDir),
    extensionName: "wav",
    entranceFile: resolveEntrancePath(fileDir),
    sourcePath,
  });
}
function processMp3(fileDir, sourcePath) {
  writeAudio3DInfo({
    name: path.basename(fileDir),
    extensionName: "mp3",
    entranceFile: resolveEntrancePath(fileDir),
    sourcePath,
  });
}
// 因为有些模型入口文件名完全没有辨识度，如model.json，以模型入口文件的的上级目录名作为模型名称
function splitDirName(fileDir) {
  // 同时切分Windows和UNIX路径
  return path.dirname(fileDir).split("/").pop().split("\\").pop();
}
// Windows下使用file:会导致路径出错，热重载开发环境下不使用file:会导致路径报错
// Windows的路径斜杠导致MMD和Spine模型无法加载，这里统一又进行了一次斜杠的替换……Windows我忍你很久了啊，光在这个路径上这已经是第二次出问题了
function resolveEntrancePath(fileDir) {
  return (
    (import.meta.env.DEV ? "file://" : "") +
    path.resolve(fileDir).split(path.sep).join("/")
  );
}
function writeModelInfo(modelInfo) {
  //  防止重复写入模型数据
  // 现在以模型入口文件的路径作为唯一标识，如果已经存在，则不再写入。不直接用motionInfo是考虑到万一有人载入了具有包含关系的多个源路径，这会导致模型重复写入
  if (
    db
      .get("model")
      .findIndex((item) => item.entranceFile === modelInfo.entranceFile)
      .value() == -1
  ) {
    db.get("model").push(modelInfo).write();
  }
}
function writeMotion3DInfo(motionInfo) {
  if (
    db
      .get("motion3D")
      .findIndex((item) => item.entranceFile === motionInfo.entranceFile)
      .value() == -1
  ) {
    db.get("motion3D").push(motionInfo).write();
  }
}
function writeAudio3DInfo(audioInfo) {
  if (
    db
      .get("audio3D")
      .findIndex((item) => item.entranceFile === audioInfo.entranceFile)
      .value() == -1
  ) {
    db.get("audio3D").push(audioInfo).write();
  }
}
