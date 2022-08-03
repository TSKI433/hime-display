// 绝了，不知道是谁的锅，这里的live2d渲染系统设定_parameterValues和_partOpacities会发生小数偏移，例如设为0.3，他可能自动变成0.3000078397489这样的，导致我设定的参数变化监测系统直接疯狂更新，这里采用toFixed限制小数位
class ParameterMonitor {
  constructor() {
    this.value = 0;
    this.model = null;
    this.isJustBined = false;
  }
  bind(target, model = null) {
    this.model = model;
    this.parameterId = target;
    if (
      !this.model.internalModel.coreModel._parameterIds.includes(
        this.parameterId
      )
    ) {
      throw new Error(
        `ParameterMonitor: parameter ${this.parameterId} not found in the model`
      );
    }
    this.isJustBined = true;
    this.parameterIndex =
      this.model.internalModel.coreModel._parameterIds.indexOf(
        this.parameterId
      );
    this.value = 0;
  }
  checkUpdate() {
    let changed = false;
    if (this.isJustBined) {
      this.isJustBined = false;
      changed = true;
    }
    if (this.value !== null && this.model !== null && changed === false) {
      const newParameterValue = Number(
        this.model.internalModel.coreModel._parameterValues[
          this.parameterIndex
        ].toFixed(2)
      );
      if (this.value !== newParameterValue) {
        this.value = newParameterValue;
        changed = true;
      }
    }
    return changed;
  }
}
class PartMonitor {
  constructor() {
    this.value = 0;
    this.model = null;
    this.isJustBined = false;
  }
  bind(target, model = null) {
    this.model = model;
    this.partId = target;
    if (!this.model.internalModel.coreModel._partIds.includes(this.partId)) {
      throw new Error(
        `PartMonitor: part ${this.parameterId} not found in the model`
      );
    }
    this.isJustBined = true;
    this.partIndex = this.model.internalModel.coreModel._partIds.indexOf(
      this.partId
    );
    this.value = 0;
  }
  checkUpdate() {
    let changed = false;
    if (this.isJustBined) {
      this.isJustBined = false;
      changed = true;
    }
    if (this.value !== null && this.model !== null && changed === false) {
      const newPartOpacity = Number(
        this.model.internalModel.coreModel._partOpacities[
          this.partIndex
        ].toFixed(2)
      );
      if (this.value !== newPartOpacity) {
        this.value = newPartOpacity;
        changed = true;
      }
    }
    return changed;
  }
}
export { ParameterMonitor, PartMonitor };
