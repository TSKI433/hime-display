class TransformMonitor {
  constructor() {
    this.transform = null;
  }
  bind(target) {
    this.target = target;
    this.transform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
  }
  checkUpdate() {
    let changed = false;
    if (this.transform !== null) {
      for (let i of ["position", "rotation", "scale"]) {
        for (let j of ["x", "y", "z"]) {
          if (this.transform[i][j] !== this.target[i][j]) {
            this.transform[i][j] = this.target[i][j];
            changed = true;
            break;
          }
        }
      }
    }
    return changed;
  }
}
export { TransformMonitor };
