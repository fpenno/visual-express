/**
 * compile application objects
 * @param {*} lambdaEvent
 */
exports.get = function get(lambdaEvent = null) {
  // vx-configs must be imported first
  var rConfigs = require('./vx-configs').get(lambdaEvent);
  var rApps = require('./vx-apps');
  var rListeners = require('./vx-listeners');
  var rRoutes = require('./vx-routes');
  var rHandlers = require('./vx-handlers').handlers(rConfigs.paths);

  // compile application objects:
  var rVx = {};
  rVx.configs = rConfigs;
  rVx.apps = rApps;
  rVx.listeners = rListeners;
  rVx.routes = rRoutes;
  rVx.handlers = rHandlers;

  return rVx;
};
