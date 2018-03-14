/**
 * converts body from base64 to text
 * @param {*} lambdaEvent
 */
exports.convert = function convert(lambdaEvent) {
  if (lambdaEvent) {
    // get request body contents:
    let rawBody = lambdaEvent.body;
    if (lambdaEvent.isBase64Encoded) {
      rawBody = Buffer.from(rawBody, 'base64').toString();
    }

    // parse body text to json:
    try {
      rawBody = JSON.parse(rawBody);
    } catch (err) {
      rawBody = {
        errorCode: err.code,
        errorMessage: err.message
      };
      console.error('vx-lambda-body:convert:', err.code, err.message);
    }

    // add body to event:
    lambdaEvent.rawBody = rawBody;
  } else {
    console.error('vx-lambda-body:convert:', 'lambdaEvent is empty');
  }
};
