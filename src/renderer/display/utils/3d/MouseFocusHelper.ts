// Author: TSKI433
import { Vector3 } from "three";
// 相机绝对坐标
const cameraAbsolutePosition = new Vector3();
// object 绝对坐标
const objectAbsolutePosition = new Vector3();
const cameraToObject = new Vector3();
// 相机方向向量
const cameraDirection = new Vector3();
// 相机投射object平面的中心点与相机的距离，作为lookAt目标点计算的比例之一
let lambda;
class MouseFocusHelper {
  constructor(object, camera, ratio = 0.6) {
    // object.userData.focusPosition = focusPosition;
    // eventDOM.addEventListener("pointermove", (event) => {
    // });
    this.object = object;
    this.camera = camera;
    this.ratio = ratio;
    this.focusPosition = new Vector3();
    // 防止由于focusPosition默认在(0,0,0)导致刚载入模型时出现头拧断了也要看脚底的情况
    this.object.getWorldPosition(this.focusPosition);
  }
  update(x, y) {
    // 传入屏幕指针坐标，计算聚焦目标坐标
    this.camera.getWorldPosition(cameraAbsolutePosition);
    this.object.getWorldPosition(objectAbsolutePosition);
    cameraToObject.subVectors(objectAbsolutePosition, cameraAbsolutePosition);
    this.camera.getWorldDirection(cameraDirection);
    lambda = Math.abs(
      cameraToObject.length() *
        Math.cos(cameraToObject.angleTo(cameraDirection))
    );
    // 将focusPosition作为两向量插值结果
    this.focusPosition.lerpVectors(
      this.camera.position,
      // 将此向量(坐标)从目标相机的标准化设备坐标 (NDC) 空间投影到世界空间的最后方，再用插值运算提到前面来。可参考https://blog.csdn.net/qq_18229381/article/details/77941325
      // 屏幕坐标系的原点在左上角，对应到NDC中的值为(-1,1,1)，注意NDC用的是左手坐标系，Z轴正方向为相机前方，因此z轴的值为1
      new Vector3(
        -1 + (2 * x) / window.innerWidth,
        1 - (2 * y) / window.innerHeight,
        1
      ).unproject(this.camera),
      // 朝着相机的偏移权重，设为0将导致目标点和相机重合，设为1的话，模仿埃及壁画的你可能会期待这个效果（头部始终看向相机投射object的平面）……
      (this.ratio * lambda) / this.camera.far
    );
  }
  focus() {
    this.object.lookAt(this.focusPosition);
  }
}
export { MouseFocusHelper };
