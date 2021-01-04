const {resolve} = require('path');
const FileHandler = require('../lib/index').FileHandler;

const fh = new FileHandler()

// RETURNS DIRECTORY SIZE
fh.getDirectorySize(resolve(__dirname + '/videos/'), (err, value) => {
    if (err) {
        console.log('Error Occured')
        console.log(err)
        return true
    }
    console.log('Folder Size is ' + value)
})
// REMOVES ALL MEDIA FILES
fh.removeDirectory(resolve(__dirname + '/videos/*'), () => {
    console.log('Done')
})
