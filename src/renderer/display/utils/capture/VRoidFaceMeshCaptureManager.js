import { FaceMeshCaptureManager } from "./FaceMeshCaptureManager.js";
import {
  rigFace,
  lerpMorphTargetByName,
  lerpBoneRotationByBone,
  getBoneNode,
} from "./rig/VRoidRig.js";
export class VRoidFaceMeshCaptureManager extends FaceMeshCaptureManager {
  constructor() {
    super();
    // VRM内部有一套骨骼获取体系，这里无需再做引用缓存
  }
  readyToRig() {
    //   这个pose方法是为了统一规范手动添加的
    this.model.pose();
    // 让手臂放得更自然一点
    this.getBoneNode("rightUpperArm").rotation.z = -1;
    this.getBoneNode("leftUpperArm").rotation.z = 1;
  }
  rigHead(rotation, lerpRatio, bodyLinkRatio = 0.2) {
    // 让上半身会跟着头部联动，由于头部为上半身的子节点，因此上半身已完成的旋转要从头部除掉
    // 解决VRoid的Y轴反转问题
    rotation.x *= -1;
    rotation.z *= -1;
    this.lerpBoneRotationByBone(
      this.getBoneNode("head"),
      rotation,
      lerpRatio,
      1 - bodyLinkRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("spine"),
      rotation,
      lerpRatio,
      bodyLinkRatio
    );
  }
}
VRoidFaceMeshCaptureManager.prototype.rigFace = rigFace;
VRoidFaceMeshCaptureManager.prototype.lerpMorphTargetByName =
  lerpMorphTargetByName;
VRoidFaceMeshCaptureManager.prototype.lerpBoneRotationByBone =
  lerpBoneRotationByBone;
VRoidFaceMeshCaptureManager.prototype.getBoneNode = getBoneNode;
