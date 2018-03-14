/**
 * vx-environment must be imported first.
 * it overrides configurations based on environment variables.
 */
var rEnv = require('./vx-environment');

/**
 * get configurations for the specified app
 * @param {*} lambdaEvent
 */
exports.get = function get(lambdaEvent = null) {
  // get the application name to render configurations:
  let appName = rEnv.getAppName(lambdaEvent);

  // load module:
  let rConfigs = require(`../configs/${appName}.json`);

  // flatten configuration structure:
  let flatConfigs = {
    info: rConfigs.info[0],
    paths: rConfigs.paths[0],
    listeners: rConfigs.listeners,
    routes: rConfigs.routes
  };

  // override configurations:
  rEnv.override(flatConfigs, lambdaEvent);

  return flatConfigs;
};
