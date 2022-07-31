import { Face } from "kalidokit";
import * as faceMeshRoot from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { setTarget, createVideo, onResults } from "./parents/parents.js";
// 虽然在node_modules中有训练好的数据，然而我根本不知道应该如何写路径引入，于是先复制粘贴了一份到项目目录下
const solutionPath = "./lib/@mediapipe/face_mesh/";
export class FaceMeshCaptureManager {
  constructor() {
    this.model = null;
    this.onRiggedFaceCallback = null;
    this.running = false;
  }

  start() {
    if (this.readyToRig !== undefined) {
      this.readyToRig();
    }
    this.createVideo();
    this.faceMesh = new faceMeshRoot.FaceMesh({
      locateFile: (file) => {
        return `${solutionPath}${file}`;
      },
    });
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    this.faceMesh.onResults(this.onResults.bind(this));

    this.camera = new Camera(this.video, {
      onFrame: async () => {
        await this.faceMesh.send({ image: this.video });
      },
      width: 640,
      height: 480,
    });
    this.camera.start();
    this.running = true;
  }
  drawResults(results) {
    if (results.multiFaceLandmarks.length < 1) {
      return;
    }
    const points = results.multiFaceLandmarks[0];
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Use `Mediapipe` drawing functions
    drawConnectors(this.canvasCtx, points, faceMeshRoot.FACEMESH_TESSELATION, {
      color: "#C0C0C070",
      lineWidth: 1,
    });
    if (points && points.length === 478) {
      //draw pupils
      drawLandmarks(this.canvasCtx, [points[468], points[468 + 5]], {
        color: "#ffe603",
        lineWidth: 2,
      });
    }
    this.canvasCtx.restore();
  }
  animateModel(results) {
    if (results.multiFaceLandmarks.length < 1) {
      return;
    }
    const riggedFace = Face.solve(results.multiFaceLandmarks[0], {
      runtime: "mediapipe",
      video: this.video,
    });
    if (this.onRiggedFaceCallback !== null) {
      this.onRiggedFaceCallback(riggedFace);
    }
    if (this.model !== null) {
      this.rigFace(riggedFace);
    }
  }
  onRiggedFace(callback) {
    this.onRiggedFaceCallback = callback;
  }
}
FaceMeshCaptureManager.prototype.setTarget = setTarget;
FaceMeshCaptureManager.prototype.createVideo = createVideo;
FaceMeshCaptureManager.prototype.onResults = onResults;
