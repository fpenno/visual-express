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
    this.lambdaEvent = lambdaEvent;
    this.env = process.env;
    this.configs = {};
  }

  /**
   * find correct app name to load configurations from:
   */
  async setInfoApp() {
    try {
      // assign base env path according to environment:
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        if (!this.lambdaEvent) {
          this.log.error(__filename, 'lambdaEvent is null');
        } else {
          // running in aws lambda, merge env and stage variables:
          Object.assign(this.env, this.lambdaEvent.stageVariables);
        }
      }

      // application name (set default if not defined):
      // jshint expr:true
      !this.env.vxInfoApp ? (this.env.vxInfoApp = 'vxpress') : false;
      this.log.info(__filename, `appName:${this.env.vxInfoApp}`);

      // load configurations from file:
      let oConfigs = new rConfigs(this.log, this.env.vxInfoApp);
      this.configs = await oConfigs.load().catch(error => {
        this.log.error(__filename, 'setInfoApp:load', error);
        throw error;
      });
      this.configs.info.app = process.env.vxInfoApp = this.env.vxInfoApp;
    } catch (error) {
      this.log.error(__filename, 'setInfoApp', error);
      throw error;
    }
  }

  /**
   * merge configs and env variables:
   */
  async merge() {
    this.log.verbose(__filename, 'merge');
    //
    // set application name:
    await this.setInfoApp().catch(error => {
      this.log.error(__filename, 'merge:setInfoApp', error);
      // throw error;
    });
    //
    return new Promise((resolve, reject) => {
      try {
        // running mode: single, cluster, lambda:
        !this.env.vxInfoMode ? (this.env.vxInfoMode = this.configs.info.mode) : false;
        this.configs.info.mode = process.env.vxInfoMode = this.env.vxInfoMode;

        // required for correct paths of routes:
        !this.env.vxPathsPrefix ? (this.env.vxPathsPrefix = this.configs.paths.prefix) : false;
        this.configs.paths.prefix = process.env.vxPathsPrefix = this.env.vxPathsPrefix;

        // current root path to load custom objects:
        !this.env.vxPathsAppRoot ? (this.env.vxPathsAppRoot = this.configs.paths.appRoot) : false;
        this.configs.paths.appRoot = process.env.vxPathsAppRoot = this.env.vxPathsAppRoot;

        // set current working directory:
        this.env.vxPathsCwd = rPath.join(__dirname, '..');
        this.configs.paths.cwd = process.env.vxPathsCwd = this.env.vxPathsCwd;

        // return updated configurations:
        resolve(this.configs);
      } catch (error) {
        this.log.error(__filename, 'merge', error);
        reject(error);
      }
    });
  }
};
