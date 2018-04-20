'use strict';
var rFS = require('fs');
var rPath = require('path');

/**
 * initialize custom directories for configs and handlers:
 */

// configs:
let configs = 'configs';
rFS.mkdir(rPath.join(process.cwd(), configs), '755', error => {
  if (error) {
    console.log('mkdir', configs, error);
  } else {
    // copy default config file to cwd (custom configs):
    rFS.copyFile(
      rPath.join(__dirname, configs, 'vxpress.json'),
      rPath.join(process.cwd(), configs, 'vxpress.json'),
      error => {
        if (error) {
          console.log('copyFile', configs, error);
        }
      }
    );
  }
});

// handlers:
let handlers = 'handlers';
rFS.mkdir(rPath.join(process.cwd(), handlers), '755', error => {
  if (error) {
    console.log('mkdir', handlers, error);
  } else {
    // copy example handler file to cwd (custom handlers):
    rFS.copyFile(
      rPath.join(__dirname, handlers, 'u-hello-world.js'),
      rPath.join(process.cwd(), handlers, 'u-hello-world.js'),
      error => {
        if (error) {
          console.log('copyFile', handlers, error);
        }
      }
    );
  }
});
