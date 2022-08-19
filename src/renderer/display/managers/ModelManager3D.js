import { ModelManager } from "./ModelManager";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
class ModelManager3D extends ModelManager {
  _initOrbitControls() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    // 将控制目标点抬高至和相机平齐，不然刚启动时位置不对
    this.orbitControls.target.y = this.camera.position.y;
    this.orbitControls.update();
  }
  switchOut() {
    this._removeEventListeners();
    this._clearModel();
    this._disposeChildren(this.scene);
    this.renderer.clear();
    this.renderer.dispose();
    this._initObjects();
  }

  // 初始化各种对象
  _initObjects() {
    this._sendToModelControl = null;
    this.shouldRender = false;

    // 控制面板那边对展示器由两种类型的控制，一个是config数据库中存储的配置，需要重启展示器生效，还有一种是不存储数据库的临时配置，只对当前的模型生效，也就是这里instantConfig内部存放的东西
    this.instantConfig = null;
    this.ModelLoader = null;
    this.transformMonitor = null;
    this.morphMonitor = null;
    this.captureManagerNow = null;
    this.animationManager = null;
    // 人查麻了，搞了半天MMD模型没被垃圾回收是mouseFocusHelper的问题，由一个脑袋开始揪住整个模型死活不放手是吧
    this.mouseFocusHelper = null;
    this.orbitControls = null;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.effect = null;
    this.model = null;
    // MMD并未使用时钟，这里为了统一，均赋值为null
    this.clock = null;
  }
  _bindNodeTransform(nodeId) {
    this.transformMonitor.bind(this.scene.getObjectById(nodeId));
  }
  _setNodeTransform({ nodeId, transform }) {
    const target = this.scene.getObjectById(nodeId);
    for (let i of ["position", "rotation", "scale"]) {
      for (let j of ["x", "y", "z"]) {
        if (target[i][j] !== transform[i][j]) {
          target[i][j] = transform[i][j];
        }
      }
    }
    // 直接手动更新Monitor的数值，防止checkUpdate机制循环发送更新消息（一般来讲会发送两次）
    this.transformMonitor.transform = transform;
  }
  _render() {
    if (!this.shouldRender) {
      return;
    }
    this._updateObjects();
    this.effect.render(this.scene, this.camera);
    requestAnimationFrame(this._render.bind(this));
  }
  _clearModel() {
    if (this.model !== null) {
      this._disposeChildren(this.model);
      this.scene.remove(this.model);
      // Vroid的材质和几何体不在这
      this.model.geometry?.dispose();
      this.model.material?.forEach((material) => {
        // const mapNames=['map','gradientMap','lightMap','aoMap','emissiveMap','bumpMap','normalMap','displacemantMap','specularMap','alphaMap','envMap']
        material.map?.dispose();
        material.gradientMap?.dispose();
        material.dispose();
      });
      this.model = null;
    }
  }
  _disposeChildren(parent) {
    parent.traverse((obj) => {
      if (obj.isMesh) {
        // 这里本来应该除了mmd就没有mesh了，还是这么的写一下，但是其他的meshtexture就不知道是什么情况了，先不处理
        // Vroid可能会没有
        if (obj.material.dispose !== undefined) {
          obj.material?.dispose();
        }
        if (obj.geometry.dispose !== undefined) {
          obj.geometry?.dispose();
        }
      }
      if (obj.dispose !== undefined) {
        // 看了一下THREE.Light类是有dispose方法的，默认是个预留空函数，这里用的平行光和环境光都没有对此函数进行覆盖，但为了之后考虑还是调用一下
        obj.dispose();
      }
    });
    // 上方遍历函数中调用用改变children数组，导致错误，此处处理也是使用Object.values做了浅层克隆
    Object.values(parent.children).forEach((obj) => {
      parent.remove(obj);
    });
  }
  _addEventListeners() {
    document.addEventListener("pointermove", this._onPointerMove);
  }
  _removeEventListeners() {
    document.removeEventListener("pointermove", this._onPointerMove);
  }
  // resize由上级的Application触发
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.effect.setSize(window.innerWidth, window.innerHeight);
  }
}
export { ModelManager3D };
