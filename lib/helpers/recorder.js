//
//  recorder.js
//  rtsp-downloader
//

const moment       = require('moment')
const childProcess = require('child_process')
const path         = require('path')
const FileHandler  = require('./fileHandler')
const ffmpeg       = require('ffmpeg-ffprobe-static').ffmpegPath;
const checkDiskSpace = require('check-disk-space').default;

const fh = new FileHandler()

const hasEnoughSpace = function(pathName, successCallback, failureCallback) {
  checkDiskSpace(pathName).then((diskSpace) => {
    if (diskSpace.free < 70000000) {
      failureCallback();
    } else {
      successCallback();
    }
  });
};

const RTSPRecorder = class {
  constructor(config = {}) {
    this.config              = config
    this.name                = config.name
    this.url                 = config.url
    this.folderSizeLimit     = config.folderSizeLimit || 10; // 单位 G
    this.timeLimit           = (config.timeLimit || 60) * 60 // 单位 分钟
    this._limitCount         = 10;
    this.folder              = config.folder || 'media/'
    this.categoryType        = config.type || 'video'
    this.directoryPathFormat = config.directoryPathFormat || 'YYYY-MM-DD'
    this.fileNameFormat      = config.fileNameFormat || 'YYYY-MM-DD___HH时mm分ss秒'

    try {
      fh.createDirIfNotExists(this.getDirectoryPath())
      fh.createDirIfNotExists(this.getTodayPath())
    } catch(err) {
      console.log('constructor, 创建录像目录失败')
    }
  }

  getFolderSizeLimit() {
    return Math.pow(2, 30) * this.folderSizeLimit;
  }

  getDirectoryPath() {
    return path.join(this.folder, (this.name ? this.name : ''))
  }

  getTodayPath() {
    return path.join(this.getDirectoryPath(), moment().format(this.directoryPathFormat))
  }

  getMediaTypePath() {
    // 如果是 video 的话就不加一层目录了
    if(this.categoryType == "video") {
      return this.getTodayPath();
    } else {
      return path.join(this.getTodayPath(), this.categoryType)
    }
  }

  getFilename(folderPath) {
    return path.join(folderPath, moment().format(this.fileNameFormat) + this.getExtenstion())
  }

  getExtenstion() {
    if (this.categoryType === 'audio') {
      return '.avi'
    }
    if (this.categoryType === 'image') {
      return '.jpg'
    }

    return '.mp4'
  }

  getArguments() {
    if (this.categoryType === 'audio') {
      return ['-vn', '-acodec', 'copy']
    }
    if (this.categoryType === 'image') {
      return ['-vframes', '1']
    }
    return ['-acodec', 'copy', '-vcodec', 'copy', '-c:a', 'aac']
  }

  getChildProcess(fileName) {
    var args = ['-i', this.url]
    const mediaArgs = this.getArguments()

    mediaArgs.forEach((item) => {
      args.push(item)
    })
    args.push(fileName)

    return childProcess.spawn(ffmpeg,
      args,
      { detached: false, stdio: 'ignore' })
  }

  stopRecording() {
    this.disableStreaming = true

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.writeStream) {
      this.killStream()
    }
  }

  startRecording() {
    var self = this;
    if (!this.url) {
      console.log('URL Not Found.')
      return true
    }

    this.disableStreaming = false
    try {
      this.recordStream();
    } catch(err) {
      console.log('录像错误，估计是硬盘拔掉了，3秒后重试');
      setTimeout(() => {
        self.startRecording()
      }, 3000);
    }
  }

  captureImage(cb) {
    this.writeStream = null
    const folderPath = this.getMediaTypePath()

    fh.createDirIfNotExists(folderPath)

    const fileName = this.getFilename(folderPath)
    this.writeStream = this.getChildProcess(fileName)
    this.writeStream.once('exit', () => {
      if (cb) {
        cb()
      }
    })
  }

  killStream() {
    this.writeStream.kill()
  }

  streamFragmentHandler() {
    let self = this;

    self.deleteMp4TillSizeLimit(() => {
      self._limitCount--;

      try {
        if(self._limitCount <= 1) {
          self._limitCount = 10;
          self.stopRecording();
          self.startRecording();
        } else {
          self.recordStream()
        }
      } catch(err) {
        console.log('录像写入错误，估计是硬盘拔掉了，3 秒后重试', new Date().toString());
        setTimeout(() => {
          self.startRecording()
        }, 3000);
      }
    });
  }

  recordStream() {
    if (this.categoryType === 'image') {
      return
    }

    const self = this

    if (this.timer) {
      clearTimeout(this.timer)
    }

    fh.createDirIfNotExists(this.getDirectoryPath())
    fh.createDirIfNotExists(this.getTodayPath())

    if (this.writeStream && this.writeStream.binded) {
      return false
    }

    if (this.writeStream && this.writeStream.connected) {
      this.writeStream.binded = true
      this.writeStream.once('exit', () => {
        self.streamFragmentHandler();
      })
      this.killStream();
      return false
    }

    this.writeStream = null
    const folderPath = this.getMediaTypePath()
    fh.createDirIfNotExists(folderPath)
    const fileName = this.getFilename(folderPath)
    this.writeStream = this.getChildProcess(fileName)

    this.writeStream.once('exit', () => {
      if (self.disableStreaming) {
        return true
      }

      self.streamFragmentHandler();
    });

    this.timer = setTimeout(self.killStream.bind(this), this.timeLimit * 1000)
    console.log('Start record ' + fileName)
  }

  deleteMp4TillSizeLimit(callback) {
    let self = this;

    // 如果磁盘空间已满
    hasEnoughSpace(self.folder, () => {
      // success
      console.log('hasEnoughSpace', 'success')
      fh.getDirectorySize(self.folder, (err, value) => {
        if (err && err.code == 'ENOENT') {
          // 拔掉了硬盘
          console.log('拔掉了disk，3 秒后重试录像 ', new Date().toString());
          setTimeout(callback, 3000);
        } else if (value >= self.getFolderSizeLimit()) {
          // 超过文件夹上限配置
          fh.deleteOldestMp4(self.folder, (err) => {
            if (err) throw err;
            self.deleteMp4TillSizeLimit(callback);
          });
        } else {
          // 正常存储
          callback();
        }
      });

    }, () => {
      // failure
      console.log('hasEnoughSpace', 'failure')
      // 磁盘空间已满，删除文件后再存储
      fh.deleteOldestMp4(self.folder, (err) => {
        // 最常见的就是文件夹没有文件了，抛出异常
        if (err) throw err;
        self.deleteMp4TillSizeLimit(callback);
      });
    });

  }
}

module.exports = RTSPRecorder
// vim:ts=2:sw=2:sts=2
