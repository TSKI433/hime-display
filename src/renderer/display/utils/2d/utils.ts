export function setModelBaseTransfrom(model, displayConfig, type) {
  const configWidth =
    (innerWidth *
      (displayConfig[type + "-initial-width-range"][1] -
        displayConfig[type + "-initial-width-range"][0])) /
    100;
  const configHeight =
    (innerHeight *
      (displayConfig[type + "-initial-height-range"][1] -
        displayConfig[type + "-initial-height-range"][0])) /
    100;
  const scaleX = configWidth / model.width;
  const scaleY = configHeight / model.height;
  model.scale.set(Math.min(scaleX, scaleY));
  // model.x = app.renderer.view.width / this.resolution - model.width;
  // model.y = app.renderer.view.height / this.resolution - model.height;
  model.x =
    (innerWidth * displayConfig[type + "-initial-width-range"][0]) / 100;
  model.y =
    (innerHeight * displayConfig[type + "-initial-height-range"][0]) / 100;
}
export function draggable(model) {
  // 别看就是一点一按，这指针事件的判断复杂程度超乎想象，来梳理一下事件触发顺序：
  // 点按：pointerdown,click,pointerup
  // 拖拽：pointerdown,pointermove,dragstart,(pointermove,dragging)*N,click,pointerup,dragend
  model.on("pointerdown", (e) => {
    // console.log("pointerdown");
    //防止右键触发移动事件
    if (e.data.button === 0) {
      model._pointerX = e.data.global.x - model.x;
      model._pointerY = e.data.global.y - model.y;
      // 不单单是一时的事件响应，pointerdown需要成为一个持续的状态
      model.afterPointerDown = true;
      // model.dragEmitted有两个作用，一个是用于给pointermove提供判断，在第一次移动是触发drag事件；另一个是交给click事件判断该事件是单纯的click还是拖拽了
      model.dragEmitted = false;
    }
  });
  model.on("pointermove", (e) => {
    if (model.afterPointerDown) {
      // console.log("pointermove");
      if (!model.dragEmitted) {
        // 初次在点按拖拽前提下触发移动事件时触发自己一拍脑袋想出来的拖拽事件
        model.emit("dragstart");
        model.dragEmitted = true;
      }
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
      model.emit("dragging");
    }
  });
  model.on("pointerupoutside", () => {
    // console.log("pointerupoutside");
    if (model.dragEmitted) {
      model.emit("dragend");
    }
    model.afterPointerDown = false;
  });
  model.on("pointerup", () => {
    // console.log("pointerup");
    // 只有真正拖动过模型才能触发dragend事件
    if (model.dragEmitted) {
      model.emit("dragend");
    }
    model.afterPointerDown = false;
  });
}
