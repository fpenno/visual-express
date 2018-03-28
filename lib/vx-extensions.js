module.exports = class vxExtensions {
  /**
   * add handlers that require core application objects to be assigned to them:
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
  }

  /**
   * execute all extensions.
   * add calls to extensions here:
   * @param {*} expressApp
   */
  add(expressApp) {
    this.log.verbose(__filename, 'extend');
    //
    this.coreObjects(expressApp);
  }

  /**
   * assign log and configs to request object:
   * @param {*} expressApp
   */
  coreObjects(expressApp) {
    this.log.verbose(__filename, 'coreObjects');

    expressApp.use((req, res, next) => {
      req.vxLog = this.log;
      req.vxConfigs = this.configs;
      next();
    });
  }
};
