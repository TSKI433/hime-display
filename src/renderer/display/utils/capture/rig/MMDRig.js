import { Vector, Face } from "kalidokit";
const { lerp } = Vector;
function rigFace(riggedFace, lerpRatio = 0.5) {
  // 使用Kalidokit提供的stabilizeBlink对眨眼进行进一步优化，还有得进一步考虑wink的启动机制，ウィンク与まばたき变形的关系有待考虑，目前先全部改用まばたき变形
  const BlinkMorphIndex = this.model.morphTargetDictionary["まばたき"];
  // debugger;
  if (BlinkMorphIndex === undefined) {
    console.warn(
      `MotionCaptureManager: morph target まばたき not found in the skinned mesh`
    );
  } else {
    const lerpedEye = {
      l: lerp(
        riggedFace.eye.l,
        1 - this.model.morphTargetInfluences[BlinkMorphIndex],
        lerpRatio
      ),
      r: lerp(
        riggedFace.eye.r,
        1 - this.model.morphTargetInfluences[BlinkMorphIndex],
        lerpRatio
      ),
    };
    // 我认为这里不需要用headY做一道判断，就直接将其赋值为0了
    const stabilizedEye = Face.stabilizeBlink(lerpedEye, 0);
    this.model.morphTargetInfluences[BlinkMorphIndex] =
      1 - (stabilizedEye.l + stabilizedEye.r) / 2;
  }

  // this.lerpMorphTargetByName("ウィンク２", 1 - riggedFace.eye.l, lerpRatio);
  // this.lerpMorphTargetByName("ウィンク２右", 1 - riggedFace.eye.r, lerpRatio);
  this.lerpMorphTargetByName("あ", riggedFace.mouth.shape.A, lerpRatio);
  this.lerpMorphTargetByName("い", riggedFace.mouth.shape.I, lerpRatio);
  this.lerpMorphTargetByName("う", riggedFace.mouth.shape.U, lerpRatio);
  this.lerpMorphTargetByName("え", riggedFace.mouth.shape.E, lerpRatio);
  this.lerpMorphTargetByName("お", riggedFace.mouth.shape.O, lerpRatio);
  this.rigHead(riggedFace.head, lerpRatio);
}
function lerpMorphTargetByName(name, value, lerpRatio) {
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
function lerpBoneRotationByBone(bone, rotation, lerpRatio, dampener = 1) {
  bone.rotation.set(
    lerp(-rotation.x * dampener, bone.rotation.x, lerpRatio),
    lerp(rotation.y * dampener, bone.rotation.y, lerpRatio),
    lerp(-rotation.z * dampener, bone.rotation.z, lerpRatio)
  );
}
function getBoneNode(boneName) {
  if (this.boneStore[boneName] === undefined) {
    const bone = this.model.skeleton.bones.find((b) => b.name === boneName);
    if (bone === undefined) {
      console.warn(
        `MotionCaptureManager: bone ${boneName} not found in the skinned mesh`
      );
      return null;
    }
    this.boneStore[boneName] = bone;
    return bone;
  } else {
    return this.boneStore[boneName];
  }
}
export { rigFace, lerpMorphTargetByName, lerpBoneRotationByBone, getBoneNode };
