# build应用时遇到的一些问题

## dependencies

electron builder没有自动的将node_modules需要的库复制到构建的应用中。

这个其实是yarn的workspace的锅，采用了workspace后依赖信息没有在根目录的，解决方案就是将主进程的依赖全部在根目录的package下写一遍，我也没工夫将你这个workspace取消掉了。

## lib

这里使用vite的构建以一个html作为入口文件，而rollup只能打包*type*="module"的script标签，处于各种各样的原因（一些库只能找到cdn链接，另一些总之就是一旦打包就要出奇怪的问题），没办法只能直接引用链接，这些文件被放到了lib文件夹下，但是vite这样一来不会自动将其自动复制到dist文件夹下，于是只能将其移动到vite的构建根目录下的public文件夹里，vite默认会将该文件夹下的所有文件复制到dist中，所以虽然public文件夹直接放到了renderer下，内部的文件其实只有display.html在用

应该还有一种解决方案，采用electron builder的extraFiles配置项

## assets

经过实践发现，如果入口html文件不放到vite构建的根目录renderer下，打包后生成的assets文件夹的目录引用是错的（html文件里面生成的只会是`./assets`但实际应该是`../assets`），于是没办法，将两个html提到renderer下了

## WebAssembly

在进行应用的build时，发现一旦打包electron应用，涉及到的WebAssembly技术全部失效，我……

### Ammo

一个是物理引擎Ammo，报错`both async and sync fetching of the wasm failed`，目前我对这个问题的认知是，处于Chrome的安全策略，wasm的文件是无法通过file://协议加载的，即使在electron中手动放开了这个限制，但那些wasm的加载程序依旧以为Chrome在严格管控，程序内部检测了一下加载链接是file协议，然后就直接甩手不干了…

发现ammo发行代码里有这么一段：

```javascript
function Ua(){return ra||!ea&&!fa||"function"!==typeof fetch||Pa("file://")?new Promise(function(a){a(Ta())}):fetch(Qa,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+Qa+"'";return a.arrayBuffer()}).catch(function(){return Ta()})}
```

根据分析，将`||Pa("file://")`直接删除，然后，ammo真的就好了

因此需要注意，`src/renderer/public/lib/three/ammo.wasm.js`本项目这个文件已经不是发行的源文件了

### mediapipe

另一个是mediapipe，直接报错找不到faceMesh，经过对压缩代码的分析，发现和ammo完全不是一个问题，挂载faceMesh的对象是个直接就是个空对象，没对其添加任何属性，盲猜可能是vite的打包机制出了什么特殊的问题

不单单是faceMesh，Holistic，Camera等等也有类似的问题。于是将mediapipe的所有引入改为从cdn链接下载到本地的文件，然后，他就好了

## 摄像机权限

我是万万没想到，electron在macOS上面申请个权限那么复杂，好像是自某个macOS版本后Apple对这些权限的管理变严了。如果什么都不配置，初次启动，相机指示灯亮了一会儿就黑了，没报错，但什么反应也没有；再次使用相机，控制台直接报：`Uncaught (in promise) DOMException: Could not start video source`

折腾了半天，还被国内的一些博客坑了，不过终于是配好了，这个东西主要涉及到两个关键点：

### build配置项

一个是要在Info.plist中说明权限，若是在electron builder中，需要在mac构建的配置中这样写：

```javascript
extendInfo: {
        NSCameraUsageDescription:
          "Face mesh and holistic capturing need to access to your camera",
        "com.apple.security.device.camera": true,
      },
//麦克风的话是这两个：
//NSMicrophoneUsageDescription:"xxx"
//"com.apple.security.device.audio-input": true
```

虽然上方的配置已经解决了我的问题，还看见一种操作是上方仅配置NSCameraUsageDescription，不配置com.apple.security.device.camera，自己写一个plist文件，然后在mac构建配置中引入：

```
"entitlements": "entitlements.mac.plist",
```

entitlements.mac.plist的内容大概这样：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
    <key>com.apple.security.device.camera</key>
    <true/>
  </dict>
