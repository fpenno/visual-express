/**
 * returns code 404 to client if there was no path matching
 */
exports.vxNotFound = function vxNotFound(req, res) {
  // add header with wrong path to the response:
  let wrongPath = req.baseUrl;
  // taken from lambda event:
  req.apiGateway ? (wrongPath = req.apiGateway.event.path) : null;
  // set header and send:
  res.header('Vx-Wrong-Path', wrongPath);
  res.sendStatus(404);
};
