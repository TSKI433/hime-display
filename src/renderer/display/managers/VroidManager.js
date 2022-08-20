import { ModelManager3D } from "./ModelManager3D";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import { MouseFocusHelper } from "@display/utils/3d/MouseFocusHelper.js";
import { buildNodeInfoTreeAndList } from "@display/utils/3d/NodeInfo";
import { TransformMonitor } from "@display/utils/3d/Monitor";
import { MorphMonitor } from "@display/utils/vroid/Monitor";
import { VRoidFaceMeshCaptureManager as FaceMeshCaptureManager } from "@display/utils/capture/VRoidFaceMeshCaptureManager";
import { VRM, VRMSchema } from "@pixiv/three-vrm";

// 用于转头……VRM使用的坐标系和THREE是反的，不转的话模型永远是后脑勺对着你
const turnHeadQuaternion = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0, Math.PI, 0)
);
export class VroidManager extends ModelManager3D {
  constructor(parentApp) {
    super(parentApp);
    this._initObjects();
  }
  switchIn() {
    this.clock = new THREE.Clock();
    this.ModelLoader = new GLTFLoader();
    this.transformMonitor = new TransformMonitor();
    this.morphMonitor = new MorphMonitor();
    // scene
    this.scene = new THREE.Scene();
    this._addLight();
    //camera
    this.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0.0, 1.0, 5.0);
    this.scene.add(this.camera);
    //renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.antialias,
      aplpha: true,
      canvas: this.canvas,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.resolution);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //effect
    this.effect = new OutlineEffect(this.renderer);
    this.effect.enabled = this.config.display["3d-outline-effect"];
    this.config.display["3d-orbit-controls"] && this._initOrbitControls();
    this._addEventListeners();
  }
  _addLight() {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(directionalLight);
  }
  loadModel(modelInfo) {
    return new Promise((resolve, reject) => {
      const modelFile = modelInfo.entranceFile;
      this.ModelLoader.load(modelFile, (gltf) => {
        VRM.from(gltf).then((vrm) => {
          console.log("[Hime Display] VRM Loaded");
          this._clearModel();
          this.model = vrm.scene;
          // 为了保证3D控制的通用性，将顶部的vrm对象挂载到了内部的模型上
          this.model.vrm = vrm;
          // 手动添加一个模型复位函数
          this.model.pose = function () {
            this.vrm.humanoid.resetPose();
          };
          // 模型绕Y轴旋转180度
          this.model.rotateY(Math.PI);
          this.scene.add(this.model);
          if (!this.shouldRender) {
            this.shouldRender = true;
            this._render();
          }
          this._initMouceFocusHelper();
          document.addEventListener("pointermove", (event) => {
            this.mouseFocusHelper.update(event.clientX, event.clientY);
          });
          resolve(this._buildModelControlInfo(modelInfo));
        });
      });
    });
  }

  _initMouceFocusHelper() {
    this.mouseFocusHelper = new MouseFocusHelper(
      this.model.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head),
      this.camera
    );
  }
  _buildModelControlInfo(modelInfo) {
    const modelControlInfo = {
      description: {
        name: modelInfo.name,
        extensionName: modelInfo.extensionName,
        modelVersion: this.model.vrm.meta.version,
        author: this.model.vrm.meta.author,
        sexualUssageName: this.model.vrm.meta.sexualUssageName,
        violentUssageName: this.model.vrm.meta.violentUssageName,
      },
      morph: Object.values(VRMSchema.BlendShapePresetName),
      // 必须在添加上模型后再构建信息
      transform: buildNodeInfoTreeAndList(this.scene),
    };
    return modelControlInfo;
  }
  _updateObjects() {
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
            weight: this.morphMonitor.value,
          },
        });
      }
    }
    // 播放动画的时候模型还盯着鼠标看，转身都不带扭头的那效果……我实在是看不下去了
    if (this.animationManager === null && this.captureManagerNow === null) {
      this.mouseFocusHelper?.focus();
      // 解决VRoid的Y轴反转问题
      this.mouseFocusHelper?.object.quaternion.multiply(turnHeadQuaternion);
    }
    // 此项更新一个是物理模拟，另一个是morph
    this.model.vrm.update(this.clock.getDelta());
  }
  handleMessage(message) {
    switch (message.channel) {
      case "control:bind-node-transform": {
        this._bindNodeTransform(message.data.nodeId);
        break;
      }
      case "control:set-node-transform": {
        this._setNodeTransform(message.data);
        break;
      }
      case "control:launch-capture": {
        const { type } = message.data;
        if (type === "faceMesh") {
          this.captureManagerNow = new FaceMeshCaptureManager();
        } else if (type === "holistic") {
          // this.captureManagerNow = new HolisticCaptureManager();
        }
        this.captureManagerNow.setTarget(this.model);
        this.captureManagerNow.start();
        break;
      }
      case "control:quit-capture": {
        this.captureManagerNow.quitCapture();
        this.captureManagerNow = null;
        break;
      }
      case "control:bind-morph-target": {
        const { morphName } = message.data;
        this.morphMonitor.bind(morphName, this.model);
        break;
      }
      case "control:set-morph-weight": {
        this._setMorphWeight(message.data);
        break;
      }
    }
  }
  _setMorphWeight({ morphName, weight }) {
    this.model.vrm.blendShapeProxy.setValue(morphName, weight);
  }
}
