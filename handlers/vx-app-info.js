/**
 * get overall application information
 * @param {*} req
 * @param {*} res
 */
exports.vxAppInfo = function vxAppInfo(req, res) {
  req.vxLog.info(__filename, 'vxAppInfo');

  // initialize list to process:
  let list = [];

  // get list of handlers from configuration:
  req.vxConfigs.routes.map(item => {
    list.push(item.handler);
  });

  let handlers = {
    handlers: list
  };
  res.json(handlers);
};
