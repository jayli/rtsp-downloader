#!/usr/local/bin/node

const {join} = require('path');
const Recorder = require('../lib/index').Recorder
const FileHandler = require('../lib/index').FileHandler;
const fs = require('fs');
const os = require('os');

const config = (function(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => value !== '')
  );
})(require('../config/config.json'));

const defaultConfig = {
  url: "",
  timeLimit: 15, // 15 minutes
  folderSizeLimit : 5,  // 5 GB
  folder: join(__dirname , "..", '/videos/'),
  name: 'cam1',
};

const fullConfig = {
  ...defaultConfig, ...config
};

(function() {
  var rec = new Recorder(fullConfig);
  rec.startRecording();
  console.log('recoder running')
})();

// vim:ts=2:sw=2:sts=2
