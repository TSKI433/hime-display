export const LIVE2D_VERSION = {
  CUBISM2: "Cubism2",
  CUBISM4: "Cubism4",
};

// Cubism2只能搞到一个经过混淆的js文件，要想直接控制内部的参数需要费点劲，这里对其混淆的结构进行了部分的分析
// {
//   _model: {
//     parts: [
//       {
//         partID: {
//           id: "PARTS_01_EYE_001",
//         },
//       },
//     ];
//     parameters: {
//       parametersInner: [
//         {
//           parameterDefaultValue: 0,
//           parameteMaxValue: 30,
//           parameteMinValue: -30,
//           parameteID: { id: "PARAM_ANGLE_X" },
//         },
//       ];
//     }
//   }
// }

// {
//   _parameterIds: [];
//   _parameterMaximumValues: [];
//   _parameterMinimumValues: [];
//   _partIds: [];
// getParameterValueByIndex()
// setParameterValueByIndex()
// getParameterValueById()
// setParameterValueById()
// getPartOpacityByIndex()
// }
// live2d旧版cubism2的SDK只能搞到混淆以后的代码，且core的结构和cubism4的结构差别较大
// 之前的控制逻辑是针对cubism4的，cubism2内部API差距较大，下游一个个适配太费劲了，为了实现对cubism2的控制支持，硬生生去拿着混淆后的结构去读取数据，并仿照cubism4的结构进行了部分API的实现
const Cubism2ConfusionDict = {
  _model: "_$MT",
  parts: "_$F2",
  partID: "_$NL",
  parameters: "_$vo",
  parametersInner: "_$4S",
  parameterDefaultValue: "_$FS",
  parameterMaxValue: "_$LT",
  parameterMinValue: "_$TT",
  parameterID: "_$wL",
};
// 缩写方便引用
const C2C = Cubism2ConfusionDict;
function camelToUpperSnake(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z])/g, "$1_$2")
    .toUpperCase();
}
export function AddCubism2Shim(coreModel) {
  coreModel._parameterIds = coreModel[C2C._model][C2C.parameters][
    C2C.parametersInner
  ].map((param) => param[C2C.parameterID].id);
  coreModel._parameterMaximumValues = coreModel[C2C._model][C2C.parameters][
    C2C.parametersInner
  ].map((param) => param[C2C.parameterMaxValue]);
  coreModel._parameterMinimumValues = coreModel[C2C._model][C2C.parameters][
    C2C.parametersInner
  ].map((param) => param[C2C.parameterMinValue]);
  coreModel._partIds = coreModel[C2C._model][C2C.parts].map(
    (part) => part[C2C.partID].id
  );
  coreModel.fixID = function (id) {
    if (id.startsWith("Param")) {
      return camelToUpperSnake(id);
    } else {
      return id;
    }
  };
  // cubism2的core会自动检测你传递的是索引还是ID，所以内部都在调用统一函数
  coreModel.getParameterValueByIndex = function (index) {
    return this.getParamFloat(index);
  };
  coreModel.setParameterValueByIndex = function (index, value) {
    this.setParamFloat(index, value);
  };
  coreModel.getParameterValueById = function (id) {
    id = this.fixID(id);
    return this.getParamFloat(id);
  };
  coreModel.setParameterValueById = function (id, value) {
    id = this.fixID(id);
    this.setParamFloat(id, value);
  };
  coreModel.getPartOpacityByIndex = function (index) {
    return this.getPartOpacity(index);
  };
  coreModel.setPartOpacityByIndex = function (index, value) {
    this.setPartsOpacity(index, value);
  };
}
