'use strict';
var rFS = require('fs');
var rPath = require('path');

/**
 * initialize custom directories for configs and handlers:
 * execute from the main project cwd:
 * node node_modules/visual-express/vxpress-init.js
 */

let logWarning = '> delete the following file/directory and run the script again:';

// configs:
let pathConfigs = 'configs';
rFS.mkdir(rPath.join(process.cwd(), pathConfigs), '755', error => {
  if (error) {
    console.log(logWarning);
    console.log('mkdir', error.code, error.path);
  } else {
    // default config files for single/cluster/lambda:
    let files = ['vxpress.json', 'vxpress-lambda.json'];
    files.map(item => {
      rFS.copyFile(
        rPath.join(__dirname, pathConfigs, item),
        rPath.join(process.cwd(), pathConfigs, item),
        error => {
          if (error) {
            console.log(logWarning);
            console.log('copyFile', item, error.code, error.path);
          }
        }
      );
    });
  }
});

// dynamic:
let pathDynamic = 'dynamic';
rFS.mkdir(rPath.join(process.cwd(), pathDynamic), '755', error => {
  if (error) {
    console.log(logWarning);
    console.log('mkdir', error.code, error.path);
  } else {
    // dynamic scripts:
    let files = [
      'job-handlers-create.js',
      'job-handlers-minify.js',
      'job-handlers-publish.sh',
      'job-handlers-reload.sh',
      'job-handlers-s3copy.js',
      'package.json',
      'README.md',
      'reload.flag'
    ];
    files.map(item => {
      rFS.copyFile(
        rPath.join(__dirname, pathDynamic, item),
        rPath.join(process.cwd(), pathDynamic, item),
        error => {
          if (error) {
            console.log(logWarning);
            console.log('copyFile', item, error.code, error.path);
          }
        }
      );
    });
  }
});

// handlers:
let pathHandlers = 'handlers';
rFS.mkdir(rPath.join(process.cwd(), pathHandlers), '755', error => {
  if (error) {
    console.log(logWarning);
    console.log('mkdir', error.code, error.path);
  } else {
    // custom handlers:
    let files = [
      'helloworld.js'
    ];
    files.map(item => {
      rFS.copyFile(
        rPath.join(__dirname, pathDynamic, item),
        rPath.join(process.cwd(), pathHandlers, item),
        error => {
          if (error) {
            console.log(logWarning);
            console.log('copyFile', item, error.code, error.path);
          }
        }
      );
    });
  }
});
