'use strict';

/**
 * start server in single or cluster mode.
 * you can manually change this in ./configs/vxpress.json.
 * and then you can use the UI to change every other configuration.
 * when running in lambda its function needs to map vxpress.start.
 */
require('./vxpress').start();
