class MorphMonitor {
  constructor() {
    this.value = 0;
    this.model = null;
    this.isJustBined = false;
  }
  bind(target, model = null) {
    this.model = model;
    this.morpName = target;
    if (
      !Object.keys(this.model.morphTargetDictionary).includes(this.morpName)
    ) {
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

    if (this.value !== null && this.model !== null && changed === false) {
      const newMorphValue =
        this.model.morphTargetInfluences[
          this.model.morphTargetDictionary[this.morpName]
        ];
      if (this.value !== newMorphValue) {
        this.value = newMorphValue;
        changed = true;
      }
    }
    return changed;
  }
}
export { MorphMonitor };
