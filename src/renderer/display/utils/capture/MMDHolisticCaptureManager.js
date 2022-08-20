import { HolisticCaptureManager } from "./HolisticCaptureManager.js";
import {
  rigFace,
  lerpMorphTargetByName,
  lerpBoneRotationByBone,
  lerpBonePositionByBone,
  getBoneNode,
} from "./rig/MMDRig.js";
const poseRigList = [
  { boneName: "上半身", rigName: "Spine" },
  { boneName: "左腕", rigName: "LeftUpperArm" },
  { boneName: "左ひじ", rigName: "LeftLowerArm" },
  { boneName: "右腕", rigName: "RightUpperArm" },
  { boneName: "右ひじ", rigName: "RightLowerArm" },
  { boneName: "左足", rigName: "LeftUpperLeg" },
  { boneName: "左ひざ", rigName: "LeftLowerLeg" },
  { boneName: "右足", rigName: "RightUpperLeg" },
  { boneName: "右ひざ", rigName: "RightLowerLeg" },
];
const leftHandRigList = [
  { boneName: "左手首", rigName: "LeftWrist" },
  { boneName: "左親指０", rigName: "LeftThumbProximal" },
  { boneName: "左親指１", rigName: "LeftThumbIntermediate" },
  { boneName: "左親指２", rigName: "LeftThumbDistal" },
  { boneName: "左人指１", rigName: "LeftIndexProximal" },
  { boneName: "左人指２", rigName: "LeftIndexIntermediate" },
  { boneName: "左人指３", rigName: "LeftIndexDistal" },
  { boneName: "左中指１", rigName: "LeftMiddleProximal" },
  { boneName: "左中指２", rigName: "LeftMiddleIntermediate" },
  { boneName: "左中指３", rigName: "LeftMiddleDistal" },
  { boneName: "左薬指１", rigName: "LeftRingProximal" },
  { boneName: "左薬指２", rigName: "LeftRingIntermediate" },
  { boneName: "左薬指３", rigName: "LeftRingDistal" },
  { boneName: "左小指１", rigName: "LeftLittleProximal" },
  { boneName: "左小指２", rigName: "LeftLittleIntermediate" },
  { boneName: "左小指３", rigName: "LeftLittleDistal" },
];
const rightHandRigList = [
  { boneName: "右手首", rigName: "RightWrist" },
  { boneName: "右親指０", rigName: "RightThumbProximal" },
  { boneName: "右親指１", rigName: "RightThumbIntermediate" },
  { boneName: "右親指２", rigName: "RightThumbDistal" },
  { boneName: "右人指１", rigName: "RightIndexProximal" },
  { boneName: "右人指２", rigName: "RightIndexIntermediate" },
  { boneName: "右人指３", rigName: "RightIndexDistal" },
  { boneName: "右中指１", rigName: "RightMiddleProximal" },
  { boneName: "右中指２", rigName: "RightMiddleIntermediate" },
  { boneName: "右中指３", rigName: "RightMiddleDistal" },
  { boneName: "右薬指１", rigName: "RightRingProximal" },
  { boneName: "右薬指２", rigName: "RightRingIntermediate" },
  { boneName: "右薬指３", rigName: "RightRingDistal" },
  { boneName: "右小指１", rigName: "RightLittleProximal" },
  { boneName: "右小指２", rigName: "RightLittleIntermediate" },
  { boneName: "右小指３", rigName: "RightLittleDistal" },
];
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
    for (const rigItem of poseRigList) {
      this.lerpBoneRotationByBone(
        this.getBoneNode(rigItem.boneName),
        riggedPose[rigItem.rigName],
        lerpRatio
      );
    }
  }
  rigLeftHand(riggedLeftHand, lerpRatio = 0.5) {
    for (const rigItem of leftHandRigList) {
      this.lerpBoneRotationByBone(
        this.getBoneNode(rigItem.boneName),
        riggedLeftHand[rigItem.rigName],
        lerpRatio
      );
    }
  }
  rigRightHand(riggedRightHand, lerpRatio = 0.5) {
    for (const rigItem of rightHandRigList) {
      this.lerpBoneRotationByBone(
        this.getBoneNode(rigItem.boneName),
        riggedRightHand[rigItem.rigName],
        lerpRatio
      );
    }
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
