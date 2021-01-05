const {join} = require('path');
const FileHandler = require('../lib/index').FileHandler;
const fs = require('fs');

const find = require('find');

const fh = new FileHandler()

// RETURNS DIRECTORY SIZE
fh.getDirectorySize(join(__dirname , '/videos/'), (err, value) => {
  if (err) {
    console.log('Error Occured')
    console.log(err)
    return true
  }
  console.log('Folder Size is ' + value)
});
// REMOVES ALL MEDIA FILES
/*
fh.removeDirectory(join(__dirname , '/videos/*'), () => {
  console.log('Done')
});
*/

(function(){


  const Recorder = require('../lib/index').Recorder

  var rec = new Recorder({
    url: 'rtsp://admin:hello1234@192.168.0.20:554/h264/ch1/main/av_stream',
    timeLimit: 60 * 15, // time in seconds for each segmented video file
    folderSizeLimit : 10,
    folder: join(__dirname , '/videos/'),
    name: 'cam1',
  })
  // Starts Recording
  rec.startRecording();

})();





// vim:ts=2:sw=2:sts=2
