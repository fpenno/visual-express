module.exports = class vxConfigs {
  /**
   * load configurations for the specified application:
   * @param {*} log
   * @param {*} rootPath
   * @param {*} appName
   */
  constructor(log, rootPath, appName) {
    this.log = log;
    this.rootPath = rootPath;
    this.appName = appName;
  }

  /**
   * load configurations from file:
   */
  load() {
    this.log.verbose(__filename, 'load');

    // load configurations file:
    let rConfigs = require(`${this.rootPath}/configs/${this.appName}.json`);

    // flatten configuration structure (remove arrays):
    let flatConfigs = {
      info: rConfigs.info[0],
      paths: rConfigs.paths[0],
      listeners: rConfigs.listeners,
      routes: rConfigs.routes
    };

    // load package file:
    let rPackage = require(`../package.json`);
    // update application version:
    flatConfigs.info.version = rPackage.version;

    return flatConfigs;
  }
};
