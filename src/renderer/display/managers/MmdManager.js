import { ModelManager } from "./ModelManager";
import * as THREE from "three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import { MouseFocusHelper } from "@display/utils/3d/MouseFocusHelper.js";
import { buildNodeInfoTreeAndList } from "@display/utils/3d/NodeInfo";
import {
  TransformMonitor,
  MMDMorphMonitor,
} from "@display/utils/3d/ParameterMonitor";
import { AnimationManager } from "@display/utils/mmd/AnimationManager";
import { MMDFaceMeshCaptureManager as FaceMeshCaptureManager } from "@display/utils/capture/MMDFaceMeshCaptureManager";
import { MMDHolisticCaptureManager as HolisticCaptureManager } from "@display/utils/capture/MMDHolisticCaptureManager";
export class MmdManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "MMD";
    this._sendToModelControl = null;
    this.shouldRender = false;

    this.MMDLoader = null;
    this.transformMonitor = null;
    this.morphMonitor = null;
    this.faceMeshCaptureManager = null;
    this.holisticCaptureManager = null;
    // 主要用于MouseFocusHelper的判断
    this.animationManager = null;
    this.mouseFocusHelper = null;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.effect = null;
  }
  switchIn() {
    this.MMDLoader = new MMDLoader();
    this.transformMonitor = new TransformMonitor();
    this.morphMonitor = new MMDMorphMonitor();
    this.scene = new THREE.Scene();
    this._addLight();
    // 由于要在整个屏幕上展示，刻意将视锥体垂直视野角度改为了30度，以减小模型的屏幕边缘时产生的画面畸变
    this.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.set(0, 10, 70);
    // 这是一步立足长远，顾全大局的操作，在之后主要有两个作用：
    // 其一，在构建节点树的时候会连着Camera进去，这样相机的位置就能和其他对象统一控制了
    // 其二，之后要载入音频的时候，会把AudioListener加到camera下，这样一来，相机的移动就可以连带着listener移动，就像给相机挂了个耳机一样（然而目前用的不是THREE的PositionalAudio，这波操作似乎什么用都没有……）
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      aplpha: true,
      canvas: this.canvas,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.resolution);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.effect = new OutlineEffect(this.renderer);
    this.effect.enabled = this.config.display["3d-outline-effect"];
  }
  switchOut() {
    this._clearModel();
    this._sendToModelControl = null;
    this.shouldRender = false;

    this.MMDLoader = null;
    this.transformMonitor = null;
    this.morphMonitor = null;
    this.faceMeshCaptureManager = null;
    this.holisticCaptureManager = null;
    this.animationManager = null;
    // 人查麻了，搞了半天MMD模型没被垃圾回收是mouseFocusHelper的问题，由一个脑袋开始揪住整个模型死活不放手是吧
    this.mouseFocusHelper = null;

    this.scene.traverse((obj) => {
      if (obj.isMesh) {
        // 这里本来应该除了mmd就没有mesh了，还是这么的写一下，但是其他的meshtexture就不知道是什么情况了，先不处理
        obj.material.dispose();
        obj.geometry.dispose();
      }
      if (obj.dispose !== undefined) {
        // 看了一下THREE.Light类是有dispose方法的，默认是个预留空函数，这里用的平行光和环境光都没有对此函数进行覆盖，但为了之后考虑还是调用一下
        obj.dispose();
      }
    });
    // 上方遍历函数中调用用改变children数组，导致错误，此处处理也是使用Object.values做了浅层克隆
    Object.values(this.scene.children).forEach((obj) => {
      this.scene.remove(obj);
    });
    this.renderer.clear();
    this.renderer.dispose();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.effect = null;
  }
  loadModel(modelInfo) {
    return new Promise((resolve, reject) => {
      const modelFile = modelInfo.entranceFile;
      this.MMDLoader.load(
        modelFile,
        (mmd) => {
          console.log("[Hime Display] MMD Loaded");
          this._clearModel();
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
            morph: this.model.morphTargetDictionary,
          };
          // 世界未解之谜，只要载入mmd模型，直接在这里调用this.scene.add(mmd)，WebGL上下文就会有一定概率渲染着渲染着就弄丢了，然后整个程序直接卡死…
          // 然后在程序卡一阵子自动退出后，主进程会报出两条报错信息：
          // ERROR:command_buffer_proxy_impl.cc(293)] GPU state invalid after WaitForTokenInRange.
          // ERROR:gpu_process_host.cc(974)] GPU process exited unexpectedly: exit_code=512
          // 经过各种瞎尝试，设个延时（大概1000ms，延时设短了也不行，如0，100也有几率卡死）函数后，就不会有问题了，别问我解决的原理是什么，问就是不知道

          // 1.这个问题在脱离Electron，直接在Chrome（后已证实同样会在Chrome出现），Firefox中测试时都不会出现
          // 2.该问题与ESM模块系统无直接关联，全换成iife模块它也崩
          // 3.该问题与跨域使用file:// 加载模型无直接关联，之后也进一步验证了，虽然在file://的协议下，资源相应头没有Content-Length导致无法在OnProgress回调中检查加载进度，但是这并没有影响资源的正常加载
          // 4.顺带一提，展示器在崩坏重载后的报错信息为：
          // THREE.WebGLProgram: Shader Error 0 - VALIDATE_STATUS false
          // WebGL: INVALID_OPERATION: useProgram: program not valid
          // THREE.WebGLProgram: Shader Error 1282 - VALIDATE_STATUS false
          // INVALID_OPERATION: useProgram: program not valid
          // INVALID_OPERATION: useProgram: program not valid
          // INVALID_OPERATION: useProgram: program not valid
          // WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost
          // THREE.WebGLRenderer: Context Lost.
          // 5.推测此问题可能比较单纯，就是在Electron环境下THREE的渲染在一些情况下会导致GPU错误。出现的第一个报错为Shader Error，推测深层次可能跟THREE的MMDToonShader的渲染有关，反正这已经到我无法解决的领域了
          // 6.通过各种打断点判断，这玩意儿和资源加载似乎就没什么关系
          // 7.MMD加载资源的时候，本来纹理的加载的就是异步的，他会先创建material再加载图片，图片未加载时在场景中呈现为透明状态，这没什么问题，从时间线的分析上来看，模型是加载完成和图片加载完成的顺序和软件崩不崩没有直接联系
          // 8.测试发现，只要有一次载入成功，之后的几次模型载入必定成功，由此推测这很可能是跟某个东西的初始化或缓存什么的相关
          // 9.测试发现，如果先让renderer渲染着，再让模型加载，甚至在MMDLoader调用回调函数之前软件就已经崩了，这说明这个问题甚至跟把mmd模型丢scene渲染都没有直接关系
          // 10.接第8条，发现不单单是之后几次必定成功，只要主进程不退出，重启展示器页面也必定不崩，而且之前崩的状态是直接波及到主进程和渲染器进程，是整个应用全部卡死，由此推测，这个问题或许已经超出了前端的范畴了，是Electron内部对Chromium处理的什么问题
          // 现在得出的不触发问题的方法，在render之前一段时间（大概要一秒多）就载入MMD模型
          // 目前我感觉比较好的解决方案，要求不就是要加载第一个MMD模型隔一段时间后才能调用渲染器进程嘛，那我一上来就加载个模型，加载完后什么事都不干，之后不久什么问题都没有了？实践证明真的是这样，不过对这个模型也有要求，我试过直接放一根骨头的模型，无效；拿着Blender随便造了个MMD立方体，带个基础材质，还是无效；把材质弄成纹理贴图，依旧无效……合着和材质半点关系没有是吧，好吧管你问题出在哪儿，那只能直接上真模型了。顺带一提，这个问题还仅仅在pmx模型出现，pmd一点问题也没有
          // 不过目前在渲染前加个一秒多的延时一般来讲也没什么问题了，之后具体怎么弄再看吧
          // 新的进展：经过后来的测试发现，这其实不是Electron的问题，单纯的是Chrome的问题，只是之前的测试用例载入了动作文件，导致mmd载入和启动渲染间隔时间较长，因此在Chrome里没有触发bug，做出错误判断。经过目前的测试，引发Chrome崩溃的条件较为苛刻，如下：macOS系统，Chrome浏览器（实测Edge都没问题），载入模型格式为pmx，打开浏览器后第一次启动渲染，启动渲染在启动浏览器后第一个pmx模型载入的约1000ms内。测试机型为Intel的Mac，在M系列的Mac中情况未知

          // 震惊！！！setImmediate居然不是标准特性……
          // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate
          // 直接给我来个ReferenceError: setImmediate is not defined
          this.scene.add(mmd);
          // 后来发现又个windows下的cancelAnimationFrame的API，但这是一个这是一个实验中的功能，所以还是不用了
          if (!this.shouldRender) {
            this.shouldRender = true;
            setTimeout(() => {
              this._render();
            }, 1000);
          }
          // 必须在添加上模型后再构建信息
          modelControlInfo.transform = buildNodeInfoTreeAndList(this.scene);
          modelControlInfo.state = "success";
          resolve(modelControlInfo);
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
  _addLight() {
    const ambient = new THREE.AmbientLight(0x666666);
    this.scene.add(ambient);
    const directionalLight = new THREE.DirectionalLight(0x887766);
    directionalLight.position.z = 100;
    this.scene.add(directionalLight);
  }
  _render() {
    if (!this.shouldRender) {
      return;
    }
    if (this.stats !== null) {
      this.stats.begin();
      this.stats.end();
    }
    if (this._sendToModelControl !== null) {
      if (this.transformMonitor.checkUpdate()) {
        this._sendToModelControl({
          channel: "manager:update-node-transform",
          data: this.transformMonitor.transform,
        });
      }
      if (this.morphMonitor.checkUpdate()) {
        this._sendToModelControl({
          channel: "manager:update-node-morph",
          data: {
            weight: this.morphMonitor.morph,
          },
        });
      }
    }
    if (this.animationManager?.ready && this.animationManager?.clock.running) {
      this.animationManager.update();
    }
    // 播放动画的时候模型还盯着鼠标看，转身都不带扭头的那效果……我实在是看不下去了
    if (
      this.animationManager === null &&
      this.faceMeshCaptureManager === null
    ) {
      this.mouseFocusHelper?.focus();
    }
    this.effect.render(this.scene, this.camera);
    requestAnimationFrame(this._render.bind(this));
  }

  onSendToModelControl(callback) {
    this._sendToModelControl = callback;
  }
  handleMessage(message) {
    switch (message.channel) {
      case "control:bind-node-transform": {
        this._bindNodeTransform(message.data.nodeId);
        break;
      }
      case "control:set-node-transform": {
        const { nodeId, transform } = message.data;
        this._setNodeTransform(nodeId, transform);
        break;
      }
      case "control:play-motion": {
        const { motionFilePath, physicsSimulation } = message.data;
        console.log(`[Hime Diplsay] Load Motion: ${motionFilePath}`);
        this._resetAnimationManager();
        this.animationManager = new AnimationManager(this.MMDLoader);
        this.animationManager
          .loadAnimation(this.model, motionFilePath)
          .then(() => {
            this.animationManager.helper.enable("physics", physicsSimulation);
            this._sendToModelControl({
              channel: "manager:update-motion-info",
              data: { durantion: this.animationManager.clip.duration },
            });
          });
        break;
      }
      case "control:play-motion-with-audio": {
        const { motionFilePath, audioFilePath, delayTime, physicsSimulation } =
          message.data;
        console.log(
          `[Hime Diplsay] Load Motion: ${motionFilePath} With Audio: ${audioFilePath}`
        );
        this._resetAnimationManager();
        this.animationManager = new AnimationManager(this.MMDLoader);
        this.animationManager
          .loadAnimationWithAudio(
            this.model,
            motionFilePath,
            audioFilePath,
            delayTime
          )
          .then(() => {
            this.animationManager.helper.enable("physics", physicsSimulation);
            this._sendToModelControl({
              channel: "manager:update-motion-info",
              data: { durantion: this.animationManager.clip.duration },
            });
          });
        this.camera.add(this.animationManager.listener);
        break;
      }
      case "control:set-motion-state": {
        const { state } = message.data;
        if (state === "play") {
          this.animationManager.play();
        } else if (state === "pause") {
          this.animationManager.pause();
        }
        break;
      }
      case "control:quit-animation-play": {
        this._resetAnimationManager();
        break;
      }
      case "control:launch-capture": {
        const { type } = message.data;
        if (type === "faceMesh") {
          this.faceMeshCaptureManager = new FaceMeshCaptureManager();
          this.faceMeshCaptureManager.setTarget(this.model);
          this.faceMeshCaptureManager.start();
        } else if (type === "holistic") {
          this.holisticCaptureManager = new HolisticCaptureManager();
          this.holisticCaptureManager.setTarget(this.model);
          this.holisticCaptureManager.start();
        }
        break;
      }
      case "control:bind-morph-target": {
        const { morphName } = message.data;
        this.morphMonitor.bind(morphName, this.model);
        break;
      }
      case "control:set-morph-weight": {
        const { morphName, weight } = message.data;
        const morphIndex = this.model.morphTargetDictionary[morphName];
        if (morphIndex === undefined) {
          throw new Error(
            `MmdManager: Morph ${morphName} not found in the model`
          );
        }
        this.model.morphTargetInfluences[morphIndex] = weight;
        break;
      }
      case "control:change-physics": {
        this.animationManager?.helper.enable(
          "physics",
          message.data.physicsSimulation
        );
        break;
      }
    }
  }
  _bindNodeTransform(nodeId) {
    this.transformMonitor.bind(this.scene.getObjectById(nodeId));
  }
  _setNodeTransform(nodeId, transform) {
    const target = this.scene.getObjectById(nodeId);
    for (let i of ["position", "rotation", "scale"]) {
      for (let j of ["x", "y", "z"]) {
        if (target[i][j] !== transform[i][j]) {
          target[i][j] = transform[i][j];
        }
      }
    }
  }
  _resetAnimationManager() {
    this.animationManager?.destroy();
    this.animationManager = null;
    this.model.pose();
  }
  _clearModel() {
    if (this.model !== null) {
      this.scene.remove(this.model);
      this.model.geometry.dispose();
      this.model.material.forEach((material) => {
        // const mapNames=['map','gradientMap','lightMap','aoMap','emissiveMap','bumpMap','normalMap','displacemantMap','specularMap','alphaMap','envMap']
        material.map?.dispose();
        material.gradientMap?.dispose();
        material.dispose();
      });
      this.model = null;
    }
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.effect.setSize(window.innerWidth, window.innerHeight);
  }
}
