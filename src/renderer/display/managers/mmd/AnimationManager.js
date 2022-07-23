import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper.js";
import { AudioManager } from "@display/utils/3d/AudioManager";
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
    this.audioManager = null;
    this.listener = null;
  }
  destroy() {
    this.audioManager?.destroy();
    this.MMDLoader = null;
    this.clock = null;
    this.mixer = null;
    this.ikSolver = null;
    this.model = null;
    this.audioLoader = null;
    this.audio = null;
    this.audioManager = null;
    this.listener = null;
  }
  _MMDLoadAnimation(model, motionFilePath) {
    return new Promise((resolve, reject) => {
      this.model = model;
      // 防止之前的对象变换和模型播放对模型姿态造成影响
      this.pause();
      this.MMDLoader.loadAnimation(motionFilePath, model, (vmd) => {
        this.helper.add(model, { animation: vmd, physics: true });
        const helperMeshObject = this.helper.objects.get(model);
        //   付与(grant)？？算了吧，做个寂寞
        this.mixer = helperMeshObject.mixer;
        this.ikSolver = helperMeshObject.ikSolver;
        this.clip = this.mixer._actions[0]._clip;
        resolve();
      });
    });
  }
  _MMDLoadAudio(audioFilePath, delayTime) {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(audioFilePath, (audioBuffer) => {
        this.audio = new Audio(this.listener).setBuffer(audioBuffer);
        //   目前delayTime只能是正数，不过通常来讲也不会出现负数
        //   MMDAnimationHelper内部的AudioManager无法解析负数延时
        //   THREE中的Audio对象的延时底层好像是转接到Web API的AudioBufferSourceNode的offset的，也无法设定为负数
        //   若想要实现负数延时，可以尝试调整AudioManager内部的audio：
        //   if (this.delayTime < 0) {
        // 	this.audio._progress = -this.delayTime;
        //   }
        this.audioManager = new AudioManager(this.audio, { delayTime });
        resolve();
      });
    });
  }
  async loadAnimation(model, motionFilePath) {
    await this._MMDLoadAnimation(model, motionFilePath);
    this.play();
    this.ready = true;
  }
  async loadAnimationWithAudio(
    model,
    motionFilePath,
    audioFilePath,
    delayTime = 0
  ) {
    this.audioLoader = new AudioLoader();
    this.listener = new AudioListener();
    await Promise.all([
      this._MMDLoadAnimation(model, motionFilePath),
      this._MMDLoadAudio(audioFilePath, delayTime),
    ]);
    //   这里要在完成载入音频再播放动作，不然会因音频的异步加载导致时间轴对不上
    this.play();
    this.ready = true;
  }
  update() {
    const delta = this.clock.getDelta();
    this.helper.update(delta);
  }
  pose() {
    this.model.pose();
  }
  play() {
    this.clock.start();
    this.audioManager?.play();
  }
  pause() {
    this.clock.stop();
    this.audioManager?.pause();
  }
  // 尚未使用的函数
  setTime() {
    this.mixer.setTime(time);
    this.helper.update(1);
    this.helper.update(-1);
  }
  updateIK() {
    this.ikSolver.update();
  }
}
