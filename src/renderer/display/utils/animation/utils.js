import {
  VectorKeyframeTrack,
  Quaternion,
  Vector3,
  Matrix4,
  Euler,
} from "three";
const _q1 = new Quaternion();
const _q2 = new Quaternion();
const _v1 = new Vector3();
const _e = new Euler();
// 创建清除父子级间所有初始位置的轨道
/**
 * @param {THREE.Object3D} childNode
 * @param {THREE.Object3D} parentNode
 */
function createClearPositionTrack(childNode, parentNode) {
  const tracks = [];
  let tmpNode = childNode;
  //   防止使用while进入死循环
  for (let i = 0; i < 5; i++) {
    if (tmpNode === parentNode) {
      break;
    } else {
      tracks.push(
        new VectorKeyframeTrack(
          `${nameData.ikName}.position`,
          [0],
          new Float32Array([0, 0, 0])
        )
      );
      if (tmpNode.parent === null) {
        break;
      }
      tmpNode = tmpNode.parent;
    }
  }
  return tracks;
}
// 以根骨骼为入口，构建骨骼列表
/**
 * @param {THREE.Object3D} rootNode
 * @param {String} mode
 */
function buildNodeStack(rootNode, mode = "dfs") {
  // 深度优先
  if (mode === "dfs") {
    if (!rootNode.isObject3D) {
      throw new Error("buildNodeStack: input rootNode is not THREE.Object3D.");
    }
    const nodes = [];
    if (rootNode != null) {
      const stack = [];
      stack.push(rootNode);
      while (stack.length != 0) {
        const item = stack.pop();
        nodes.push(item);
        const children = item.children;
        for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
      }
    }

    return nodes;
  } else if (mode === "bfs") {
    // 广度优先
    if (!rootNode.isObject3D) {
      throw new Error("buildNodeStack: input rootNode is not THREE.Object3D.");
    }
    const nodes = [];
    const queue = [];
    queue.unshift(rootNode);
    while (queue.length !== 0) {
      const node = queue.shift();
      nodes.push(node);
      node.children.forEach((child) => {
        queue.push(child);
      });
    }
    return nodes;
  } else {
    throw new Error("buildNodeStack: Unsupported build mode.");
  }
}
/**
 * @param {THREE.KeyframeTrack} quaternionList
 * @param {THREE.Euler} eulerAngle
 */
// 为旋转动画轨道添加预旋转
// 主要用于处理手臂默认姿态相差45度的问题
function trackRotateQuaternion(quaternionList, eulerAngle) {
  _q1.setFromEuler(eulerAngle);
  _q1.normalize();
  const convertedList = [];
  for (let i = 0, l = quaternionList.length / 4; i < l; i++) {
    _q2.fromArray(quaternionList, 4 * i);
    _q2.multiply(_q1);
    for (const value of _q2.toArray()) {
      convertedList.push(value);
    }
  }
  return convertedList;
}
// 为旋转动画轨道旋转四元数转轴
// 主要用于处理手臂相差45度后，手臂子级旋转错误的问题
/**
 * @param {THREE.KeyframeTrack} quaternionList
 * @param {THREE.Euler} eulerAngle
 */
function trackRotateQuaternionAxis(quaternionList, eulerAngle) {
  const convertedList = [];
  for (let i = 0, l = quaternionList.length / 4; i < l; i++) {
    _v1.fromArray(quaternionList, 4 * i);
    _v1.applyEuler(eulerAngle);
    for (const value of _v1.toArray()) {
      convertedList.push(value);
    }
    convertedList.push(quaternionList[4 * i + 3]);
  }
  return convertedList;
}
// VRM模型导入后Y轴有180度旋转，需要重新调整动画
function trackRevertXZ(quaternionList) {
  const convertedList = [];
  for (let i = 0, l = quaternionList.length / 4; i < l; i++) {
    // 对轨道数据进行Z轴旋转变换
    _q1.fromArray(quaternionList, 4 * i);
    _e.setFromQuaternion(_q1);
    _e.x *= -1;
    _e.z *= -1;
    _q1.setFromEuler(_e);
    for (const value of _q1.toArray()) {
      convertedList.push(value);
    }
  }
  return convertedList;
}
//   新增函数，获取相对某父级的变换矩阵
function getRelativeMatrix(node, targetParentName) {
  const relativeMatrix = new Matrix4();
  relativeMatrix.copy(node.matrix);
  let tempNode = node;
  //   不用while，防止因意外情况陷入死循环
  for (let i = 0; i < 7; i++) {
    if (tempNode.name === targetParentName || tempNode.parent === null) {
      break;
    }
    relativeMatrix.premultiply(tempNode.parent.matrix);
    tempNode = tempNode.parent;
  }
  return relativeMatrix;
}
// 获取模型中心位置的高度
function getBaseCenterHeight(obj, type) {
  switch (type) {
    case "mixamo": {
      // mixamo网站导出动画可以选择是否包含Skin，下方这种写法无论是否包含skin都没有问题
      return obj.children.find((bone) => bone.name === "mixamorigHips").position
        .y;
    }
    case "mmd": {
      // mmd模型在腰部到顶级的好几个层级上都可能有高度数据
      return _v1.setFromMatrixPosition(
        getRelativeMatrix(
          obj.skeleton.bones.find((bone) => bone.name === "腰"),
          "全ての親"
        )
      ).y;
    }
    case "vrm": {
      return obj.humanoid.humanBones.hips[0].node.position.y;
    }
  }
}
export {
  createClearPositionTrack,
  buildNodeStack,
  trackRotateQuaternion,
  trackRotateQuaternionAxis,
  trackRevertXZ,
  getRelativeMatrix,
  getBaseCenterHeight,
};
