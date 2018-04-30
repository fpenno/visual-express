'use strict';
var rVx = require('visual-express');

// required if using custom config files and handlers:
rVx.setAppRoot(__dirname);

// set an application name to get configs from:
// can also be set via environment variable (vxInfoApp):
rVx.setAppName('vxpress');

// ready to be started:
exports.start = rVx.start;
