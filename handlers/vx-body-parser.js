var rBodyParser = require('body-parser');

/**
 * get message body from post/put requests
 */
exports.vxBodyParser = rBodyParser.json();
