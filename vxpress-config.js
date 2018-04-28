/**
 * @module visual-express
 * @author Felipe Penno <https://www.piscestek.com.au>
 * @license
 * MIT License
 *
 * Copyright (c) 2018 Felipe Penno
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';
var rLogger = require('./lib/vx-logger');
var rEnvironment = require('./lib/vx-environment');
var rDefinitions = require('./lib/vx-definitions');
var rServer = require('./lib/vx-server');

// set root application path (default):
process.env.vxPathsAppRoot = __dirname;
// reset root application path (optional):
exports.setAppRoot = path => {
  process.env.vxPathsAppRoot = path;
};

// set application name (optional) if not yet set:
// must be the same name of the configuration file (case-sensitive):
exports.setAppName = appName => {
  // jshint expr:true
  !process.env.vxInfoApp ? (process.env.vxInfoApp = appName) : false;
};

/**
 * start server in single or cluster mode.
 * as lambda its function needs to map vxpress.start.
 */
exports.start = async (lambdaEvent = null, lambdaContext = null) => {
  // initialize logs:
  let log = new rLogger('silly', 'vx');
  log.verbose(__filename, 'log level', log.level);
  log.verbose(__filename, 'start');

  // process requests:
  try {
    // merge environment variables and config file:
    let oEnv = new rEnvironment(log, lambdaEvent);
    let configs = await oEnv.merge();

    // print server version:
    log.info(__filename, 'version', configs.info.version);
    // reset log level:
    log.level = configs.info.logs;

    // compile definitions:
    let oDefs = new rDefinitions(log, configs);
    let definitions = oDefs.compile();

    // initialize server:
    let oServer = new rServer(log, configs, definitions, lambdaEvent, lambdaContext);
    await oServer.init();

    // wait for completion:
    let complete = false;
    await new Promise((resolve) => {
      if (complete) {
        resolve({});
      }
    });

    //
    log.debug(__filename, 'server is running...');
  } catch (error) {
    log.error(__filename, 'start', error);
  }
};
