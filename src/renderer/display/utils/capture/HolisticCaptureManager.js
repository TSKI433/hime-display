import { Face, Pose, Hand } from "kalidokit";
import * as holisticRoot from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { setTarget, createVideo, onResults } from "./parents/parents.js";
export class HolisticCaptureManager {
  constructor() {
    this.model = null;
    this.onRiggedHolisticCallback = null;
    this.running = false;
  }
  start() {
    if (this.readyToRig !== undefined) {
      this.readyToRig();
    }
    this.createVideo();
    this.holistic = new Holistic({
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
        await this.holistic.send({ image: this.video });
      },
      width: 640,
      height: 480,
    });
    this.camera.start();
    this.running = true;
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
      FACEMESH_TESSELATION,
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
    }
    if (rightHandLandmarks) {
      const riggedRightHand = Hand.solve(rightHandLandmarks, "Right");
      rigResults.riggedRightHand = riggedRightHand;
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
