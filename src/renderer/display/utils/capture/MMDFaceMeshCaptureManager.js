import { FaceMeshCaptureManager } from "./FaceMeshCaptureManager.js";
import { Vector } from "kalidokit";
const { lerp } = Vector;
export class MMDFaceMeshCaptureManager extends FaceMeshCaptureManager {
  constructor() {
    super();
  }
  readyToRig() {
    this.model.pose();
    this.upperBodyBone = this._getBoneNode("上半身");
    this.headBone = this._getBoneNode("頭");
    // 让手臂放得更自然一点
    this._getBoneNode("右腕").rotation.z = 0.5;
    this._getBoneNode("左腕").rotation.z = -0.5;
  }
  rigFace(riggedFace, lerpRatio = 0.5) {
    this.lerpMorphTargetByName("ウィンク２", 1 - riggedFace.eye.l, lerpRatio);
    this.lerpMorphTargetByName("ウィンク２右", 1 - riggedFace.eye.r, lerpRatio);
    this.lerpMorphTargetByName("あ", riggedFace.mouth.shape.A, lerpRatio);
    this.lerpMorphTargetByName("い", riggedFace.mouth.shape.I, lerpRatio);
    this.lerpMorphTargetByName("う", riggedFace.mouth.shape.U, lerpRatio);
    this.lerpMorphTargetByName("え", riggedFace.mouth.shape.E, lerpRatio);
    this.lerpMorphTargetByName("お", riggedFace.mouth.shape.O, lerpRatio);
    this.rigHeadLinkBody(riggedFace.head, lerpRatio);
    // const atama = this.model.skeleton.bones.find((b) => b.name === "頭");
    // atama.rotation.set(
    //   lerp(-riggedFace.head.x, atama.rotation.x, lerpRatio),
    //   lerp(riggedFace.head.y, atama.rotation.y, lerpRatio),
    //   lerp(-riggedFace.head.z, atama.rotation.z, lerpRatio)
    // );
  }
  lerpMorphTargetByName(name, value, lerpRatio) {
    const morphTargetIndex = this.model.morphTargetDictionary[name];
    if (morphTargetIndex === undefined) {
      console.warn(
        `MotionCaptureManager: morph target ${name} not found in the skinned mesh`
      );
      return;
    }
    this.model.morphTargetInfluences[morphTargetIndex] = lerp(
      value,
      this.model.morphTargetInfluences[morphTargetIndex],
      lerpRatio
    );
  }
  // lerpBoneRotationByName(boneName, rotation, lerpRatio = 0.5) {
  //   const bone = this._getBoneNode(boneName);
  //   if (bone === null) {
  //     return;
  //   }
  //   bone.rotation.set(
  //     lerp(-rotation.x, bone.rotation.x, lerpRatio),
  //     lerp(rotation.y, bone.rotation.y, lerpRatio),
  //     lerp(-rotation.z, bone.rotation.z, lerpRatio)
  //   );
  // }
  lerpBoneRotationByBone(bone, rotation, lerpRatio) {
    bone.rotation.set(
      lerp(-rotation.x, bone.rotation.x, lerpRatio),
      lerp(rotation.y, bone.rotation.y, lerpRatio),
      lerp(-rotation.z, bone.rotation.z, lerpRatio)
    );
  }
  rigHeadLinkBody(rotation, lerpRatio, bodyLinkRatio = 0.2) {
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
  _getBoneNode(boneName) {
    const bone = this.model.skeleton.bones.find((b) => b.name === boneName);
    if (bone === undefined) {
      console.warn(
        `MotionCaptureManager: bone ${boneName} not found in the skinned mesh`
      );
      return null;
    }
    return bone;
  }
}
