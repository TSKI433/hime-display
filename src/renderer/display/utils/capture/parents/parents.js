// 我时候来才知道，原来自己这里在毫不知情的情况下手动实现了mixin……我之前都没听说过这个概念啊，只是想了半天，为了防止不必要的重复，然后就这么写出来了
function setTarget(target) {
  this.model = target;
}
function createVideo() {
  this.videoContainer = document.createElement("div");
  this.videoContainer.classList.add("capture__container");
  this.video = document.createElement("video");
  this.videoContainer.appendChild(this.video);
  this.video.classList.add("capture__video");
  this.canvas = document.createElement("canvas");
  this.canvasCtx = this.canvas.getContext("2d");
  this.videoContainer.appendChild(this.canvas);
  this.canvas.classList.add("capture__canvas");
  document.body.appendChild(this.videoContainer);
}
function onResults(results) {
  this.drawResults(results);
  this.animateModel(results);
}
function askForMediaAccess() {
  // 这个函数属于是返回promise但本身并不异步，同步返回异步结果……因此不用加async
  return window.nodeAPI.ipc.askForMediaAccess();
}
export { setTarget, createVideo, onResults, askForMediaAccess };
