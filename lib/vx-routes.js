/**
 * create all application routes
 * @param {*} expressApp
 * @param {*} handlers
 * @param {*} routes
 */
exports.create = function create(expressApp, pathPrefix, handlers, routes) {
  if (routes) {
    if (Array.isArray(routes)) {
      routes.map(rItem => {
        // clear path when not required (empty):
        !rItem.path ? (rItem.path = null) : true;
        // set full path including an optional prefix if it's not catch all:
        let fullPath = rItem.path && rItem.path !== '*' ? `${pathPrefix}${rItem.path}` : rItem.path;
        // set complete path to display on console:
        let logPath = fullPath ? `${fullPath}, ` : '';
        let logFull = `router #${rItem.execOrder}: .${rItem.method}(${logPath}${rItem.handler})`;
        // load only active routes:
        if (rItem.active) {
          // set route: e.g.: expressRouter.get('/', handlers.functionName)
          if (rItem.path) {
            expressApp[rItem.method](fullPath, handlers[rItem.handler]);
          } else {
            // when path is not specified, only handler is given:
            expressApp[rItem.method](handlers[rItem.handler]);
          }
          // logs the order they were created:
          console.info('[i]', logFull);
        } else {
          // logs the order they were created:
          console.error('[x]', logFull);
          // unload routes in real time:
          // TODO...
        }
      });
    }
  }
};
