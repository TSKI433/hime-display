import { Vector } from "kalidokit";
const { lerp } = Vector;
function lerpBoneRotationByBone(bone, rotation, lerpRatio, dampener = 1) {
  bone.rotation.set(
    lerp(-rotation.x * dampener, bone.rotation.x, lerpRatio),
    lerp(rotation.y * dampener, bone.rotation.y, lerpRatio),
    lerp(-rotation.z * dampener, bone.rotation.z, lerpRatio)
  );
}
function lerpBonePositionByBone(bone, position, lerpRatio, dampener = 1) {
  bone.position.set(
    lerp(position.x * dampener, bone.position.x, lerpRatio),
    lerp(position.y * dampener, bone.position.y, lerpRatio),
    lerp(position.z * dampener, bone.position.z, lerpRatio)
  );
}
export { lerpBoneRotationByBone, lerpBonePositionByBone };
