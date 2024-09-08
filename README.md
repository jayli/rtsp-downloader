# rtsp-downloader

![](https://nodei.co/npm/rtsp-downloader.png?downloads=true&downloadRank=true&stars=true)

@auther jayli

### Docker 开发和部署

用 ffmpeg 来给指定的 rtsp/http 视频流录像，存储到本地。基于 Docker 安装，推荐用在 openwrt。

准备工作：

- 本地打包：`npm run docker:build`
- 给arm的软路由打包：`npm run docker:build_arm`
- 本地调试启动：`npm run start`
- 导出包到本地：`docker save -o rtsp-downloader.tar rtsp-downloader`
- openwrt 安装包：`docker load < rtsp-downloader.tar`

启动容器：

```
docker run --init -d --restart=unless-stopped -v /mnt/usb6-2/Camera:/app/videos -v /root/Configs/rtsp-downloader:/app/config --publish 3000:3000 --name rtsp-downloader rtsp-downloader /app/bin/recorder.js
```

Mount 两个目录：

- 配置目录：映射到`/app/config`
- 录像目录：映射到`/app/videos`

配置目录中存放一个 `config.json` 文件：

```
{
  "url": "http://47.51.131.147/-wvhttp-01-/GetOneShot?image_size=1280x720&frame_count=1000000000",
  "timeLimit": 15,
  "folderSizeLimit" : 5,
  "name": "cam1",
}
```

- url: 视频流地址
- timeLimit: 视频文件时长，默认 15 分钟
- folderSizeLimit: 文件夹大小限制，默认 5 GB
- name: 摄像头名称，默认 cam1

> openwrt 启动容器报错：“[FATAL tini (7)] exec /app/bin.js failed: No such file or directory”
> 
> 这个是 openwrt 的 bug，别用他的后台 GUI 导入镜像文件，要手动拷贝进 openwrt 然后手动执行`docker load ...`命令

### 源码开发和调试

```
npm i --save rtsp-downloader
```

代码调用方式参照：`../example/home.js` 或者执行 `npm run dev`

使用方式：

```js
const Recorder = require('rtsp-downloader').Recorder
const FileHandler = require('rtsp-downloader').FileHandler;
```

例子：

```js
const Recorder = require('rtsp-downloader').Recorder

var rec = new Recorder({
  url: 'rtsp://192.168.1.12:8554/unicast',
  timeLimit: 60, // time in seconds for each segmented video file
  folder: '/Users/tmp/videos',
  folderSizeLimit : 10, // 10 G
  name: 'cam1',
})
// Starts Recording
rec.startRecording();
```

记录音频的例子：

```js
const Recorder = require('rtsp-downloader').Recorder

var rec = new Recorder({
  url: 'rtsp://192.168.1.12:8554/unicast',
  timeLimit: 60, // time in seconds for each segmented video file
  folder: '/Users/tmp/videos',
  name: 'cam1',
  type: 'audio',
})

rec.startRecording();

// stop recording
setTimeout(() => {
  console.log('Stopping Recording')
  rec.stopRecording()
  rec = null
}, 125000)
```

截图的例子：

```js
const Recorder = require('rtsp-downloader').Recorder

var rec = new Recorder({
  url: 'rtsp://192.168.1.12:8554/unicast',
  folder: '/Users/tmp/imgs/',
  name: 'cam1',
  type: 'image',
})

rec.captureImage(() => {
  console.log('Image Captured')
})
```

管理资源目录：

```js
const FileHandler = require('rtsp-downloader').FileHandler;
const fh = new FileHandler()

// RETURNS DIRECTORY SIZE
fh.getDirectorySize('/Users/tmp/videos/', (err, value) => {
  if (err) {
    console.log('Error Occured')
    console.log(err)
    return true
  }
  console.log('Folder Size is ' + value)
})

// REMOVES ALL MEDIA FILES
fh.removeDirectory('/Users/tmp/videos/*', () => {
  console.log('Done')
});
```

自定义目录格式

```js
const Recorder = require('rtsp-downloader').Recorder

var rec = new Recorder({
  url: 'rtsp://192.168.1.12:8554/unicast',
  timeLimit: 60, // time in seconds for each segmented video file
  folder: '/Users/tmp/videos',
  name: 'cam1',
  directoryPathFormat: 'MMM-D-YYYY',
  fileNameFormat: 'M-D-h-mm-ss',
});

// Default directoryPathFormat : MMM-Do-YY
// Default fileNameFormat : YYYY-M-D-h-mm-ss
// Refer to https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
//  for custom formats.
// Starts Recording
rec.startRecording();
```

------------------------------------
