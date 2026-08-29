# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

用 ffmpeg 给 rtsp/http 视频流分段录像并存储到本地的 Node.js 工具，通过 Docker 部署在 openwrt 软路由上。ffmpeg 二进制来自 `ffmpeg-ffprobe-static` 依赖，无需系统安装 ffmpeg。代码和日志均使用中文。

## 常用命令

- `npm run start` / `npm run dev` — 运行 `bin/recorder.js`（读取 `config/config.json`）
- `node example/home.js` — 源码调试入口，内含一个可用的 http 测试流地址
- `npm run docker:build` — 构建 amd64 Docker 镜像（本地调试）
- `npm run docker:build_arm` — 构建 arm64 Docker 镜像（openwrt 软路由用）
- `npm run clear` — 清空 `./videos/*`
- `npm test` — 无测试，会直接报错退出

注意：仓库没有 package-lock.json（被 .gitignore 排除），安装依赖用 `npm install`。

## 架构

三个入口层：

- `lib/index.js` — 包的公共 API，导出 `Recorder` 和 `FileHandler`（发布到 npm）
- `bin/recorder.js` — CLI 入口：合并 `config/config.json` 和硬编码默认值（timeLimit 15 分钟、folderSizeLimit 5GB、name cam1、folder 为仓库下 `videos/`），然后启动 Recorder。config.json 中值为空字符串的字段会被过滤掉，回退到默认值
- `example/` — 库使用方式的示例

核心类：

- `lib/helpers/recorder.js` — `RTSPRecorder`：分段录像的全部逻辑
- `lib/helpers/fileHandler.js` — `FileHandler`：目录创建、递归计算目录大小（`du`）、按 birthtime 查找并删除最旧的 mp4（`find`）

### 录像循环机制（最重要的跨文件逻辑）

`recordStream()` 启动 ffmpeg 子进程写文件，之后靠事件链驱动循环，不是轮询：

1. `timeLimit` 到点 → `setTimeout` 触发 `killStream()` 杀掉 ffmpeg；ffmpeg 意外退出也会走同样路径
2. 子进程 `exit` 事件 → `streamFragmentHandler()` → 先 `deleteMp4TillSizeLimit()`
3. `deleteMp4TillSizeLimit()` 做两层磁盘保护（都是递归重试）：
   - 硬阈值：`check-disk-space` 检测剩余空间 < 70MB 视为已满（`hasEnoughSpace` 函数）
   - 软上限：文件夹总大小 ≥ `folderSizeLimit` GB 时删除最旧的 mp4 后重新检查
4. 检查通过 → 再次 `recordStream()` 写下一段文件

另外 `_limitCount` 每录满 10 段会强制 `stopRecording()` + `startRecording()` 重启整个录像流（重置 ffmpeg 进程）。`stopRecording()` 置 `disableStreaming = true` 阻止 exit 事件继续链式录像。

### 配置约定

- `timeLimit` 单位是**分钟**（构造器内部 ×60 转秒）
- `type` 三种模式：`'video'`（默认，mp4，直拷码流 + aac 音频）、`'audio'`（avi，仅音频）、`'image'`（jpg 截图，走 `captureImage()`，不进入分段循环）
- 输出目录结构：`{folder}/{name}/{日期目录}/{文件名}`，其中日期目录由 `directoryPathFormat`（默认 `YYYY-MM-DD`）、文件名由 `fileNameFormat`（默认含中文字符）通过 moment 格式化；audio/image 类型在日期目录下多一层类型子目录
- 录像中断（如硬盘被拔出）时自动 3 秒后重试

## Docker 部署

基础镜像 `node:14-alpine`，构建后需手动 `docker save`/`docker load` 部署到 openwrt（README 强调不要用 openwrt 的 GUI 导入，有已知 bug）。运行时挂载两个目录：

- `/app/config` — 放 `config.json`
- `/app/videos` — 录像输出

完整 `docker run` 命令见 README。

## 代码风格

旧式 ES5 风格：`var` 声明、回调（非 Promise）、`class` + 不写分号，源码注释和 console 日志为中文，文件末尾有 vim modeline（`// vim:ts=2:sw=2:sts=2`）。依赖库尽量保持旧版本（moment 2.x、rimraf 2.x 等），不要随意升级。
