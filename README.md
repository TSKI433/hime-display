# Hime Display

<p align="center">
<img width="150" src="./public/icons/icon.png">
</p>

English | [简体中文](./README-CN.md) | [日本語](./README-JP.md)

[Download && Documents (Chinese only)](https://hime.xdrv.cn/)

Hime Display aims to create an open-source, cross-platform, universal desktop model presenter.

## Features

1. Multiple Model Type Support: Supports loading Live2D, MMD, VRoid, Spine models.
2. Motion Capture: Provides motion capture support for Live2D, MMD, VRoid with the help of Google's MediaPipe.
3. Cross Platform: Supports Windows and macOS.
4. Multilingual support: Supports English, Simplified Chinese, and Japanese.
5. Full Model Control: Various operations can be performed on the model, including bone transformation, deformation, and animation playback.
6. Animation transition: MMD model can load animations from Mixamo directly (Plan to support VRoid).

## Basic Usage

### Design of model database

The application uses one or more paths as the model data source. It can recursively detect the model under these paths according to some model file features and add them to the database.

### Method to load models

1. Click `Source` in left row of the control panel.
2. `Add Data Source`, select the directory of models, motions, and audios.
3. Click `Refresh` in the source path operations.
4. Click `Model` in left row, select the model you want to load in the model database, the selected one will be highlighted.
5. Last step, Click `Load Selected Model` under the database.

### Attentions

1. Different types of models, motions, audios can be put in the same data source.
2. In order to improve efficiency and enhance generality, for most file types, the detection process does not read the content of the file, and mainly judges by the file extension. So even if the file has problems or is not supported, it may be loaded into the database.
3. For some types of models, their file names are usually not the model names, and the names of the upper-level directory of the model files will be used as the model names, so placing multiple model files in the same directory may be confusing.
4. For motions and audios, their file names are usually related to the contents, so the file names will be used as the names, and placeing them into one directory will not cause naming confusion.
5. After adding data source, you can click `Edit` and decide the search type. All types will be detected by default.
6. When the search is complete, it will automatically update the statistic info, model database, motion database, and audio database (the latter two are displayed in the animation control page of the selected and displayed 3D model)

## Implemented Features Comparison

|                    |           MMD           |        VRoid        |          Live2D           |           Spine           |
| :----------------: | :---------------------: | :-----------------: | :-----------------------: | :-----------------------: |
| Model Description  |           ✅            |         ✅          |            ✅             |            ✅             |
|  Object Transform  |           ✅            |         ✅          |            ✅             |            ✅             |
| Animation Control  |           ✅            | ❌<br/>(Developing) |            ✅             |            ✅             |
| Physics Simulation | ✅<br/>(Animation only) | ✅<br/>(All status) |   ❌<br/>(Considering)    |   ❌<br/>(Not support)    |
| Parameter Control  |          Morph          |        Morph        |    Parameter<br/>Part     |       ❌<br/>(TODO)       |
|    Face Capture    |           ✅            |         ✅          |            ✅             | ❌<br/>(No specification) |
|  Holistic Capture  |           ✅            |         ✅          | ❌<br/>(No specification) | ❌<br/>(No specification) |

## Main Techniques

This application mainly uses Front-end technology, based on [Electron](https://www.electronjs.org/), mainly uses [Vite](https://vitejs.dev/) as build tools.

Uses [lowdb](https://github.com/typicode/lowdb) as the database.

Multilingual support adopted [i18next](https://www.i18next.com/).

The control panel adopted [Vue](https://vuejs.org/) framework and [Element Plus](https://element-plus.org/) component library.

Uses [Pixi.js](https://pixijs.com/) as the rendering engine of 2D models, and the 3D models use [Three.js](https://threejs.org/).

Motion capture adopts Google's [MediaPipe](https://mediapipe.dev/), and adopts [Kalidokit](https://github.com/yeemachine/kalidokit) to analyse captured data.

## Develop

```bash
# Install dependencies
yarn
# start
yarn start
# build (The specific build version can be configured in the `build.config.js` file in the root directory)
yarn run build
```

## Special Thanks

This is my first attempt to develop a full application, maybe there are some deficiencies.

The file structure of this application refers to a download tool [Motrix](https://motrix.app/) which is also developed by Electron.

Thanks to the author of [HuiDesktop](https://github.com/HuiDesktop/HuiDesktop) for some technical support on Spine.

Thanks to [greenjerry](https://github.com/greenjerry) for supporting me in material, spiritual, software and hardware.
