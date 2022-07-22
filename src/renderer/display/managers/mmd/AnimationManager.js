import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper.js";
import { Clock, AudioLoader, Audio, AudioListener } from "three";
export class AnimationManager {
  // 直接从上级获取MMDLoader，省得重新搞个实例
  constructor(MMDLoader) {
    this.MMDLoader = MMDLoader;
    this.clock = new Clock();
    this.helper = new MMDAnimationHelper();
    this.ready = false;
    this.mixer = null;
    this.ikSolver = null;
    this.model = null;
    this.audioLoader = null;
    this.audio = null;
    this.listener = null;
  }
  loadAnimation(model, motionFilePath) {
    this.model = model;
    // 防止之前的对象变换和模型播放对模型姿态造成影响
    this.pause();
    this.MMDLoader.loadAnimation(motionFilePath, model, (vmd) => {
      this.helper.add(model, { animation: vmd, physics: true });
      const helperMeshObject = this.helper.objects.get(model);
      //   付与(grant)？？算了吧，做个寂寞
      this.mixer = helperMeshObject.mixer;
      this.ikSolver = helperMeshObject.ikSolver;
      this.ready = true;
    });
  }
  loadAnimationWithAudio(model, motionFilePath, audioFilePath) {
    this.audioLoader = new AudioLoader();
    this.listener = new AudioListener();
    this.loadAnimation(model, motionFilePath);
    this.audioLoader.load(audioFilePath, (audioBuffer) => {
      this.audio = new Audio(this.listener).setBuffer(audioBuffer);
      //   目前delayTime只能是正数，不过通常来讲也不会出现负数
      //   MMDAnimationHelper内部的AudioManager无法解析负数延时
      //   THREE中的Audio对象的延时底层好像是转接到Web API的AudioBufferSourceNode的offset的，也无法设定为负数
      //   若想要实现负数延时，可以尝试调整AudioManager内部的audio：
      //   if (this.delayTime < 0) {
      // 	this.audio._progress = -this.delayTime;
      //   }
      this.helper.add(this.audio, { delayTime: 2 });
      //   这里改到完成载入音频再播放动作，不然会因音频的异步加载导致时间轴对不上
      this.play();
      this.ready = true;
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
