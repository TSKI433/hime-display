// 此图片载入的预乘程序遵循GPL协议来源于https://github.com/HuiDesktop/huidesktop-ng-spine/blob/main/src/premultipliedImageLoader.ts
export default function imageLoaderAdapter(
  loader,
  namePrefix,
  baseUrl,
  imageOptions
) {
  if (
    typeof baseUrl === "string" &&
    baseUrl.lastIndexOf("/") !== baseUrl.length - 1
  ) {
    baseUrl += "/";
  }
  return function (line, callback) {
    const name = namePrefix + line;
    const url = baseUrl + line;

    const cachedResource = loader.resources[name];
    if (typeof cachedResource === "object") {
      const done = () => {
        cachedResource.texture.baseTexture.alphaMode =
          PIXI.ALPHA_MODES.PREMULTIPLIED_ALPHA; /* !! PIXI.ALPHA_MODES.PREMULTIPLY_ALPHA */
        callback(cachedResource.texture.baseTexture);
      };
      if (typeof cachedResource.texture === "object") {
        done();
      } else {
        cachedResource.onAfterMiddleware.add(done);
      }
    } else {
      loader.add(name, url, imageOptions, (resource) => {
        if (resource.error === undefined || resource.error === null) {
          resource.texture.baseTexture.alphaMode = 2;
          callback(resource.texture.baseTexture);
        } else {
          callback(undefined);
        }
      });
    }
  };
}
