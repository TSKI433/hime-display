import { FaceMeshCaptureManager } from "./FaceMeshCaptureManager.js";
import { Vector, Face } from "kalidokit";
const { lerp } = Vector;
export class Live2DFaceMeshCaptureManager extends FaceMeshCaptureManager {
  rigFace(riggedFace, lerpRatio = 0.5) {
    // rigFace下方的rig逻辑直接迁移自Kalidokit开发者提供的demo：https://glitch.com/edit/#!/kalidokit-live2d
    const coreModel = this.model.internalModel.coreModel;
    coreModel.setParameterValueById(
      "ParamEyeBallX",
      lerp(
        riggedFace.pupil.x,
        coreModel.getParameterValueById("ParamEyeBallX"),
        lerpRatio
      )
    );
    coreModel.setParameterValueById(
      "ParamEyeBallY",
      lerp(
        riggedFace.pupil.y,
        coreModel.getParameterValueById("ParamEyeBallY"),
        lerpRatio
      )
    );
    // X and Y axis rotations are swapped for Live2D parameters
    // because it is a 2D system and KalidoKit is a 3D system
    coreModel.setParameterValueById(
      "ParamAngleX",
      lerp(
        riggedFace.head.degrees.y,
        coreModel.getParameterValueById("ParamAngleX"),
        lerpRatio
      )
    );
    coreModel.setParameterValueById(
      "ParamAngleY",
      lerp(
        riggedFace.head.degrees.x,
        coreModel.getParameterValueById("ParamAngleY"),
        lerpRatio
      )
    );
    coreModel.setParameterValueById(
      "ParamAngleZ",
      lerp(
        riggedFace.head.degrees.z,
        coreModel.getParameterValueById("ParamAngleZ"),
        lerpRatio
      )
    );
    // update body params for models without head/body param sync
    const dampener = 0.3;
    coreModel.setParameterValueById(
      "ParamBodyAngleX",
      lerp(
        riggedFace.head.degrees.y * dampener,
        coreModel.getParameterValueById("ParamBodyAngleX"),
        lerpRatio
      )
    );
    coreModel.setParameterValueById(
      "ParamBodyAngleY",
      lerp(
        riggedFace.head.degrees.x * dampener,
        coreModel.getParameterValueById("ParamBodyAngleY"),
        lerpRatio
      )
    );
    coreModel.setParameterValueById(
      "ParamBodyAngleZ",
      lerp(
        riggedFace.head.degrees.z * dampener,
        coreModel.getParameterValueById("ParamBodyAngleZ"),
        lerpRatio
      )
    );
    // Simple example without winking.
    // Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    //  这里采用的计算方式和MMD那边一样，目前也是不考虑wink的
    let stabilizedEyes = Face.stabilizeBlink(
      {
        l: lerp(
          riggedFace.eye.l,
          coreModel.getParameterValueById("ParamEyeLOpen"),
          0.7
        ),
        r: lerp(
          riggedFace.eye.r,
          coreModel.getParameterValueById("ParamEyeROpen"),
          0.7
        ),
      },
      riggedFace.head.y
    );
    // eye blink
    coreModel.setParameterValueById("ParamEyeLOpen", stabilizedEyes.l);
    coreModel.setParameterValueById("ParamEyeROpen", stabilizedEyes.r);
    // mouth
    coreModel.setParameterValueById(
      "ParamMouthOpenY",
      lerp(
        riggedFace.mouth.y,
        coreModel.getParameterValueById("ParamMouthOpenY"),
        0.3
      )
    );
    // Adding 0.3 to ParamMouthForm to make default more of a "smile"
    coreModel.setParameterValueById(
      "ParamMouthForm",
      0.3 +
        lerp(
          riggedFace.mouth.x,
          coreModel.getParameterValueById("ParamMouthForm"),
          0.3
        )
    );
  }
}