</plist>
```

### 主进程申请权限

仅仅靠上方的配置，应用程序根本就不会向macOS的设置申请权限，这个操作必须由主进程主动发起：

```
const { systemPreferences } = require('electron')
const microphone = systemPreferences.askForMediaAccess('microphone');
const camera = systemPreferences.askForMediaAccess('camera');
```

初次执行这个东西的时候会发出权限申请，再次执行就直接返回个布尔值了

这个API是仅仅针对Mac的，Windows下似乎不用

参考链接：

* https://developer.apple.com/documentation/avfoundation/capture_setup/requesting_authorization_for_media_capture_on_macos?language=objc
* https://www.electron.build/api/programmatic-usage.html
* https://cloud.tencent.com/developer/article/1700255
* https://stackoverflow.com/questions/72024011/electron-app-not-asking-for-camera-and-microphone-permission-on-macos-monterey
* https://github.com/electron/electron/issues/17640

## Windows下的路径解析

构建应用后到Windows环境测试，发现Spine，MMD均无法正确载入，根据控制台的报错，发现这两种模型的贴图载入路径变成了以当前展示器html所在位置为根目录的相对路径，形如`win-unpacked/resources/app/dist/renderer/skin.bmp`

由于Three.js的源代码十分清晰（业界楷模！），决定先从解决MMD的问题入手。

不知道什么原因，控制台的资源载入报错完全没有堆栈信息，我直接现场爆炸，后来以Three的MMDLoader为入口，经过大量断点检测和堆栈查询（过程十分复杂，跳转了十多个文件），最终找到万恶之源，位于Three项目目录下的`src/loaders/LoaderUtils.js`文件中的extractUrlBase函数，内容如下：

```javascript
	static extractUrlBase( url ) {

		const index = url.lastIndexOf( '/' );

		if ( index === - 1 ) return './';

		return url.slice( 0, index + 1 );

	}
```

现在问题就变得简单了，Windows下的路径，他斜杠是`\`啊，根本就搜不到`\`，这在浏览器中并不成问题，但是这里通过，于是经过路径解析后，模型的根就变成了"./"，于是乎就爆炸了……

于是我面前现在有这么几条路可以走：

1. 把extractUrlBase直接改了，但我估计这么干，直接发送提交请求到three的仓库里估计也不会被同意，毕竟这个需求比较特殊，在eletron这种阴间环境下使用file协议载入整个网页……

2. 在堆栈上一级的examples/jsm/loaders/MMDLoader.js文件中做手脚，解析路径的代码在MMDLoader类的load函数里，内容如下：

   ```javascript
   // Load MMD assets as Three.js Object
   
   	/**
   	 * Loads Model file (.pmd or .pmx) as a SkinnedMesh.
   	 *
   	 * @param {string} url - url to Model(.pmd or .pmx) file
   	 * @param {function} onLoad
   	 * @param {function} onProgress
   	 * @param {function} onError
   	 */
   	load( url, onLoad, onProgress, onError ) {
   
   		const builder = this.meshBuilder.setCrossOrigin( this.crossOrigin );
   
   		// resource path
   
   		let resourcePath;
   
   		if ( this.resourcePath !== '' ) {
   
   			resourcePath = this.resourcePath;
   
   		} else if ( this.path !== '' ) {
   
   			resourcePath = this.path;
   
   		} else {
   
   			resourcePath = LoaderUtils.extractUrlBase( url );
   
   		}
   //此处省略一堆代码
   
   	}
   ```

   我只要想办法给this.path或者this.resourcePath弄上点什么东西就行了，但是这个也是要涉及到改源码的

3. 究极解决办法，我发现啊，electron在Windows下的资源路径，原来是`/`和`\`（需要转译成`\\`）都认的，那我只要一开始把数据内部存储的路径的斜杠全部改成`/`不就行了？感觉这个想法有点大胆啊，一做测试，没想到真的就成了，完美啊，其实Spine那边也是同一个道理，然后就成功解决所有问题了

总结：Windows的文件路径斜杠就是业界毒瘤，万恶之源！