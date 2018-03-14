/**
 * enable CORS (cross-origin resource sharing)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.vxCors = function vxCors(req, res, next) {
  // https://enable-cors.org/server_expressjs.html
  let logInfo = `[i] vxCors: { 'method':'${req.method}', 'origin':'${req.headers['origin']}', 'host':'${
    req.headers['host']
  }', 'originalUrl':'${req.originalUrl}' }`;
  //console.info(logInfo);
  //
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.header('Allow', 'GET, POST, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
};
