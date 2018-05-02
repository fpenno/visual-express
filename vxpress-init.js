'use strict';
var rFS = require('fs');
var rPath = require('path');

/**
 * initialize custom directories for configs and handlers:
 * execute from the main project cwd:
 * node node_modules/visual-express/vxpress-init.js
 */

// file copy initialization tree:
let fileTree = {
  root: {
    from: '/',
    to: '/',
    files: ['sam-local.sh']
  },
  template: {
    from: '/template',
    to: '/',
    files: ['sam-local.yaml', 'server-config.js', 'server-start.js']
  },
  configs: {
    from: '/configs',
    to: '/configs',
    files: ['vxpress-editor.json', 'vxpress-lambda.json', 'vxpress.json']
  },
  custom: {
    from: '/custom',
    to: '/custom',
    files: ['helloworld.js', 'README.md']
  },
  dynamic: {
    from: '/dynamic',
    to: '/dynamic',
    files: [
      'job-handlers-create.js',
      'job-handlers-minify.js',
      'job-handlers-publish.sh',
      'job-handlers-reload.js',
      'job-handlers-s3copy.js',
      'package.src',
      'README.md',
      'reload.flag',
      'yarn-install.sh',
      'yarn.lock'
    ]
  },
  sam: {
    from: '/sam-local-events',
    to: '/sam-local-events',
    files: ['sam-health.json', 'sam-helloworld.json', 'sam-loopback.json']
  }
};

// default warning:
let logWarnDir = '> delete the following directory and run the script again:';
let logWarnFile = '> check if the following file exist:';
// test directory:
let testDir = '';

/**
 * initialize all:
 */
function initialize() {
  try {
    Object.keys(fileTree).map(listItem => {
      // set from:to dirs:
      let from = rPath.join(__dirname, fileTree[listItem].from);
      let to = rPath.join(process.cwd(), testDir, fileTree[listItem].to);

      // not required to mkdir root:
      if (fileTree[listItem].to !== '/') {
        mkdir(fileTree[listItem].to)
          .then(result => {
            // copy files:
            fileTree[listItem].files.map(fileName => {
              copyFile(rPath.join(from, fileName), rPath.join(to, fileName)).catch(error => {
                console.error(__filename, 'initialize:mkdir:copyFile', from, to, fileName);
                // throw error;
              });
            });
          })
          .catch(error => {
            console.error(__filename, 'initialize:mkdir', fileTree[listItem].to, listItem);
            // throw error;
          });
      } else {
        // copy files:
        fileTree[listItem].files.map(fileName => {
          copyFile(rPath.join(from, fileName), rPath.join(to, fileName)).catch(error => {
            console.error(__filename, 'initialize:copyFile', from, to, fileName);
            // throw error;
          });
        });
      }
    });
  } catch (error) {
    console.error(__filename, 'initialize', error.code, error.path);
  }
}

/**
 * create new directory:
 * @param {*} newDir
 */
function mkdir(newDir) {
  return new Promise((resolve, reject) => {
    let fullPath = rPath.join(process.cwd(), testDir, newDir);
    rFS.mkdir(fullPath, '755', error => {
      if (error) {
        console.warn(logWarnDir);
        console.error('mkdir', error.code, error.path);
        reject(error);
      } else {
        console.info('mkdir', fullPath);
        resolve();
      }
    });
  });
}

/**
 * copy a file from > to:
 * @param {*} from
 * @param {*} to
 */
function copyFile(from, to) {
  return new Promise((resolve, reject) => {
    rFS.copyFile(from, to, error => {
      if (error) {
        console.warn(logWarnFile);
        console.error('copyFile', error.code, error.path);
        reject(error);
      } else {
        console.info('copyFile', to);
        resolve();
      }
    });
  });
}

/**
 * start copying files:
 */
initialize();
