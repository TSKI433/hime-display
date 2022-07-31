import { HolisticCaptureManager } from "./HolisticCaptureManager.js";
import {
  rigFace,
  lerpMorphTargetByName,
  lerpBoneRotationByBone,
  lerpBonePositionByBone,
  getBoneNode,
} from "./rig/MMDRig.js";
export class MMDHolisticCaptureManager extends HolisticCaptureManager {
  constructor() {
    super();
    this.boneStore = {};
  }
  readyToRig() {
    this.model.pose();
  }
  // 全身捕捉不需要进行上半身的连带旋转操作
  rigHead(rotation, lerpRatio) {
    this.lerpBoneRotationByBone(this.getBoneNode("頭"), rotation, lerpRatio);
  }
  rigPose(riggedPose, lerpRatio = 0.5) {
    riggedPose.LeftUpperArm.z -= Math.PI / 4;
    riggedPose.RightUpperArm.z += Math.PI / 4;
    riggedPose.Hips.position.x *= 10;
    riggedPose.Hips.position.y *= 10;
    riggedPose.Hips.position.y += this.getBoneNode("センター").position.y;
    riggedPose.Hips.position.z *= 10;
    this.lerpBoneRotationByBone(
      this.getBoneNode("センター"),
      riggedPose.Hips.rotation,
      lerpRatio
    );
    this.lerpBonePositionByBone(
      this.getBoneNode("センター"),
      riggedPose.Hips.position,
      lerpRatio
    );
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
  rigLeftHand(riggedLeftHand, lerpRatio = 0.5) {
    this.lerpBoneRotationByBone(
      this.getBoneNode("左手首"),
      riggedLeftHand.LeftWrist,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左親指０"),
      riggedLeftHand.LeftThumbProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左親指１"),
      riggedLeftHand.LeftThumbIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左親指２"),
      riggedLeftHand.LeftThumbDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左人指１"),
      riggedLeftHand.LeftIndexProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左人指２"),
      riggedLeftHand.LeftIndexIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左人指３"),
      riggedLeftHand.LeftIndexDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左中指１"),
      riggedLeftHand.LeftMiddleProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左中指２"),
      riggedLeftHand.LeftMiddleIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左中指３"),
      riggedLeftHand.LeftMiddleDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左薬指１"),
      riggedLeftHand.LeftRingProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左薬指２"),
      riggedLeftHand.LeftRingIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左薬指３"),
      riggedLeftHand.LeftRingDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左小指１"),
      riggedLeftHand.LeftLittleProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左小指２"),
      riggedLeftHand.LeftLittleIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("左小指３"),
      riggedLeftHand.LeftLittleDistal,
      lerpRatio
    );
  }
  rigRightHand(riggedRightHand, lerpRatio = 0.5) {
    this.lerpBoneRotationByBone(
      this.getBoneNode("右手首"),
      riggedRightHand.RightWrist,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右親指０"),
      riggedRightHand.RightThumbProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右親指１"),
      riggedRightHand.RightThumbIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右親指２"),
      riggedRightHand.RightThumbDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右人指１"),
      riggedRightHand.RightIndexProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右人指２"),
      riggedRightHand.RightIndexIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右人指３"),
      riggedRightHand.RightIndexDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右中指１"),
      riggedRightHand.RightMiddleProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右中指２"),
      riggedRightHand.RightMiddleIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右中指３"),
      riggedRightHand.RightMiddleDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右薬指１"),
      riggedRightHand.RightRingProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右薬指２"),
      riggedRightHand.RightRingIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右薬指３"),
      riggedRightHand.RightRingDistal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右小指１"),
      riggedRightHand.RightLittleProximal,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右小指２"),
      riggedRightHand.RightLittleIntermediate,
      lerpRatio
    );
    this.lerpBoneRotationByBone(
      this.getBoneNode("右小指３"),
      riggedRightHand.RightLittleDistal,
      lerpRatio
    );
  }
}
MMDHolisticCaptureManager.prototype.rigFace = rigFace;
MMDHolisticCaptureManager.prototype.lerpMorphTargetByName =
  lerpMorphTargetByName;
MMDHolisticCaptureManager.prototype.lerpBoneRotationByBone =
  lerpBoneRotationByBone;
MMDHolisticCaptureManager.prototype.lerpBonePositionByBone =
  lerpBonePositionByBone;
MMDHolisticCaptureManager.prototype.getBoneNode = getBoneNode;
