import { ModelManager } from "../ModelManager";
import * as THREE from "three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
import { MouseFocusHelper } from "@display/utils/3d/MouseFocusHelper.js";
import { buildNodeInfoTree } from "@display/utils/3d/utils";
import { TransformMonitor } from "@display/utils/3d/TransformMonitor";
export class MmdManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "MMD";
    this.transformMonitor = new TransformMonitor();
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
    this.renderer.setPixelRatio(this.resolution);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  render() {
    if (this.stats !== null) {
      this.stats.begin();
      this.stats.end();
    }
    if (
      this._sendToModelControl !== undefined &&
      this.transformMonitor.checkUpdate()
    ) {
      this._sendToModelControl({
        channel: "manager:update-node-transform",
        data: this.transformMonitor.transform,
      });
    }
    this.mouseFocusHelper?.focus();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
  loadModel(modelInfo) {
    return new Promise((resolve, reject) => {
      const modelFile = modelInfo.entranceFile;
      const loaderMMD = new MMDLoader();
      loaderMMD.load(
        modelFile,
        (mmd) => {
          console.log("[Hime Display] MMD Loaded");
          this.model = mmd;
          const mmdUserData = mmd.geometry.userData.MMD;
          const modelControlInfo = {
            description: {
              name: modelInfo.name,
              extensionName: modelInfo.extensionName,
              vertexCount: mmd.geometry.attributes.normal.count,
              triangleCount: mmd.geometry.index.count / 3,
              boneCount: mmdUserData.bones.length,
              ikCount: mmdUserData.iks.length,
              rigidBodyCount: mmdUserData.rigidBodies.length,
              constraintCount: mmdUserData.constraints.length,
              grantCount: mmdUserData.grants.length,
              morphCount: mmd.geometry.morphTargets.length,
            },
          };
          // 世界未解之谜，只要载入mmd模型，直接在这里调用this.scene.add(mmd)，WebGL上下文就会有一定概率渲染着渲染着就弄丢了，然后整个程序直接卡死…
          // 然后在程序卡一阵子自动退出后，主进程会报出两条报错信息：
          // ERROR:command_buffer_proxy_impl.cc(293)] GPU state invalid after WaitForTokenInRange.
          // ERROR:gpu_process_host.cc(974)] GPU process exited unexpectedly: exit_code=512
          // 经过各种瞎尝试，设个延时（实测延时设短了也不行，如0，100也有几率卡死）函数后，就不会有问题了，别问我解决的原理是什么，问就是不知道

          // 这个问题在脱离Electron，直接在Chrome，Firefox中测试时都不会出现
          // 通过控制变量法实验得出结论，该问题与ESM模块系统无直接关联，全换成iife模块它也崩
          // 通过第二个控制变量实验得出结论，该问题与跨域使用file:// 加载模型无直接关联
          // 顺带一提，展示器在崩坏重载后的报错信息为：
          // THREE.WebGLProgram: Shader Error 0 - VALIDATE_STATUS false
          // WebGL: INVALID_OPERATION: useProgram: program not valid
          // THREE.WebGLProgram: Shader Error 1282 - VALIDATE_STATUS false
          // INVALID_OPERATION: useProgram: program not valid
          // INVALID_OPERATION: useProgram: program not valid
          // INVALID_OPERATION: useProgram: program not valid
          // WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost
          // THREE.WebGLRenderer: Context Lost.
          // 综上，推测此问题可能比较单纯，就是在Electron环境下THREE的渲染在一些情况下会导致GPU错误。出现的第一个报错为Shader Error，推测深层次可能跟THREE的MMDToonShader的渲染有关，反正这已经到我无法解决的领域了

          // 震惊！！！setImmediate居然不是标准特性……
          // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate
          // 直接给我来个ReferenceError: setImmediate is not defined
          setTimeout(() => {
            this.scene.add(mmd);
            // 必须在添加上模型后再构建信息
            modelControlInfo.transform = buildNodeInfoTree(this.scene);
            modelControlInfo.state = "success";
            resolve(modelControlInfo);
          }, 1000);
          this.render();
          this.mouseFocusHelper = new MouseFocusHelper(
            mmd.skeleton.bones.find((bone) => bone.name === "頭"),
            this.camera
          );
          document.addEventListener("pointermove", (event) => {
            this.mouseFocusHelper.update(event.clientX, event.clientY);
          });
        },
        null,
        (error) => {
          console.error(`[Hime Display] MMD Load Error: ${error}`);
          resolve({ state: "error", errorMessage: error.message });
        }
      );
    });
  }
  onSendToModelControl(callback) {
    this._sendToModelControl = callback;
  }
  handleMessage(message) {
    switch (message.channel) {
      case "control:bind-node-transform": {
        this.bindNodeTransform(message.data);
        break;
      }
      case "control:set-node-transform": {
        const { nodeId, transform } = message.data;
        this.setNodeTransform(nodeId, transform);
        break;
      }
    }
  }
  bindNodeTransform(nodeId) {
    this.transformMonitor.bind(this.scene.getObjectById(nodeId));
  }
  setNodeTransform(nodeId, transform) {
    const target = this.scene.getObjectById(nodeId);
    for (let i of ["position", "rotation", "scale"]) {
      for (let j of ["x", "y", "z"]) {
        if (target[i][j] !== transform[i][j]) {
          target[i][j] = transform[i][j];
        }
      }
    }
  }
}
