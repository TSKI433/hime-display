import {
  Quaternion,
  Euler,
  PropertyBinding,
  Matrix4,
  Vector3,
  VectorKeyframeTrack,
  QuaternionKeyframeTrack,
} from "three";
import {
  trackRotateQuaternion,
  trackRotateQuaternionAxis,
  buildNodeStack,
} from "./utils.js";
const boneDictWithD = {
  mixamorigHips: "センター",
  mixamorigSpine: "上半身",
  // 经过实际对比，发现上半身骨骼的确应该这么对应
  mixamorigSpine1: "上半身3",
  mixamorigSpine2: "上半身2",
  mixamorigNeck: "首",
  mixamorigHead: "頭",
  // mixamorigHeadTop_End: "",
  mixamorigLeftShoulder: "左肩",
  mixamorigLeftArm: "左腕",
  mixamorigLeftForeArm: "左ひじ",
  mixamorigLeftHand: "左手首",
  mixamorigLeftHandThumb1: "左親指０",
  mixamorigLeftHandThumb2: "左親指１",
  mixamorigLeftHandThumb3: "左親指２",
  // mixamorigLeftHandThumb4: "",
  mixamorigLeftHandIndex1: "左人指１",
  mixamorigLeftHandIndex2: "左人指２",
  mixamorigLeftHandIndex3: "左人指３",
  // mixamorigLeftHandIndex4: "",
  mixamorigLeftHandMiddle1: "左中指１",
  mixamorigLeftHandMiddle2: "左中指２",
  mixamorigLeftHandMiddle3: "左中指３",
  // mixamorigLeftHandMiddle4: "",
  mixamorigLeftHandRing1: "左薬指１",
  mixamorigLeftHandRing2: "左薬指２",
  mixamorigLeftHandRing3: "左薬指３",
  // mixamorigLeftHandRing4: "",
  mixamorigLeftHandPinky1: "左小指１",
  mixamorigLeftHandPinky2: "左小指２",
  mixamorigLeftHandPinky3: "左小指３",
  // mixamorigLeftHandPinky4: "",
  mixamorigRightShoulder: "右肩",
  mixamorigRightArm: "右腕",
  mixamorigRightForeArm: "右ひじ",
  mixamorigRightHand: "右手首",
  mixamorigRightHandThumb1: "右親指０",
  mixamorigRightHandThumb2: "右親指１",
  mixamorigRightHandThumb3: "右親指２",
  // mixamorigRightHandThumb4: "",
  mixamorigRightHandIndex1: "右人指１",
  mixamorigRightHandIndex2: "右人指２",
  mixamorigRightHandIndex3: "右人指３",
  // mixamorigRightHandIndex4: "",
  mixamorigRightHandMiddle1: "右中指１",
  mixamorigRightHandMiddle2: "右中指２",
  mixamorigRightHandMiddle3: "右中指３",
  // mixamorigRightHandMiddle4: "",
  mixamorigRightHandRing1: "右薬指１",
  mixamorigRightHandRing2: "右薬指２",
  mixamorigRightHandRing3: "右薬指３",
  // mixamorigRightHandRing4: "",
  mixamorigRightHandPinky1: "右小指１",
  mixamorigRightHandPinky2: "右小指２",
  mixamorigRightHandPinky3: "右小指３",
  // mixamorigRightHandPinky4: "",
  mixamorigLeftUpLeg: "左足D",
  mixamorigLeftLeg: "左ひざD",
  mixamorigLeftFoot: "左足首D",
  mixamorigLeftToeBase: "左足先EX",
  // mixamorigLeftToe_End: "",
  mixamorigRightUpLeg: "右足D",
  mixamorigRightLeg: "右ひざD",
  mixamorigRightFoot: "右足首D",
  mixamorigRightToeBase: "右足先EX",
  // mixamorigRightToe_End: "",
};
// 骨骼的对应词典
const boneDictWithIK = {
  mixamorigHips: "センター",
  mixamorigSpine: "上半身",
  // 经过实际对比，发现上半身骨骼的确应该这么对应
  mixamorigSpine1: "上半身3",
  mixamorigSpine2: "上半身2",
  mixamorigNeck: "首",
  mixamorigHead: "頭",
  // mixamorigHeadTop_End: "",
  mixamorigLeftShoulder: "左肩",
  mixamorigLeftArm: "左腕",
  mixamorigLeftForeArm: "左ひじ",
  mixamorigLeftHand: "左手首",
  mixamorigLeftHandThumb1: "左親指０",
  mixamorigLeftHandThumb2: "左親指１",
  mixamorigLeftHandThumb3: "左親指２",
  // mixamorigLeftHandThumb4: "",
  mixamorigLeftHandIndex1: "左人指１",
  mixamorigLeftHandIndex2: "左人指２",
  mixamorigLeftHandIndex3: "左人指３",
  // mixamorigLeftHandIndex4: "",
  mixamorigLeftHandMiddle1: "左中指１",
  mixamorigLeftHandMiddle2: "左中指２",
  mixamorigLeftHandMiddle3: "左中指３",
  // mixamorigLeftHandMiddle4: "",
  mixamorigLeftHandRing1: "左薬指１",
  mixamorigLeftHandRing2: "左薬指２",
  mixamorigLeftHandRing3: "左薬指３",
  // mixamorigLeftHandRing4: "",
  mixamorigLeftHandPinky1: "左小指１",
  mixamorigLeftHandPinky2: "左小指２",
  mixamorigLeftHandPinky3: "左小指３",
  // mixamorigLeftHandPinky4: "",
  mixamorigRightShoulder: "右肩",
  mixamorigRightArm: "右腕",
  mixamorigRightForeArm: "右ひじ",
  mixamorigRightHand: "右手首",
  mixamorigRightHandThumb1: "右親指０",
  mixamorigRightHandThumb2: "右親指１",
  mixamorigRightHandThumb3: "右親指２",
  // mixamorigRightHandThumb4: "",
  mixamorigRightHandIndex1: "右人指１",
  mixamorigRightHandIndex2: "右人指２",
  mixamorigRightHandIndex3: "右人指３",
  // mixamorigRightHandIndex4: "",
  mixamorigRightHandMiddle1: "右中指１",
  mixamorigRightHandMiddle2: "右中指２",
  mixamorigRightHandMiddle3: "右中指３",
  // mixamorigRightHandMiddle4: "",
  mixamorigRightHandRing1: "右薬指１",
  mixamorigRightHandRing2: "右薬指２",
  mixamorigRightHandRing3: "右薬指３",
  // mixamorigRightHandRing4: "",
  mixamorigRightHandPinky1: "右小指１",
  mixamorigRightHandPinky2: "右小指２",
  mixamorigRightHandPinky3: "右小指３",
  // mixamorigRightHandPinky4: "",
  mixamorigLeftUpLeg: "左足",
  mixamorigLeftLeg: "左ひざ",
  mixamorigLeftFoot: "左足首",
  mixamorigLeftToeBase: "左足先EX",
  mixamorigLeftToe_End: "",
  mixamorigRightUpLeg: "右足",
  mixamorigRightLeg: "右ひざ",
  mixamorigRightFoot: "右足首",
  mixamorigRightToeBase: "右足先EX",
  // mixamorigRightToe_End: "",
};

