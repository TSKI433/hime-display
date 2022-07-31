import { HolisticCaptureManager } from "./HolisticCaptureManager.js";
import {
  rigFace,
  lerpMorphTargetByName,
  lerpBoneRotationByBone,
  getBoneNode,
} from "./rig/MMDRig.js";
export class MMDHolisticCaptureManager extends HolisticCaptureManager {
  constructor() {
    super();
  }
  readyToRig() {
    this.model.pose();
    this.upperBodyBone = this.getBoneNode("上半身");
    this.headBone = this.getBoneNode("頭");
  }
  // 全身捕捉不需要进行上半身的连带旋转操作
  rigHead(rotation, lerpRatio) {
    this.lerpBoneRotationByBone(
      this.headBone,
      {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
      },
      lerpRatio
    );
  }
  rigPose(riggedPose, lerpRatio = 0.5) {
    riggedPose.LeftUpperArm.z -= Math.PI / 4;
    riggedPose.RightUpperArm.z += Math.PI / 4;
    this.lerpBoneRotationByBone(
      this.getBoneNode("上半身"),
      riggedPose.Spine,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左腕"),
      riggedPose.LeftUpperArm,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左ひじ"),
      riggedPose.LeftLowerArm,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右腕"),
      riggedPose.RightUpperArm,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右ひじ"),
      riggedPose.RightLowerArm,
      lerpRatio
    );

    this.lerpBoneRotationByBone(
      this.getBoneNode("左足"),
      riggedPose.LeftUpperLeg,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左ひざ"),
      riggedPose.LeftLowerLeg,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右足"),
      riggedPose.RightUpperLeg,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右ひざ"),
      riggedPose.RightLowerLeg,
      lerpRatio
    );
  }
}
MMDHolisticCaptureManager.prototype.rigFace = rigFace;
MMDHolisticCaptureManager.prototype.lerpMorphTargetByName =
  lerpMorphTargetByName;
MMDHolisticCaptureManager.prototype.lerpBoneRotationByBone =
  lerpBoneRotationByBone;
MMDHolisticCaptureManager.prototype.getBoneNode = getBoneNode;
