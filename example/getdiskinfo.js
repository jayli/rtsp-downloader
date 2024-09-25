

const checkDiskSpace = require('check-disk-space').default;

// On Linux or macOS
// checkDiskSpace(__dirname).then((diskSpace) => {
//   console.log(diskSpace)
//   // {
//   //     diskPath: '/',
//   //     free: 12345678,
//   //     size: 98756432
//   // }
//   // Note: `free` and `size` are in bytes
// })


const hasEnoughDiskSpace = async (pathName) => {
  let freeSize = await checkDiskSpace(pathName);
  if(freeSize.free < 70000000) {
    return false;
  } else {
    return true;
  }
};


const checkDiskSpace = function(pathName, successCallback, failureCallback) {
  checkDiskSpace(pathName).then((diskSpace) => {
    if (diskSpace.free < 70000000) {
      successCallback();
    } else {
      failureCallback();
    }
  });
};
