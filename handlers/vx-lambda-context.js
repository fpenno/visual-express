const rAwsSrvrlessMiddleware = require('aws-serverless-express/middleware');

/**
 * provided by aws, adds context to the request
 */
exports.vxLambdaContext = rAwsSrvrlessMiddleware.eventContext();
