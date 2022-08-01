import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper.js";
import { AudioManager } from "@display/utils/mmd/AudioManager";
import { Clock, AudioLoader, Audio, AudioListener, LoopOnce } from "three";
export class AnimationManager {
  // 直接从上级获取MMDLoader，省得重新搞个实例
  constructor(MMDLoader) {
    this.MMDLoader = MMDLoader;
    this.clock = new Clock();
    this.helper = new MMDAnimationHelper();
    this.ready = false;
    this.totalDuration = 0;
    this.mixer = null;
    this.action = null;
    this.clip = null;
    this.physics = null;
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
    this.action = null;
    this.clip = null;
    this.physics = null;
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
        this.action = this.mixer._actions[0];
        // 让整个动作只播放一次
        this.action.setLoop(LoopOnce, Infinity);
        this.clip = this.action.getClip();
        this.physics = helperMeshObject.physics;
        this.totalDuration = this.clip.duration;
        resolve();
      });
    });
  }
  _MMDLoadAudio(audioFilePath, delayTime) {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(audioFilePath, (audioBuffer) => {
        this.audio = new Audio(this.listener).setBuffer(audioBuffer);
        //   MMDAnimationHelper内部的AudioManager无法解析负数延时
        //   THREE中的Audio对象的延时底层好像是转接到Web API的AudioBufferSourceNode的offset的，也无法设定为负数
        //   若想要实现负数延时，可以尝试调整AudioManager内部的audio：
        //   if (this.delayTime < 0) {
        // 	this.audio._progress = -this.delayTime;
        //   }
        // 目前已重写AudioManager，可以设定负数延时
        this.audioManager = new AudioManager(this.audio, { delayTime });
        // 算出动作和音频二者的最长时长
        this.totalDuration = Math.max(
          this.totalDuration,
          this.audio.buffer.duration
        );
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
    // 突然发现暂停时死命执行helper.update(delta)还是很消耗性能的，毕竟一次update要涉及到mixer更新，IK更新，grant更新，physic更新……通过running来判断是否更新吧
    if (this.clock.running) {
      const delta = this.clock.getDelta();
      this.helper.update(delta);
      if (this.mixer.time >= this.totalDuration) {
        this.pause();
        // 防止炸毛
        this.pose();
      }
    }
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
    // MMDAnimationHelper根本就没有指定到一个时间点的方法，只能变相拿着内部的mixer实现，下方的两个update是为了防止IK，Physics，Grant爆炸
    // 目前这里还没有处理音频，现在找到的方法是暂停音频硬生生拿着Audio的_progress属性来设置时间，然后再回复播放
    this.mixer.setTime(time);
    this.helper.update(1);
    this.helper.update(-1);
  }
  // 手动更新IK解算
  updateIK() {
    this.ikSolver.update();
  }
  // 专门应对特殊情况导致物理演算炸毛
  // MMDPhysics目前始终会存在一些奇怪的情况，感觉是内部设计上有点问题，MMD的刚体结构感觉怎么有点像古代士兵铠甲……有时会出现很诡异的抖动，现在尚无解决方案
  fixPhysics() {
    // this.model.pose();
    // this.helper.update(0);
    this.physics?.warmup(60);
    // MMDPhysics里有个reset函数，但实际使用下来感觉作用不是很大
  }
}
