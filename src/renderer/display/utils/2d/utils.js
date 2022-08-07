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
