import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper.js";
import { Clock } from "three";
export class AnimationManager {
  // 直接从上级获取MMDLoader，省得重新搞个实例
  constructor(MMDLoader) {
    this.MMDLoader = MMDLoader;
    this.clock = new Clock();
    this.helper = new MMDAnimationHelper();
    this.loaded = false;
    this.mixer = null;
    this.ikSolver = null;
    this.model = null;
    this.pause();
  }
  loadAnimation(motionFilePath, model) {
    this.model = model;
    this.MMDLoader.loadAnimation(motionFilePath, model, (vmd) => {
      this.helper.add(model, { animation: vmd, physics: false });
      const helperMeshObject = this.helper.objects.get(model);
      //   付与(grant)？？算了吧，做个寂寞
      this.mixer = helperMeshObject.mixer;
      this.ikSolver = helperMeshObject.ikSolver;
      this.loaded = true;
    });
  }
  update() {
    const delta = this.clock.getDelta();
    this.helper.update(delta);
  }
  setTime() {
    this.mixer.setTime(time);
    this.helper.update(1);
    this.helper.update(-1);
  }
  pose() {
    this.model.pose();
  }
  updateIK() {
    this.ikSolver.update();
  }
  play() {
    this.clock.start();
  }
  pause() {
    this.clock.stop();
  }
}
