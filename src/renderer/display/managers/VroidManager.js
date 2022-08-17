import { ModelManager3D } from "./ModelManager3D";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import { buildNodeInfoTreeAndList } from "@display/utils/3d/NodeInfo";
import { TransformMonitor } from "@display/utils/3d/Monitor";
import { MorphMonitor } from "@display/utils/vroid/Monitor";
import { MouseFocusHelper } from "@display/utils/3d/MouseFocusHelper.js";
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
          this.model = vrm;
          // 模型绕Y轴旋转180度
          this.model.scene.rotateY(Math.PI);
          this.scene.add(this.model.scene);
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
      this.model.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head),
      this.camera
    );
  }
  _buildModelControlInfo(modelInfo) {
    const modelControlInfo = {
      description: {
        name: modelInfo.name,
        extensionName: modelInfo.extensionName,
      },
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
    this.mouseFocusHelper?.focus();
    this.mouseFocusHelper?.object.quaternion.multiply(turnHeadQuaternion);
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
    }
  }
}
