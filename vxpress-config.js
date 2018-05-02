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

// set from where the app configuration will be read, local or remote:
exports.setAppConfig = appConfig => {
  // jshint expr:true
  !process.env.vxInfoConfig ? (process.env.vxInfoConfig = appConfig) : false;
};

/**
 * start server in single or cluster mode.
 * as lambda its function needs to map vxpress.start.
 */
exports.start = async (lambdaEvent = null, lambdaContext = null) => {
  // initialize logs:
  let oLog = new rLogger('silly', 'vx');
  oLog.verbose(__filename, 'log level', oLog.level);
  oLog.verbose(__filename, 'start');

  // process requests:
  try {
    // merge environment variables and config file:
    let oEnv = new rEnvironment(oLog, lambdaEvent);
    let configs = await oEnv.merge().catch(error => {
      oLog.error(__filename, 'start:merge', error);
      throw error;
    });

    // print server version:
    oLog.info(__filename, 'version', configs.info.version);
    // reset log level:
    oLog.level = configs.info.logs;

    // compile definitions:
    let oDefs = new rDefinitions(oLog, configs);
    let definitions = oDefs.compile();

    // initialize server:
    let oServer = new rServer(oLog, configs, definitions, lambdaEvent, lambdaContext);
    oServer.init();

    // server is fully functional:
    oLog.debug(__filename, 'server is running...');

    // endlessly unresolved promise to stay in the loop:
    // lambda functions won't work properly without this:
    let complete = false;
    await new Promise(resolve => {
      if (complete) {
        resolve({});
      }
    });
  } catch (error) {
    oLog.error(__filename, 'start', error);
  }
};
