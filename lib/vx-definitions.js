var rListeners = require('./vx-listeners');
var rRoutes = require('./vx-routes');
var rHandlers = require('./vx-handlers');

/**
 * compile application objects
 * @param {*} log
 */
exports.compile = function compile(log, configs) {
  log.verbose(__filename, 'exports.compile');
  
  // compile application objects:
  var rVx = {};
  rVx.listeners = rListeners;
  rVx.routes = rRoutes;
  rVx.handlers = rHandlers.handlers(configs);

  return rVx;
};
