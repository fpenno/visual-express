/**
 * return hello world back to the client:
 * @param {*} req 
 * @param {*} res 
 */
exports.helloworld = function helloworld(req, res) {
  res.send('Hello Dynamic World!');
};
