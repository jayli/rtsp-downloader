const {join} = require('path');
const Recorder = require('../lib/index').Recorder
const FileHandler = require('../lib/index').FileHandler;
const fs = require('fs');
const os = require('os');

(function(){

  var rec = new Recorder({
    // rtsp testing
    url: 'http://47.51.131.147/-wvhttp-01-/GetOneShot?image_size=1280x720&frame_count=1000000000',
    // url: 'rtsp://admin:123456@192.168.0.1:554/h264/ch1/sub/av_stream',
    timeLimit: 60 * 15, // 15 minutes
    folderSizeLimit : 5,
    folder: join(__dirname , '/videos/'),
    name: 'cam1',
  });

  rec.startRecording();

})();

// vim:ts=2:sw=2:sts=2
