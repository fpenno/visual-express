var rPath = require('path');
var rConfigs = require('./vx-configs');

module.exports = class vxEnvironment {
  /**
   * set configuration parameters from environment variables:
   * @param {*} log
   * @param {*} lambdaEvent
   */
  constructor(log, lambdaEvent = null) {
    this.log = log;

    // assign base env path according to environment:
    this.env = process.env;
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      if (!lambdaEvent) {
        this.log.error(__filename, 'lambdaEvent is null');
      } else {
        // running in aws lambda, merge env and stage variables:
        Object.assign(this.env, lambdaEvent.stageVariables);
      }
    }
  }

  /**
   * syncronize configs and env variables:
   */
  sync() {
    this.log.verbose(__filename, 'sync');

    // application name (set default if not defined):
    !this.env.vxInfoApp ? (this.env.vxInfoApp = 'vxpress') : false;
    this.log.info(__filename, `appName:${this.env.vxInfoApp}`);

    // load configurations from file:
    let objConfigs = new rConfigs(this.log, this.env.vxInfoApp);
    let configs = objConfigs.load();
    configs.info.app = process.env.vxInfoApp = this.env.vxInfoApp;

    // running mode: single, cluster, lambda:
    !this.env.vxInfoMode ? (this.env.vxInfoMode = configs.info.mode) : false;
    configs.info.mode = process.env.vxInfoMode = this.env.vxInfoMode;

    // required for correct paths of routes:
    !this.env.vxPathsPrefix ? (this.env.vxPathsPrefix = configs.paths.prefix) : false;
    configs.paths.prefix = process.env.vxPathsPrefix = this.env.vxPathsPrefix;

    // current root path to load custom objects:
    !this.env.vxPathsAppRoot ? (this.env.vxPathsAppRoot = configs.paths.appRoot) : false;
    configs.paths.appRoot = process.env.vxPathsAppRoot = this.env.vxPathsAppRoot;

    // set current working directory:
    this.env.vxPathsCwd = rPath.join(__dirname, '..');
    configs.paths.cwd = process.env.vxPathsCwd = this.env.vxPathsCwd;

    // return updated configurations:
    return configs;
  }
};
