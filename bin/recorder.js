#!/usr/local/bin/node

const {join} = require('path');
const Recorder = require('../lib/index').Recorder
const FileHandler = require('../lib/index').FileHandler;
const childProcess = require('child_process')
const fs = require('fs');
const os = require('os');

const config = (function(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => value !== '')
  );
})(require('../config/config.json'));

const defaultConfig = {
  url: "",
  timeLimit: 60 * 15, // 15 minutes
  folderSizeLimit : 5,
  folder: join(__dirname , '/videos/'),
  name: 'cam1',
};

const fullConfig = {
  ...defaultConfig, ...config
};

(function() {



  // const child = childProcess.spawn('/app/node_modules/ffmpeg-ffprobe-static/ffmpeg',
  //   [
  //     '--help',
  //     // '-i',
  //     // 'http://47.51.131.147/-wvhttp-01-/GetOneShot?image_size=1280x720&frame_count=1000000000',
  //     // '/app/videos/xxxxx.mp4'
  //     // '/Users/bachi/ttt/aaa/xxxxx.mp4'
  //   ],
  //   { 
  //     detached: false,
  //     stdio: 'inherit',
  //   });

  // console.log(child);
  // return;
  // child.stdout.on("data", (data) => {
  //   console.log(data)
  // })

  // child.stderr.on('data', (data) => {
  //   console.error(data)
  // })

  // child.on('close', (code) => {
  //   console.log('进程关闭' + ' ' + code)

  // })

  // console.log('ok')

  // return;

  var rec = new Recorder(fullConfig);
  rec.startRecording();
  console.log('recoder running')
})();

// vim:ts=2:sw=2:sts=2
