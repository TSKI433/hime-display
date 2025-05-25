// MMDAnimationHelper里面自带那个AudioManager……实在是不太行，中途暂停，定位播放之类的直接不可能实现，于是我还是自己写一个吧
export class AudioManager {
  constructor(audio, params) {
    this.audio = audio;
    this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;
    // 若延时为正，使用setTimeOut实现，若延时为负，为audio设定offset
    this.hasPlayed = false;
    if (this.delayTime < 0) {
      this.audio.offset = -this.delayTime;
    }
  }
  destroy() {
    this.pause();
    this.audio = null;
  }
  play() {
    if (!this.hasPlayed && this.delayTime > 0) {
      setTimeout(() => {
        this.audio.play();
        this.hasPlayed = true;
      }, this.delayTime * 1000);
    } else {
      !this.audio.isPlaying && this.audio.play();
    }
  }
  pause() {
    this.audio.isPlaying && this.audio.pause();
  }
  // 尚未使用的函数
  getCurrentTime() {}
  setCurrentTime(time) {}
}
