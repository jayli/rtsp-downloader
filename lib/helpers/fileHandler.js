const fs = require('fs')
const rimraf = require('rimraf')
const du = require('du')
const find = require('find');

const FileHandler = class {
  createDirIfNotExists(folderPath) {
    try {
      if (!fs.lstatSync(folderPath).isDirectory()) {
        fs.mkdirSync(folderPath)
      }
    } catch (e) {
      // todo 新的一天开启，创建文件夹时报错
      fs.mkdirSync(folderPath)
    }
  }

  removeDirectory(folderPath, callback) {
    rimraf(folderPath, callback)
  }

  getDirectorySize(folderPath, callback) {
    du(folderPath, (err, size) => {
      callback(err, size)
    })
  }

  findOldestMp4(folderPath, callback) {
    find.file(/\.mp4/, folderPath, function(files) {
      // console.log(files);
      let allFileArr = [];
      let cursorFile = false;
      let cursorBirthtime = Date.now();

      files.forEach((file,v) => {
        if(fs.statSync(file).birthtimeMs < cursorBirthtime) {
          cursorFile = file;
          cursorBirthtime = fs.statSync(file).birthtimeMs;
        }
      });
      callback(cursorFile);
    })
  }

  deleteOldestMp4(folderPath, callback) {
    this.findOldestMp4(folderPath, function(file){
      file ? (function(){
        fs.unlink(file, callback);
      })() : callback(new Error("文件为空"));
    });
  }


}

module.exports = FileHandler

// vim:ts=2:sw=2:sts=2
