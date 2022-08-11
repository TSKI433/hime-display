export function setModelBaseTransfrom(model, displayConfig) {
  const configWidth =
    (innerWidth *
      (displayConfig["2d-initial-width-range"][1] -
        displayConfig["2d-initial-width-range"][0])) /
    100;
  const configHeight =
    (innerHeight *
      (displayConfig["2d-initial-height-range"][1] -
        displayConfig["2d-initial-height-range"][0])) /
    100;
  const scaleX = configWidth / model.width;
  const scaleY = configHeight / model.height;
  model.scale.set(Math.min(scaleX, scaleY));
  // model.x = app.renderer.view.width / this.resolution - model.width;
  // model.y = app.renderer.view.height / this.resolution - model.height;
  model.x = (innerWidth * displayConfig["2d-initial-width-range"][0]) / 100;
  model.y = (innerHeight * displayConfig["2d-initial-height-range"][0]) / 100;
}
export function draggable(model) {
  // 折磨死我了，终于找到了问题所在，之前使用pixi-live2d-display都是直接用自动的interact，现在加载模型时设定为autoInteract: false就不一样了，本以为这个参数也就控制了个hit事件和鼠标跟踪，结果一看源码发现这也给模型的interactive设定为true了，进一步追溯，发现这是一个pixi.js的属性，设定为true才能正常响应事件，若为false，即使模型的_events可以看到事件，依旧是无法正常响应的。然后spine那边根本就没有对这个属性进行操作，所以自然也不能响应事件
  model.interactive = true;
  model.on("pointerdown", (e) => {
    console.log("pointerdown");
    if (e.data.button == 0) {
      //防止右键触发移动事件
      model.dragging = true;
      model._pointerX = e.data.global.x - model.x;
      model._pointerY = e.data.global.y - model.y;
    }
  });
  model.on("pointermove", (e) => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
      model.dragged = true;
    }
  });
  model.on("pointerupoutside", () => (model.dragging = false));
  model.on("pointerup", () => (model.dragging = false));
}
