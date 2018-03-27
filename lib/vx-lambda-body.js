class vxLambdaBody {
  /**
   * converts body from base64 to text
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
  }

  /**
   * convert lambda body to text:
   * @param {*} lambdaEvent
   */
  convert(lambdaEvent) {
    this.log.verbose(__filename, 'convert');

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
        this.log.error(__filename, err.code, err.message);
      }

      // add body to event:
      lambdaEvent.rawBody = rawBody;
    } else {
      this.log.error(__filename, 'lambdaEvent is empty');
    }
  }
}

/**
 * ...:
 */
module.exports = vxLambdaBody;
