import * as THREE from "three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
import { MouseFocusHelper } from "@display/lib/3d/MouseFocusHelper.js";
export class MmdManager {
  constructor(parentApp) {
    this.modelType = "mmd";
    this.canvas = parentApp.canvas;
    this.stats = parentApp.stats;
    this.model = null;
  }
  switchIn() {
    this.scene = new THREE.Scene();
    const ambient = new THREE.AmbientLight(0x666666);
    this.scene.add(ambient);
    const directionalLight = new THREE.DirectionalLight(0x887766);
    directionalLight.position.z = 100;
    this.scene.add(directionalLight);
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.set(0, 10, 40);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      aplpha: true,
      canvas: this.canvas,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  render() {
    if (this.stats !== null) {
      this.stats.begin();
      this.stats.end();
    }

    this.mouseFocusHelper?.focus();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
  loadModel(modelInfo) {
    const modelFile = modelInfo.entranceFile;
    const loaderMMD = new MMDLoader();
    loaderMMD.load(modelFile, (mmd) => {
      this.model = mmd;
      console.log("MMD Loaded");
      // 世界未解之谜，只要载入mmd模型，直接在这里调用this.scene.add(mmd)，WebGL上下文就会有一定概率渲染着渲染着就弄丢了，然后整个程序直接卡死…
      // 然后在程序卡一阵子自动退出后，主进程会报出两条报错信息：
      // ERROR:command_buffer_proxy_impl.cc(293)] GPU state invalid after WaitForTokenInRange.
      // ERROR:gpu_process_host.cc(974)] GPU process exited unexpectedly: exit_code=512
      // 经过各种瞎尝试，设个延时（实测延时设短了也不行，如0，100也有几率卡死）函数后，就不会有问题了，别问我解决的原理是什么，问就是不知道
      // 震惊！！！setImmediate居然不是标准特性……
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate
      // 直接给我来个ReferenceError: setImmediate is not defined
      setTimeout(() => {
        this.scene.add(mmd);
      }, 1000);
      this.render();
      this.mouseFocusHelper = new MouseFocusHelper(
        mmd.skeleton.bones.find((bone) => bone.name === "頭"),
        this.camera
      );
      document.addEventListener("pointermove", (event) => {
        this.mouseFocusHelper.update(event.clientX, event.clientY);
      });
    });
  }
}