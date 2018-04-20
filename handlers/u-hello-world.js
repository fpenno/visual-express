/**
 * return hello world world back to the client:
 * @param {*} req 
 * @param {*} res 
 */
exports.hello = function hello(req, res) {
  res.send('Hello World!');
};
