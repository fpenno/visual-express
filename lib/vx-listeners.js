var rHttp = require("http");
var rHttpSecure = require("https");
var rLambda = require("aws-serverless-express");
var rConfigs = require("./vx-configs").get();

/**
 * set listeners according to configuration
 * @param {*} expressApp 
 */
exports.start = function start(expressApp) {
  // array with all listeners:
  var listeners = rConfigs.listeners;
  var serverListeners = [];

  // instantiate listeners:
  if (listeners) {
    if (Array.isArray(listeners)) {
      listeners.map((config, index) => {
        // execute only active items:
        if (config.active) {
          // create new listener according to protocol:
          switch (config.protocol) {
            case "http":
              serverListeners.push(rHttp.createServer(expressApp));
              break;
            case "https":
              // TODO
              let httpsOptions = null;
              serverListeners.push(
                rHttpSecure.createServer(httpsOptions, expressApp)
              );
              break;
          }
          // start listening:
          serverListeners[index].listen(config.port, () => {
            console.log(
              `listener #${index}: port ${config.port} (${config.protocol}) [${
                config.description
              }]`
            );
          });
        }
      });
    }
  }
};
