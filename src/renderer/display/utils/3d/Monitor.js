class TransformMonitor {
  constructor() {
    this.transform = null;
    this.isJustBined = false;
  }
  bind(target) {
    this.target = target;
    // 下方的transform数值是大多数节点的默认状态，此情况下，下方检查时不会由于transform数值不同而触发changed
    // 此布尔值用于强制更新参数，覆盖控制面板中上一个节点的参数
    this.isJustBined = true;
    this.transform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
  }
  checkUpdate() {
    let changed = false;
    if (this.isJustBined) {
      this.isJustBined = false;
      changed = true;
    }
    if (this.transform !== null && changed === false) {
      for (let i of ["position", "rotation", "scale"]) {
        for (let j of ["x", "y", "z"]) {
          if (this.transform[i][j] !== this.target[i][j]) {
            this.transform[i][j] = this.target[i][j];
            changed = true;
          }
        }
      }
    }
    return changed;
  }
}

export { TransformMonitor };
