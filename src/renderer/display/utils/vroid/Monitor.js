import { VRMExpressionPresetName } from "@pixiv/three-vrm";
class MorphMonitor {
  constructor() {
    this.value = 0;
    this.model = null;
    this.isJustBined = false;
  }
  bind(target, model = null) {
    this.model = model;
    this.morpName = target;
    if (!Object.values(VRMExpressionPresetName).includes(this.morpName)) {
      throw new Error(
        `MorphMonitor: morph target ${this.morpName} not found in the model`
      );
    }
    this.isJustBined = true;
    this.value = 0;
  }
  checkUpdate() {
    let changed = false;
    if (this.isJustBined) {
      this.isJustBined = false;
      changed = true;
    }

    if (this.value !== null && this.model !== null) {
      const newMorphValue = this.model.vrm.expressionManager.getValue(
        this.morpName
      );
      if (this.value !== newMorphValue) {
        this.value = newMorphValue;
        changed = true;
      }
    }
    return changed;
  }
}
export { MorphMonitor };
