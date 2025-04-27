import { HolisticCaptureManager } from "./HolisticCaptureManager.js";
import {
  rigFace,
  lerpMorphTargetByName,
  lerpBoneRotationByBone,
  lerpBonePositionByBone,
  getBoneNode,
} from "./rig/VRoidRig.js";

const poseRigList = [
  { boneName: "leftUpperArm", rigName: "LeftUpperArm" },
  { boneName: "leftLowerArm", rigName: "LeftLowerArm" },
  { boneName: "leftUpperLeg", rigName: "LeftUpperLeg" },
  { boneName: "leftLowerLeg", rigName: "LeftLowerLeg" },
  { boneName: "rightUpperArm", rigName: "RightUpperArm" },
  { boneName: "rightLowerArm", rigName: "RightLowerArm" },
  { boneName: "rightUpperLeg", rigName: "RightUpperLeg" },
  { boneName: "rightLowerLeg", rigName: "RightLowerLeg" },
];
const leftHandRigList = [
  { boneName: "leftHand", rigName: "LeftWrist" },
  { boneName: "leftThumbProximal", rigName: "LeftThumbProximal" },
  /* 抽象，VRM1.0怎么开始跟骨架结构较劲起来了，vrm.humanoid.normalizedHumanBones中，leftThumbIntermediate消失了，多了个leftThumbMetacarpal
   Metacarpal：最靠近手腕的，掌骨
   Proximal：第一节指骨
   Intermediate：第二节指骨
   Distal：第三节指骨，即指尖
   我也不是很了解，但貌似拇指的确没有第二节的Intermediate
   那从这个道理上来讲可能需要这么对应：
   | 从手腕数起 | 拇指rigName  | VRM1.0拇指boneName |
   | :--------: | :----------: | :----------------: |
   |   第一节   |   Proximal   |     Metacarpal     |
   |   第二节   | Intermediate |      Proximal      |
   |   第三节   |    Distal    |       Distal       |
   没学过人体，上方纯瞎猜，但现在反正全身捕捉效果很炸裂，姑且先将leftThumbIntermediate更名为leftThumbMetacarpal，右手同理
   */
  { boneName: "leftThumbMetacarpal", rigName: "LeftThumbIntermediate" },
  { boneName: "leftThumbDistal", rigName: "LeftThumbDistal" },
  { boneName: "leftIndexProximal", rigName: "LeftIndexProximal" },
  { boneName: "leftIndexIntermediate", rigName: "LeftIndexIntermediate" },
  { boneName: "leftIndexDistal", rigName: "LeftIndexDistal" },
  { boneName: "leftMiddleProximal", rigName: "LeftMiddleProximal" },
  { boneName: "leftMiddleIntermediate", rigName: "LeftMiddleIntermediate" },
  { boneName: "leftMiddleDistal", rigName: "LeftMiddleDistal" },
  { boneName: "leftRingProximal", rigName: "LeftRingProximal" },
  { boneName: "leftRingIntermediate", rigName: "LeftRingIntermediate" },
  { boneName: "leftRingDistal", rigName: "LeftRingDistal" },
  { boneName: "leftLittleProximal", rigName: "LeftLittleProximal" },
  { boneName: "leftLittleIntermediate", rigName: "LeftLittleIntermediate" },
  { boneName: "leftLittleDistal", rigName: "LeftLittleDistal" },
];
const rightHandRigList = [
  { boneName: "rightHand", rigName: "RightWrist" },
  { boneName: "rightThumbProximal", rigName: "RightThumbProximal" },
  { boneName: "rightThumbMetacarpal", rigName: "RightThumbIntermediate" },
  { boneName: "rightThumbDistal", rigName: "RightThumbDistal" },
  { boneName: "rightIndexProximal", rigName: "RightIndexProximal" },
  { boneName: "rightIndexIntermediate", rigName: "RightIndexIntermediate" },
  { boneName: "rightIndexDistal", rigName: "RightIndexDistal" },
  { boneName: "rightMiddleProximal", rigName: "RightMiddleProximal" },
  { boneName: "rightMiddleIntermediate", rigName: "RightMiddleIntermediate" },
  { boneName: "rightMiddleDistal", rigName: "RightMiddleDistal" },
  { boneName: "rightRingProximal", rigName: "RightRingProximal" },
  { boneName: "rightRingIntermediate", rigName: "RightRingIntermediate" },
  { boneName: "rightRingDistal", rigName: "RightRingDistal" },
  { boneName: "rightLittleProximal", rigName: "RightLittleProximal" },
  { boneName: "rightLittleIntermediate", rigName: "RightLittleIntermediate" },
  { boneName: "rightLittleDistal", rigName: "RightLittleDistal" },
];
export class VRoidHolisticCaptureManager extends HolisticCaptureManager {
  constructor() {
    super();
  }
  readyToRig() {
    this.model.pose();
  }
  // 全身捕捉不需要进行上半身的连带旋转操作
  rigHead(rotation, lerpRatio) {
    rotation.x *= -1;
    rotation.z *= -1;
    this.lerpBoneRotationByBone(this.getBoneNode("head"), rotation, lerpRatio);
  }
  rigPose(riggedPose, lerpRatio = 0.5) {
    riggedPose.Hips.position.y += this.getBoneNode("hips").position.y;
    this.lerpBoneRotationByBone(
      this.getBoneNode("hips"),
      riggedPose.Hips.rotation,
      lerpRatio
    );
    this.lerpBonePositionByBone(
      this.getBoneNode("hips"),
      riggedPose.Hips.position,
      lerpRatio
    );
    for (const rigItem of poseRigList) {
      // 针对VRoid的角度反转
      riggedPose[rigItem.rigName].x *= -1;
      riggedPose[rigItem.rigName].z *= -1;
      this.lerpBoneRotationByBone(
        this.getBoneNode(rigItem.boneName),
        riggedPose[rigItem.rigName],
        lerpRatio
      );
    }
  }
  rigLeftHand(riggedLeftHand, lerpRatio = 0.5) {
    for (const rigItem of leftHandRigList) {
      riggedLeftHand[rigItem.rigName].x *= -1;
      riggedLeftHand[rigItem.rigName].z *= -1;
      this.lerpBoneRotationByBone(
        this.getBoneNode(rigItem.boneName),
        riggedLeftHand[rigItem.rigName],
        lerpRatio
      );
    }
  }
  rigRightHand(riggedRightHand, lerpRatio = 0.5) {
    for (const rigItem of rightHandRigList) {
      riggedRightHand[rigItem.rigName].x *= -1;
      riggedRightHand[rigItem.rigName].z *= -1;
      this.lerpBoneRotationByBone(
        this.getBoneNode(rigItem.boneName),
        riggedRightHand[rigItem.rigName],
        lerpRatio
      );
    }
  }
}
VRoidHolisticCaptureManager.prototype.rigFace = rigFace;
VRoidHolisticCaptureManager.prototype.lerpMorphTargetByName =
  lerpMorphTargetByName;
VRoidHolisticCaptureManager.prototype.lerpBoneRotationByBone =
  lerpBoneRotationByBone;
VRoidHolisticCaptureManager.prototype.lerpBonePositionByBone =
  lerpBonePositionByBone;
VRoidHolisticCaptureManager.prototype.getBoneNode = getBoneNode;
