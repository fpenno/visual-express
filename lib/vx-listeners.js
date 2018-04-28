var rHttp = require('http');
var rHttpSecure = require('https');

module.exports = class vxListeners {
  /**
   * set listeners according to configuration
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
  }

  /**
   * load/unload listeners:
   * @param {*} expressApp
   */
  start(expressApp) {
    this.log.verbose(__filename, 'start');

    try {
      // array with all listeners:
      var listeners = this.configs.listeners;
      var serverListeners = [];

      // instantiate listeners:
      if (listeners) {
        if (Array.isArray(listeners)) {
          listeners.map((config, index) => {
            // execute only active items:
            if (config.active) {
              // create new listener according to protocol:
              switch (config.protocol) {
                case 'http': {
                  serverListeners.push(rHttp.createServer(expressApp));
                  break;
                }
                case 'https': {
                  // TODO
                  let httpsOptions = null;
                  serverListeners.push(rHttpSecure.createServer(httpsOptions, expressApp));
                  break;
                }
              }
              // start listening:
              serverListeners[index].listen(config.port, () => {
                this.log.info(
                  __filename,
                  `listener #${index}: port ${config.port} (${config.protocol}) [${config.description}]`
                );
              });
            }
          });
        }
      }
    } catch (error) {
      this.log.error(__filename, 'start', error);
    }
  }
};
