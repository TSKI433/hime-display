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
export { setTarget, createVideo, onResults };
