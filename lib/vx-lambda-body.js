module.exports = class vxLambdaBody {
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
      let rawParsed = {};
      try {
        rawParsed = JSON.parse(rawBody);
      } catch (error) {
        this.log.error(__filename, rawBody, rawParsed, error.code, error.message);
        // assign errors to rawBody:
        rawParsed = {
          errorCode: error.code,
          errorMessage: error.message
        };
      }

      // add body to event:
      lambdaEvent.rawBody = rawParsed;
    } else {
      this.log.error(__filename, 'lambdaEvent is empty');
    }
  }
};
