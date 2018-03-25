var rExpress = require('express');
var rExpressApp = rExpress();
var rCluster = require('./vx-cluster');

/**
 * initialize server according to environment:
 * @param {*} definitions
 */
class vxServer {
  constructor(log, shebang) {
    this.log = log;
    this.shebang = shebang;
    //
    this.rVx = {};
    // if mode is lambda, it has a different way of listening
    this.rAwsSrvrless = {};
    this.rAwsLambda = {};
    // selected mode
    this.cfgMode = this.shebang.configs.info.mode; //process.env.vxInfoMode;
  }

  /**
   * initialize:
   */
  init() {
    this.log.verbose(__filename, 'init');

    // when running in lambda mode, event is required to get stage variables:
    this.rVx = this.shebang.definitions;

    // print mode:
    this.log.info(__filename, 'selected mode', this.cfgMode);
    // initialize according to mode:
    switch (this.cfgMode) {
      case 'lambda':
        // import aws module:
        this.rAwsSrvrless = require('aws-serverless-express');
        // create serverless express for lambda:
        this.rAwsLambda = this.rAwsSrvrless.createServer(rExpressApp, null, this.apiGtwBinaryMimeTypes());
        // convert body:
        var rLambdaBody = require('./vx-lambda-body');
        rLambdaBody.convert(this.shebang.lambdaEvent);
        if (this.shebang.lambdaEvent && this.shebang.lambdaContext) {
          // initialize proxy in lambda function:
          this.rAwsSrvrless.proxy(this.rAwsLambda, this.shebang.lambdaEvent, this.shebang.lambdaContext);
        } else {
          this.log.error(__filename, 'vx-server:init', 'lambdaEvent/lambdaContext are empty');
        }
        // no listener, only routes:
        this.createRoutes(rExpressApp, this.rVx);
        break;
      case 'single':
        this.startListeners(rExpressApp, this.rVx);
        this.createRoutes(rExpressApp, this.rVx);
        break;
      case 'cluster':
        rCluster.init(rExpressApp, this.rVx, this.startListeners, this.createRoutes);
        break;
      default:
        this.log.error(__filename, 'unknown mode', this.cfgMode);
    }
  }

  /**
   * starts listening on specified ports
   * @param {*} expressApp
   * @param {*} vXpress
   */
  startListeners(expressApp, vXpress) {
    vXpress.listeners.start(this.log, this.shebang.configs, expressApp);
  }

  /**
   * creates all routes
   * @param {*} expressApp
   * @param {*} vXpress
   */
  createRoutes(expressApp, vXpress) {
    // path prefix needs to be an empty string instead of null:
    let pathPrefix = this.shebang.configs.paths.prefix;
    pathPrefix = pathPrefix ? pathPrefix : '';
    // ready to create:
    let routes = new this.rVx.routes(this.log, expressApp, pathPrefix, vXpress.handlers, this.shebang.configs.routes);
    routes.create();
  }

  /**
   * ERR_CONTENT_DECODING_FAILED in the browser is likely due to items missing in this list
   */
  apiGtwBinaryMimeTypes() {
    return [
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
  }
}

/**
 * ...:
 */
module.exports = vxServer;
