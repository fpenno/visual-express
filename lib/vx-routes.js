module.exports = class vxRoutes {
  /**
   * create all application routes:
   * @param {*} log
   * @param {*} configs
   * @param {*} handlers
   */
  constructor(log, configs, handlers) {
    this.log = log;
    this.configs = configs;
    this.handlers = handlers;
  }

  /**
   * create all routes in expressApp:
   * @param {*} expressApp
   */
  async create(expressApp) {
    this.log.verbose(__filename, 'create');

    // get handlers first to then process them:
    let handlersAll = {};
      handlersAll = await this.handlers.load().catch(error => {
        this.log.error(__filename, 'create:handlers.load', error);
        // throw error;
      });

    // start creating:
    return new Promise((resolve, reject) => {
      try {
        //
        if (this.configs.routes) {
          if (Array.isArray(this.configs.routes)) {
            this.configs.routes.map(rItem => {
              // clear path when not required (empty):
              // jshint expr:true
              !rItem.path ? (rItem.path = null) : true;
              // set full path including an optional prefix if it's not catch all:
              let fullPath = rItem.path && rItem.path !== '*' ? `${this.configs.paths.prefix}${rItem.path}` : rItem.path;
              // set complete path to display on logs:
              let logPath = fullPath ? `${fullPath}, ` : '';
              let logFull = `router #${rItem.execOrder}: .${rItem.method}(${logPath}${rItem.handler})`;
              // load only active routes:
              if (rItem.active) {
                // set route: e.g.: expressRouter.get('/', handlers.functionName)
                if (rItem.path) {
                  if (handlersAll[rItem.handler]) {
                    expressApp[rItem.method](fullPath, handlersAll[rItem.handler]);
                  } else {
                    this.log.warn(__filename, 'invalid handler', rItem.handler);
                  }
                } else {
                  // when path is not specified, only handler is given:
                  if (handlersAll[rItem.handler]) {
                    expressApp[rItem.method](handlersAll[rItem.handler]);
                  } else {
                    this.log.warn(__filename, 'invalid handler', rItem.handler);
                  }
                }
                // logs the order they were created:
                this.log.info(__filename, logFull);
              } else {
                // logs the order they were created:
                this.log.warn(__filename, logFull);
              }
            });
          }
        }
        //
        resolve({});
      } catch (error) {
        this.log.error(__filename, 'create', error);
        reject(error);
      }
    });
  }
};
