class vxRoutes {
  /**
   * create all application routes:
   * @param {*} log
   * @param {*} configs
   * @param {*} handlers
   */
  constructor(log, configs, handlers) {
    this.log = log;
    this.configs = configs;
    this.handlers = handlers.load();
  }

  /**
   * create all routes in expressApp:
   * @param {*} expressApp
   */
  create(expressApp) {
    if (this.configs.routes) {
      if (Array.isArray(this.configs.routes)) {
        this.configs.routes.map(rItem => {
          // clear path when not required (empty):
          !rItem.path ? (rItem.path = null) : true;
          // set full path including an optional prefix if it's not catch all:
          let fullPath =
            rItem.path && rItem.path !== '*'
              ? `${this.configs.paths.prefix}${rItem.path}`
              : rItem.path;
          // set complete path to display on logs:
          let logPath = fullPath ? `${fullPath}, ` : '';
          let logFull = `router #${rItem.execOrder}: .${rItem.method}(${logPath}${rItem.handler})`;
          // load only active routes:
          if (rItem.active) {
            // set route: e.g.: expressRouter.get('/', handlers.functionName)
            if (rItem.path) {
              expressApp[rItem.method](fullPath, this.handlers[rItem.handler]);
            } else {
              // when path is not specified, only handler is given:
              expressApp[rItem.method](this.handlers[rItem.handler]);
            }
            // logs the order they were created:
            this.log.info(__filename, logFull);
          } else {
            // logs the order they were created:
            this.log.warn(__filename, logFull);
            // unload routes in real time:
            // TODO...
          }
        });
      }
    }
  }
}

/**
 * ...:
 */
module.exports = vxRoutes;
