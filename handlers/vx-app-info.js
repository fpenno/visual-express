// var rConfigs = require('../lib/vx-configs').get();

/**
 * get overall application information
 * @param {*} req 
 * @param {*} res 
 */
exports.vxAppInfo = function vxAppInfo(req, res) {
  // initialize list to process:
  let list = [];

  // get list of handlers from configuration:
  // rConfigs.routes.map(item => {
  //   list.push(item.handler);
  // });

  let handlers = {
    handlers: list
  };
  res.json(handlers);
};
