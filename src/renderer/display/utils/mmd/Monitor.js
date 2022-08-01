class MMDMorphMonitor {
  constructor() {
    this.morph = null;
    this.model = null;
    this.isJustBined = false;
  }
  bind(target, model = null) {
    this.model = model;
    this.target = target;
    if (!Object.keys(this.model.morphTargetDictionary).includes(this.target)) {
      throw new Error(
        `MMDMorphMonitor: morph target ${this.target} not found in the model`
      );
    }
    this.isJustBined = true;
    this.morph = 0;
  }
  checkUpdate() {
    let changed = false;
    if (this.isJustBined) {
      this.isJustBined = false;
      changed = true;
    }

    if (this.morph !== null && this.model !== null && changed === false) {
      const newMorphValue =
        this.model.morphTargetInfluences[
          this.model.morphTargetDictionary[this.target]
        ];
      if (this.morph !== newMorphValue) {
        this.morph = newMorphValue;
        changed = true;
      }
    }
    return changed;
  }
}
export { MMDMorphMonitor };
