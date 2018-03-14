var rBodyParserEncode = require("body-parser");

/**
 * encode parsed body
 */
exports.vxBodyParserEncode = rBodyParserEncode.urlencoded({ extended: true });
