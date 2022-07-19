import { ModelManager } from "../ModelManager";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import { MouseFocusHelper } from "@display/utils/3d/MouseFocusHelper.js";
// 用于转头……VRM使用的坐标系和THREE是反的，不转的话模型永远是后脑勺对着你
const turnHeadQuaternion = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0, Math.PI, 0)
);
export class VroidManager extends ModelManager {
  constructor(parentApp) {
    super(parentApp);
    this.modelType = "VRoid";
  }
  switchIn() {
    this.scene = new THREE.Scene();
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      aplpha: true,
      canvas: this.canvas,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.resolution);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // camera
    this.camera = new THREE.PerspectiveCamera(
      30.0,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0.0, 1.0, 5.0);
    // scene
    this.scene = new THREE.Scene();
    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(light);
  }
  render() {
    if (this.stats !== null) {
      this.stats.begin();
      this.stats.end();
    }
    this.mouseFocusHelper?.focus();
    this.mouseFocusHelper?.object.quaternion.multiply(turnHeadQuaternion);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
  loadModel(modelInfo) {
    const modelFile = modelInfo.entranceFile;
    const loaderGLTF = new GLTFLoader();
    loaderGLTF.load(modelFile, (gltf) => {
      VRM.from(gltf).then((vrm) => {
        console.log("[Hime Display] VRM Loaded");
        this.model = vrm;
        // 模型绕Y轴旋转180度
        this.model.scene.rotateY(Math.PI);
        this.scene.add(this.model.scene);
        this.render();
        this.mouseFocusHelper = new MouseFocusHelper(
          this.model.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head),
          this.camera
        );
        document.addEventListener("pointermove", (event) => {
          this.mouseFocusHelper.update(event.clientX, event.clientY);
        });
      });
    });
  }
}
