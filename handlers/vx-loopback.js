/**
 * good for testing.
 * returns what was requested plus additional server information
 * @param {*} req
 * @param {*} res
 */
exports.vxLoopback = function vxLoopback(req, res) {
  // returns to client the data that was received:
  let event = {};
  let results = {};

  // set body:
  let body = req.body;

  // checks if this is a lambda environment:
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // set event:
    event = req.apiGateway.event;

    // build results:
    results = {
      statusCode: 200,
      isBase64Encoded: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': ''
      },
      rawBody: body,
      path: event.path,
      paramsPath: event.pathParameters,
      paramsUrl: event.queryStringParameters,
      method: event.httpMethod,
      stage: event.requestContext.stage,
      stageVars: event.stageVariables,
      clientIp: event.requestContext.identity.sourceIp,
      accessKey: event.requestContext.identity.accessKey
    };
  } else {
    // running in single or cluster mode:
    // set event:
    event = req;

    // build results:
    results = {
      rawBody: body,
      path: event.path,
      method: event.method
    };
  }

  console.info('loopback logs:', results);
  res.json(results);
};
