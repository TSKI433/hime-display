import { getCurrentDateString } from "@display/utils/common";
// 尝试过实现录屏
// 浏览器直接录制出来的webm没有时长信息，要想录制gif之类的更是麻烦，而且原始数据的最开始几毫秒超级的糊
// 尝试把ffmpeg.wasm弄进来，发现转码速度很慢（虽然可以-c copy），但占用三四十MB实现个这种功能，感觉没有必要
// 截图的话可以获取具有alpha通道的png，录屏就让用户使用专门的软件的录制吧
export class RecordManager {
  constructor(app) {
    this.app = app;
  }
  takeScreenshot() {
    const app = this.app;
    console.log("[Hime Display] Screenshot");
    app.canvas.toBlob((blob) => {
      this.saveFile(blob, `${this.getFileName()}.png`);
    }, "image/png");
  }
  getFileName() {
    return `HimeDisplay ${app.currentModelInfo.name} ${getCurrentDateString()}`;
  }
  saveFile(blob, name) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