// 直接将动画转换成非IK的数据
/**
 * @param {THREE.AnimationClip} animationClip
 * @param {Number} positionScale
 * @return {THREE.AnimationClip}
 */
function convertAnimation(
  animationClip,
  positionScale = 1,
  boneDict = boneDictWithD
) {
  const newAnimationClip = animationClip.clone();
  // 找不到的骨骼动画会被直接赋值到SkinnedMesh上，造成动画混乱，因此需要做一次筛选
  newAnimationClip.tracks = newAnimationClip.tracks.filter((track) => {
    // 使用THREE的库解析轨道名称
    const trackInfo = PropertyBinding.parseTrackName(track.name);
    const boneName = trackInfo.nodeName || trackInfo.objectIndex;
    const trackType = trackInfo.propertyName;
    // 非所需轨道直接舍弃
    if (!boneDict[boneName]) {
      return false;
    }
    // 对轨道数据进行一些预处理
    if (trackType === "quaternion") {
      switch (boneName) {
        // 手臂有45度的差距
        case "mixamorigLeftArm": {
          track.values = new Float32Array(
            trackRotateQuaternion(track.values, new Euler(0, 0, Math.PI / 4))
          );
          break;
        }
        case "mixamorigRightArm": {
          track.values = new Float32Array(
            trackRotateQuaternion(track.values, new Euler(0, 0, -Math.PI / 4))
          );
          break;
        }
        // 手臂调整后，手臂的子级旋转数据也有问题
        case "mixamorigLeftForeArm":
        case "mixamorigLeftHand": {
          track.values = new Float32Array(
            trackRotateQuaternionAxis(
              track.values,
              new Euler(0, 0, -Math.PI / 4)
            )
          );
          break;
        }
        case "mixamorigRightForeArm":
        case "mixamorigRightHand": {
          track.values = new Float32Array(
            trackRotateQuaternionAxis(
              track.values,
              new Euler(0, 0, Math.PI / 4)
            )
          );
          break;
        }
      }
    } else if (trackType === "position") {
      // 对position动画进行缩放
      track.values.forEach((value, index) => {
        track.values[index] = track.values[index] / positionScale;
      });
    }
    // 修改骨骼名称

    track.name = `.bones[${boneDict[boneName]}].${trackType}`;

    return true;
  });
  for (const clearPostionBoneName of [
    "腰",
    // 究极打脸操作，在这里给"左足ＩＫ"和"右足ＩＫ"加还原动画轨道的话，three的播放系统会自动等比例个真正的动画按1:1的比例混合，导致双腿的张开角度变为预计值的一半
    // "左足ＩＫ",
    // "右足ＩＫ",
    "左足IK親",
    "右足IK親",
  ]) {
    newAnimationClip.tracks.push(
      new VectorKeyframeTrack(
        `.bones[${clearPostionBoneName}].position`,
        [0],
        new Float32Array([0, 0, 0])
      )
    );
  }

  return newAnimationClip;
}

