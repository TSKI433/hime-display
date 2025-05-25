import { Vector, Face } from "kalidokit";
const { lerp } = Vector;
function rigFace(riggedFace, lerpRatio = 0.5) {
  const lerpedEye = {
    l: lerp(
      riggedFace.eye.l,
      1 - this.model.vrm.expressionManager.getValue("blink"),
      lerpRatio
    ),
    r: lerp(
      riggedFace.eye.r,
      1 - this.model.vrm.expressionManager.getValue("blink"),
      lerpRatio
    ),
  };
  // 我认为这里不需要用headY做一道判断，就直接将其赋值为0了
  const stabilizedEye = Face.stabilizeBlink(lerpedEye, 0);
  this.model.vrm.expressionManager.setValue(
    "blink",
    1 - (stabilizedEye.l + stabilizedEye.r) / 2
  );
  this.lerpMorphTargetByName("aa", riggedFace.mouth.shape.A, lerpRatio);
  this.lerpMorphTargetByName("ih", riggedFace.mouth.shape.I, lerpRatio);
  this.lerpMorphTargetByName("ou", riggedFace.mouth.shape.U, lerpRatio);
  this.lerpMorphTargetByName("ee", riggedFace.mouth.shape.E, lerpRatio);
  this.lerpMorphTargetByName("oh", riggedFace.mouth.shape.O, lerpRatio);
  this.rigHead(riggedFace.head, lerpRatio);
}
function lerpMorphTargetByName(name, value, lerpRatio) {
  this.model.vrm.expressionManager.setValue(
    name,
    lerp(value, this.model.vrm.expressionManager.getValue(name), lerpRatio)
  );
}
function getBoneNode(boneName) {
  // 搞不懂three-vrm的那个VRMSchema.HumanoidBoneName想干什么，官方提供的驼峰大小写转换器是吧……
  // this.model.vrm.humanoid.getBoneNode()
  const bone = this.model.vrm.humanoid.normalizedHumanBones[boneName];
  if (bone === undefined) {
    console.warn(
      `MotionCaptureManager: bone ${boneName} not found in the skinned mesh`
    );
    return null;
  }
  return bone.node;
}

export { rigFace, lerpMorphTargetByName, getBoneNode };
export { lerpBoneRotationByBone, lerpBonePositionByBone } from "./3DRig.js";
