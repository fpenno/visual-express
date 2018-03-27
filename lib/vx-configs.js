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

    // load configurations file:
    let rConfigs = require(`../configs/${this.appName}.json`);

    // flatten configuration structure (remove arrays):
    let flatConfigs = {
      info: rConfigs.info[0],
      paths: rConfigs.paths[0],
      listeners: rConfigs.listeners,
      routes: rConfigs.routes
    };

    return flatConfigs;
  }
}
