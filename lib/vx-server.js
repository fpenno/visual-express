var rExpress = require('express');
var rExpressApp = rExpress();
var rVx = {};

/**
 * if mode is lambda, it has a different way of listening
 */
var rAwsSrvrless = {};
var rAwsLambda = {};

/**
 * selected mode
 */
var cfgMode = null;

/**
 * initialize server:
 * default for event and context is null for single and cluster modes.
 * when mode is lambda, these values will be set by aws.
 * @param {*} lambdaEvent
 * @param {*} lambdaContext
 */
exports.init = function init(lambdaEvent = null, lambdaContext = null) {
  // when running in lambda mode, event is required to get stage variables:
  rVx = require('./vx-definitions').get(lambdaEvent);
  cfgMode = rVx.configs.info.mode;

  // print mode:
  console.info('[i] selected mode:', cfgMode);
  // initialize according to mode:
  switch (cfgMode) {
    case 'lambda':
      // import aws module:
      rAwsSrvrless = require('aws-serverless-express');
      // create serverless express for lambda:
      rAwsLambda = rAwsSrvrless.createServer(rExpressApp, null, apiGtwBinaryMimeTypes);
      // convert body:
      var rLambdaBody = require('./vx-lambda-body');
      rLambdaBody.convert(lambdaEvent);
      if (lambdaEvent && lambdaContext) {
        // initialize proxy in lambda function:
        rAwsSrvrless.proxy(rAwsLambda, lambdaEvent, lambdaContext);
      } else {
        console.error('vx-server:init:', 'lambdaEvent/lambdaContext are empty');
      }
      // no listener, only routes:
      createRoutes(rExpressApp, rVx);
      break;
    case 'single':
      startListeners(rExpressApp, rVx);
      createRoutes(rExpressApp, rVx);
      break;
    case 'cluster':
      var rCluster = require('./vx-cluster');
      rCluster.init(rExpressApp, rVx, startListeners, createRoutes);
      break;
    default:
      console.error('[err] unknown mode', cfgMode);
  }
};

/**
 * starts listening on specified ports
 * @param {*} expressApp
 * @param {*} vXpress
 */
function startListeners(expressApp, vXpress) {
  vXpress.listeners.start(expressApp);
}

/**
 * creates all routes
 * @param {*} expressApp
 * @param {*} vXpress
 */
function createRoutes(expressApp, vXpress) {
  // path prefix needs to be an empty string instead of null:
  let pathPrefix = vXpress.configs.paths.prefix;
  pathPrefix = pathPrefix ? pathPrefix : '';
  // ready to create:
  rVx.routes.create(expressApp, pathPrefix, vXpress.handlers, vXpress.configs.routes);
}

/**
 * ERR_CONTENT_DECODING_FAILED in the browser is likely due to items missing in this list
 */
const apiGtwBinaryMimeTypes = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/xml',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml'
];
exports.apiGtwBinaryMimeTypes = apiGtwBinaryMimeTypes;
