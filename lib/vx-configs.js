module.exports = class vxConfigs {
  /**
   * load configurations for the specified application:
   * @param {*} log
   * @param {*} appName
   */
  constructor(log, appName) {
    this.log = log;
    this.appName = appName;
  }

  /**
   * load configurations from file:
   */
  load() {
    this.log.verbose(__filename, 'load');
    return new Promise((resolve, reject) => {
      try {
        // set default path:
        let vxPathsAppRoot = process.cwd();
        // override if already set by another env var:
        process.env.vxPathsAppRoot ? (vxPathsAppRoot = process.env.vxPathsAppRoot) : false;
        // load configurations file:
        let rConfigs = require(`${vxPathsAppRoot}/configs/${this.appName}.json`);

        // flatten configuration structure (remove arrays):
        let flatConfigs = {
          info: rConfigs.info[0],
          paths: rConfigs.paths[0],
          aws: rConfigs.aws[0],
          listeners: rConfigs.listeners,
          routes: rConfigs.routes
        };

        // load package file:
        // @ts-ignore
        let rPackage = require('../package.json');
        // update application version:
        flatConfigs.info.version = rPackage.version;

        resolve(flatConfigs);
      } catch (error) {
        this.log.error(__filename, 'load', error);
        reject(error);
      }
    });
  }
};
