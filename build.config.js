/**
 * @type {import('electron-builder').CliOptions}
 * {@link https://www.electron.build/configuration/configuration}
 */
const builder = require("electron-builder");
const options = {
  targets: builder.Platform.WINDOWS.createTarget(),
  config: {
    productName: "Hime Display",
    directories: {
      output: "build",
    },
    files: ["dist/renderer/**/*", "dist/main/**/*"],
    // asar: false,
    dmg: {
      contents: [
        {
          x: 410,
          y: 150,
          type: "link",
          path: "/Applications",
        },
        {
          x: 130,
          y: 150,
          type: "file",
        },
      ],
    },
    mac: {
      icon: "public/icons/icon.png",
      extendInfo: {
        // 现在的macOS应用想要访问摄像机等权限必须在此声明，i18n我是没本事做到这儿来了，因此就用英文了
        NSCameraUsageDescription:
          "Face mesh and holistic capturing need to access to your camera",
        "com.apple.security.device.camera": true,
      },
    },
    nsis: {
      oneClick: false,
      allowElevation: true,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: false,
    },
    win: {
      icon: "public/icons/icon.png",
      target: [
        {
          target: "nsis",
          arch: ["x64"],
        },
      ],
    },
    // linux: {
    //   icon: "public/icons",
    // },
  },
};

module.exports = options;
