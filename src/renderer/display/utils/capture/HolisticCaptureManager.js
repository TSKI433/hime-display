import { Face, Pose, Hand } from "kalidokit";
import {
  setTarget,
  createVideo,
  onResults,
  askForMediaAccess,
} from "./parents/parents.js";
// 经过测试发现，build后对mediapipe的打包存在问题，因此改为html引入
// import * as holisticRoot from "@mediapipe/holistic";
// import { Camera } from "@mediapipe/camera_utils";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
const holisticRoot = window;
const Camera = window.Camera;
const drawConnectors = window.drawConnectors;
const drawLandmarks = window.drawLandmarks;
const solutionPath = "./lib/@mediapipe/holistic/";
export class HolisticCaptureManager {
  constructor() {
    this.model = null;
    this.onRiggedHolisticCallback = null;
    this.running = false;
  }
  async start() {
    if (!(await this.askForMediaAccess())) {
      // i18n也是不存在的……为一个提示引入整个i18next实在是划不来
      alert("Can't access camera.");
      return;
    }
    if (this.readyToRig !== undefined) {
      this.readyToRig();
    }
    this.createVideo();
    this.holistic = new holisticRoot.Holistic({
      locateFile: (file) => {
        return `${solutionPath}${file}`;
      },
    });
    this.holistic.setOptions({
      modelComplexity: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    this.holistic.onResults(this.onResults.bind(this));

    this.camera = new Camera(this.video, {
      onFrame: async () => {
        // 异步函数，可能在this.faceMesh为null后执行
        await this.holistic?.send({ image: this.video });
      },
      width: 640,
      height: 480,
    });
    this.camera.start();
    this.running = true;
  }
  async quitCapture() {
    // 由于Google的Mediapipe的文档有给了跟没给一样，只有个demo，以及连源代码也找不到，尝试了各种方法，依旧无法实现全面的垃圾回收，即使退出捕捉内存也无法释放，但目前只能这样了
    await this.camera.stop();
    await this.holistic?.close();
    this.holistic.onResults(null);
    this.holistic = null;
    this.camera = null;
    this.running = false;
    document.body.removeChild(this.videoContainer);
  }
  drawResults(results) {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Use `Mediapipe` drawing functions
    drawConnectors(
      this.canvasCtx,
      results.poseLandmarks,
      holisticRoot.POSE_CONNECTIONS,
      {
        color: "#00cff7",
        lineWidth: 4,
      }
    );
    drawLandmarks(this.canvasCtx, results.poseLandmarks, {
      color: "#ff0364",
      lineWidth: 2,
    });
    drawConnectors(
      this.canvasCtx,
      results.faceLandmarks,
      holisticRoot.FACEMESH_TESSELATION,
      {
        color: "#C0C0C070",
        lineWidth: 1,
      }
    );
    if (results.faceLandmarks && results.faceLandmarks.length === 478) {
      //draw pupils
      drawLandmarks(
        this.canvasCtx,
        [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
        {
          color: "#ffe603",
          lineWidth: 2,
        }
      );
    }
    drawConnectors(
      this.canvasCtx,
      results.leftHandLandmarks,
      holisticRoot.HAND_CONNECTIONS,
      {
        color: "#eb1064",
        lineWidth: 5,
      }
    );
    drawLandmarks(this.canvasCtx, results.leftHandLandmarks, {
      color: "#00cff7",
      lineWidth: 2,
    });
    drawConnectors(
      this.canvasCtx,
      results.rightHandLandmarks,
      holisticRoot.HAND_CONNECTIONS,
      {
        color: "#22c3e3",
        lineWidth: 5,
      }
    );
    drawLandmarks(this.canvasCtx, results.rightHandLandmarks, {
      color: "#ff0364",
      lineWidth: 2,
    });
  }
  animateModel(results) {
    const faceLandmarks = results.faceLandmarks;
    const pose3DLandmarks = results.ea;
    const pose2DLandmarks = results.poseLandmarks;
    const leftHandLandmarks = results.rightHandLandmarks;
    const rightHandLandmarks = results.leftHandLandmarks;
    const rigResults = {};
    if (faceLandmarks) {
      const riggedFace = Face.solve(faceLandmarks, {
        runtime: "mediapipe",
        video: this.video,
      });
      rigResults.riggedFace = riggedFace;
      this.rigFace(riggedFace);
    }
    if (pose2DLandmarks && pose3DLandmarks) {
      const riggedPose = Pose.solve(pose3DLandmarks, pose2DLandmarks, {
        runtime: "mediapipe",
        video: this.video,
      });
      rigResults.riggedPose = riggedPose;
      this.rigPose(riggedPose);
    }
    if (leftHandLandmarks) {
      const riggedLeftHand = Hand.solve(leftHandLandmarks, "Left");
      rigResults.riggedLeftHand = riggedLeftHand;
      this.rigLeftHand(riggedLeftHand);
    }
    if (rightHandLandmarks) {
      const riggedRightHand = Hand.solve(rightHandLandmarks, "Right");
      rigResults.riggedRightHand = riggedRightHand;
      this.rigRightHand(riggedRightHand);
    }
    if (this.onRiggedHolisticCallback !== null) {
      this.onRiggedHolisticCallback(rigResults);
    }
  }
  onRiggedHolistic(callback) {
    this.onRiggedHolisticCallback = callback;
  }
}
HolisticCaptureManager.prototype.setTarget = setTarget;
HolisticCaptureManager.prototype.createVideo = createVideo;
HolisticCaptureManager.prototype.onResults = onResults;
HolisticCaptureManager.prototype.askForMediaAccess = askForMediaAccess;
