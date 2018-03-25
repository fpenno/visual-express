/**
 * create all application routes:
 * @param {*} log
 * @param {*} expressApp
 * @param {*} pathPrefix
 * @param {*} handlers
 * @param {*} routes
 */
class vxRoutes {
  constructor(log, expressApp, pathPrefix, handlers, routes) {
    this.log = log;
    this.expressApp = expressApp;
    this.pathPrefix = pathPrefix;
    this.handlers = handlers;
    this.routes = routes;
  }

  create() {
    if (this.routes) {
      if (Array.isArray(this.routes)) {
        this.routes.map(rItem => {
          // clear path when not required (empty):
          !rItem.path ? (rItem.path = null) : true;
          // set full path including an optional prefix if it's not catch all:
          let fullPath = rItem.path && rItem.path !== '*' ? `${this.pathPrefix}${rItem.path}` : rItem.path;
          // set complete path to display on console:
          let logPath = fullPath ? `${fullPath}, ` : '';
          let logFull = `router #${rItem.execOrder}: .${rItem.method}(${logPath}${rItem.handler})`;
          // load only active routes:
          if (rItem.active) {
            // set route: e.g.: expressRouter.get('/', handlers.functionName)
            if (rItem.path) {
              this.expressApp[rItem.method](fullPath, this.handlers[rItem.handler]);
            } else {
              // when path is not specified, only handler is given:
              this.expressApp[rItem.method](this.handlers[rItem.handler]);
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