function convertAnimationWithIK(
  animationClip,
  positionScale = 1,
  originRootBone
) {
  const depth = 4;
  // 先得到基础的动画轨道，在进行二次转换
  const newAnimationClip = convertAnimation(
    animationClip,
    positionScale,
    boneDictWithIK
  );
  const originBoneStack = buildNodeStack(originRootBone, "dfs");
  const ikLinkDataList = [
    {
      sourceBoneName: "mixamorigRightFoot",
      baseBoneName: "mixamorigHips",
      targetIkBoneName: "右足ＩＫ",
    },
    {
      sourceBoneName: "mixamorigLeftFoot",
      baseBoneName: "mixamorigHips",
      targetIkBoneName: "左足ＩＫ",
    },
  ];
  for (const ikLinkData of ikLinkDataList) {
    // 要对foot至hips的骨骼层级进行多次访问，干脆创建一个数组
    const objectNodes = [];
    const parentMatrix = new Matrix4();
    const childMatrix = new Matrix4();
    const rebasedQuaternion = new Quaternion();
    const rebasedPosition = new Vector3();
    const sourceBone = originBoneStack.find((bone) => {
      return bone.name === ikLinkData.sourceBoneName;
    });
    let tempNode = sourceBone;
    // 循环次数为上行的深度，最大限度设为了4
    for (let i = 0; i < depth; i++) {
      objectNodes.push(tempNode);
      addAnimationTrakInfoToNode(tempNode, animationClip);
      tempNode = tempNode.parent;
    }
    const trackTimes = originRootBone.userData.keyframeTracks.position.times;
    const ikQuaternionTrackValues = [];
    const ikPositionTrackValues = [];
    // 遍历时间，生成IK动画的轨道数据
    for (const time of trackTimes) {
      for (let i = 0; i < depth; i++) {
        if (i === 0) {
          getMatrixSomeTime(objectNodes[i], time, childMatrix);
        } else {
          getMatrixSomeTime(objectNodes[i], time, parentMatrix);
          childMatrix.premultiply(parentMatrix);
        }
      }
      rebasedQuaternion.setFromRotationMatrix(childMatrix);
      rebasedPosition.setFromMatrixPosition(childMatrix);
      for (const value of rebasedQuaternion.toArray()) {
        ikQuaternionTrackValues.push(value);
      }
      for (const value of rebasedPosition.toArray()) {
        ikPositionTrackValues.push(value / positionScale);
      }
    }
    const ikPositionTrack = new VectorKeyframeTrack(
      `.bones[${ikLinkData.targetIkBoneName}].position`,
      trackTimes,
      new Float32Array(ikPositionTrackValues)
    );
    const ikQuaternionTrack = new QuaternionKeyframeTrack(
      `.bones[${ikLinkData.targetIkBoneName}].quaternion`,
      trackTimes,
      new Float32Array(ikQuaternionTrackValues)
    );
    newAnimationClip.tracks.push(ikQuaternionTrack);
    newAnimationClip.tracks.push(ikPositionTrack);
    // 排除使用IK后会对动画播放产生影响的轨道
    newAnimationClip.tracks = newAnimationClip.tracks.filter((track) => {
      const trackInfo = PropertyBinding.parseTrackName(track.name);
      const boneName = trackInfo.nodeName || trackInfo.objectIndex;
      return ![
        "左足",
        "左ひざ",
        "右足",
        "右ひざ",
        "右足先EX",
        "左足先EX",
        // "センター",
      ].includes(boneName);
    });
  }
  return newAnimationClip;
}
// 获取某个节点某时刻相对于父级的矩阵
const _q1 = new Quaternion();
const _v1 = new Vector3();
const _v2 = new Vector3();
function getMatrixSomeTime(object, time, matrix) {
  if (object.userData.keyframeTracks) {
    const positionTrack = object.userData.keyframeTracks.position;
    if (positionTrack.hasKeyframes) {
      _v1.fromArray(positionTrack.interpolant.evaluate(time));
    } else {
      // 考虑到可能涉及到没有预处理的骨骼
      _v1.fromArray(positionTrack.data);
    }
    const quaternionTrack = object.userData.keyframeTracks.quaternion;
    if (quaternionTrack.hasKeyframes) {
      _q1.fromArray(quaternionTrack.interpolant.evaluate(time));
    } else {
      _q1.fromArray(quaternionTrack.data);
    }
    const scaleTrack = object.userData.keyframeTracks.scale;
    if (scaleTrack.hasKeyframes) {
      _v2.fromArray(scaleTrack.interpolant.evaluate(time));
    } else {
      _v2.fromArray(scaleTrack.data);
    }
  } else {
    _v1.copy(object.position);
    _q1.copy(object.quaternion);
    _v2.copy(object.scale);
  }
  matrix.compose(_v1, _q1, _v2);
}
// 将动画数据关联至骨骼用于之后解析，和上方的函数配合使用
function addAnimationTrakInfoToNode(node, animationClip) {
  node.userData.keyframeTracks = {};
  for (const track of animationClip.tracks) {
    const trackInfo = PropertyBinding.parseTrackName(track.name);
    const targetBone = trackInfo.nodeName || trackInfo.objectIndex;
    if (targetBone === node.name) {
      const trackItem = {};
      // trackItem.type = trackInfo.propertyName;
      trackItem.hasKeyframes = true;
      trackItem.times = track.times;
      trackItem.values = track.values;
      // 之后会用到这个东西计算插值
      trackItem.interpolant = track.createInterpolant();
      node.userData.keyframeTracks[trackInfo.propertyName] = trackItem;
    }
  }
  // 统一规范，为没有关键帧的数据创建轨道
  for (const tranfromPropertyName of ["position", "quaternion", "scale"]) {
    if (!node.userData.keyframeTracks[tranfromPropertyName]) {
      const trackItem = {};
      // trackItem.type = tranfromPropertyName;
      trackItem.hasKeyframes = false;
      trackItem.data = node[tranfromPropertyName].toArray();
      node.userData.keyframeTracks[tranfromPropertyName] = trackItem;
    }
  }
}
export { convertAnimation, convertAnimationWithIK };
