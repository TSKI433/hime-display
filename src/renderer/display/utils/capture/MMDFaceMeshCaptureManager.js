import { FaceMeshCaptureManager } from "./FaceMeshCaptureManager.js";

import {
  rigFace,
  lerpMorphTargetByName,
  lerpBoneRotationByBone,
  getBoneNode,
} from "./rig/MMDRig.js";

export class MMDFaceMeshCaptureManager extends FaceMeshCaptureManager {
  constructor() {
    super();
  }
  readyToRig() {
    this.model.pose();
    this.upperBodyBone = this.getBoneNode("上半身");
    this.headBone = this.getBoneNode("頭");
    // 让手臂放得更自然一点
    this.getBoneNode("右腕").rotation.z = 0.5;
    this.getBoneNode("左腕").rotation.z = -0.5;
  }

  rigHead(rotation, lerpRatio, bodyLinkRatio = 0.2) {
    // 让上半身会跟着头部联动，由于头部为上半身的子节点，因此上半身已完成的旋转要从头部除掉
    this.lerpBoneRotationByBone(
      this.headBone,
      {
        x: rotation.x * (1 - bodyLinkRatio),
        y: rotation.y * (1 - bodyLinkRatio),
        z: rotation.z * (1 - bodyLinkRatio),
      },
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.upperBodyBone,
      {
        x: rotation.x * bodyLinkRatio,
        y: rotation.y * bodyLinkRatio,
        z: rotation.z * bodyLinkRatio,
      },
      lerpRatio
    );
  }
  // lerpBoneRotationByName(boneName, rotation, lerpRatio = 0.5) {
  //   const bone = this.getBoneNode(boneName);
  //   if (bone === null) {
  //     return;
  //   }
  //   bone.rotation.set(
  //     lerp(-rotation.x, bone.rotation.x, lerpRatio),
  //     lerp(rotation.y, bone.rotation.y, lerpRatio),
  //     lerp(-rotation.z, bone.rotation.z, lerpRatio)
  //   );
  // }
}
MMDFaceMeshCaptureManager.prototype.rigFace = rigFace;
MMDFaceMeshCaptureManager.prototype.lerpMorphTargetByName =
  lerpMorphTargetByName;
MMDFaceMeshCaptureManager.prototype.lerpBoneRotationByBone =
  lerpBoneRotationByBone;
MMDFaceMeshCaptureManager.prototype.getBoneNode = getBoneNode;
