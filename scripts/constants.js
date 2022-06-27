const path = require("path");

module.exports = {
  MAIN_ROOT: path.resolve(__dirname, "../src/main"),
  // MAIN_PRELOAD_ROOT: path.resolve(__dirname, "../src/preload"),
  MAIN_CONTROL_PRELOAD_ROOT: path.resolve(__dirname, "../src/preload/control"),
  MAIN_DISPLAY_PRELOAD_ROOT: path.resolve(__dirname, "../src/preload/display"),
  RENDERER_ROOT: path.resolve(__dirname, "../src/renderer"),
};
