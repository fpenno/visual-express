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
var rServer = require('./lib/vx-server');
//
var rLogger = require('./lib/vx-logger');
var log = new rLogger('silly', 'vx');
//
var rEnvironment = require('./lib/vx-env');
var rDefinitions = require('./lib/vx-definitions');
//

/**
 * start server in single or cluster mode.
 * as lambda its function needs to map vxpress.start.
 */
exports.start = (lambdaEvent = null, lambdaContext = null) => {
  log.verbose(__filename, 'exports.start');

  // set environment:
  let env = new rEnvironment(log, lambdaEvent);
  let envConfigs = env.set();

  // compile definitions:
  let envDefinitions = rDefinitions.compile(log, envConfigs);

  // initialize server:
  let srv = new rServer(log, {
    configs: envConfigs,
    definitions: envDefinitions,
    lambdaEvent: lambdaEvent,
    lambdaContext: lambdaContext
  });
  srv.init();

  //
  log.debug(__filename, 'running...');
};
