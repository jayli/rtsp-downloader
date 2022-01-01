const {join} = require('path');
const Recorder = require('../lib/index').Recorder
const FileHandler = require('../lib/index').FileHandler;
const fs = require('fs');

const fh = new FileHandler();

(function(){

  var rec = new Recorder({
    url: 'rtsp://admin:123456@192.168.0.1:554/h264/ch1/sub/av_stream',
    timeLimit: 60 * 15, // 15 minutes
    folderSizeLimit : 5,
    folder: join(__dirname , '/videos/'),
    name: 'cam1',
  });

  rec.startRecording();

})();

// vim:ts=2:sw=2:sts=2
