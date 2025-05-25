import { ipcRenderer } from "electron";
export function handleLoadModel(callback) {
  ipcRenderer.on("control2display:load-model", callback);
}
export function queryWindowIds() {
  return ipcRenderer.invoke("display2main:query-window-ids");
}
export function handleUpdateWindowIds(callback) {
  ipcRenderer.on("main2control&display:update-window-ids", callback);
}
export function queryConfig() {
  // 尬住了，这里请求配置是后续操作的基础，必须要用同步请求
  // 然而electron的API里，ipcRenderer有sendTo，但是没有sendSyncTo，也没有invokeTo……用成sendTo本来就是考虑到之后通信频率比较高，不想走主进程的中继，这里请求要等待相应，实在没办法，不然要实现类似invokeTo的话，大概得这么写：
  // return new Promise((resolve, reject) => {
  //   ipcRenderer.sendTo(controlWindowId, "display2main:query-config");
  //   ipcRenderer.once("control-resopnce:query-config", (event, config) => {
  //     resolve(config);
  //   });
  // });
  // config数据主进程也有，这里还是invoke主进程吧
  return ipcRenderer.invoke("display2main:query-config");
}

export function handleSendToModelManager(callback) {
  ipcRenderer.on("control2display:send-to-model-manager", callback);
}
export function askForMediaAccess() {
  return ipcRenderer.invoke("display2main:ask-for-media-access");
}
export function setIgnoreMouseEvents(...args) {
  ipcRenderer.send("display2main:set-ignore-mouse-events", ...args);
}

export function handleQueryDisplayWindowState(callback) {
  ipcRenderer.on("control2display:query-display-window-state", callback);
}

export function sendModelControlInfo(modelControlInfo) {
  ipcRenderer.send("display2control:model-control-info", modelControlInfo);
}

export function sendToModelControl(message) {
  ipcRenderer.send("display2control:send-to-model-control", message);
}

export function sendDisplayWindowState(state) {
  ipcRenderer.send("display2control:send-display-window-state", state);
}

export function throwError(message) {
  ipcRenderer.send("display2control:error", message);
}

export function handleScreenshot(callback) {
  ipcRenderer.on("control2display:screenshot", callback);
}
