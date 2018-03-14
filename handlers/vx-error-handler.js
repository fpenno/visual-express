/**
 * handle error if JSON is invalid
 * @param {*} err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.vxErrorHandler = function vxErrorHandler(err, req, res, next) {
  // default code is bad request:
  res.status(400);

  // log what happened:
  console.info('vxErrorHandler:', err.code, err.message);

  // handles error according to requested url:
  switch (req.url) {
    case "/crud":
      console.log("errors: " + req.url);
      res.json({
        reason: "..."
      });
      break;
    default:
      res.json({
        reason: "Provided JSON is invalid."
      });
  }
};
