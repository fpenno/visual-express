/**
 * load balancers in AWS require this call to know if the server is alive.
 * and with that decide which healthy servers can handle a request.
 * @param {*} req 
 * @param {*} res 
 */
exports.vxAwsHealth = function vxAwsHealth(req, res) {
  res.sendStatus(200);
};
