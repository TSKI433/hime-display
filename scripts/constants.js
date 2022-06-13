const path = require('path')

module.exports = {
  MAIN_ROOT: path.resolve(__dirname, '../src/main'),
  MAIN_PRELOAD_ROOT: path.resolve(__dirname, '../src/preload'),
  RENDERER_ROOT: path.resolve(__dirname, '../src/renderer')
}