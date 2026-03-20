export const defalutDatabase = {
  modelNow: null,
  sourcePathInfo: [],
  model: [],
  // 新增：存储每个模型的个性化配置
  modelConfig: {
    // 格式示例：
    // "MO.v1.3.3": {
    //   position: { x: 160, y: 200 },
    //   scale: 1.1,
    //   autoEyeBlink: true,
    //   autoBreath: true,
    //   trackMouse: true,
    //   lastLoadTime: 1678901234567  // 最后加载时间戳
    // }
  },
  motion3D: [],
  audio3D: [],
};
