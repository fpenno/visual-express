var rListeners = require('./vx-listeners');
var rRoutes = require('./vx-routes');
var rHandlers = require('./vx-handlers');

module.exports = class vxDefinitions {
  /**
   * compile application objects
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
  }

  /**
   * return one single object with all definitions:
   */
  compile() {
    this.log.verbose(__filename, 'compile');
    //
    var rVx = {};
    // must load in this order: listeners, handlers, routes:
    rVx.listeners = new rListeners(this.log, this.configs);
    rVx.handlers = new rHandlers(this.log, this.configs);
    rVx.routes = new rRoutes(this.log, this.configs, rVx.handlers);

    return rVx;
  }
}
