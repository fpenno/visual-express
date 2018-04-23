var rFS = require('fs');
var rPath = require('path');
var rAWS = require('aws-sdk');
let rS3 = new rAWS.S3();

module.exports = class vxHandlers {
  /**
   * set application handlers
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
  }

  /**
   * load contents from filesystem or database:
   */
  load() {
    this.log.verbose(__filename, 'load');

    return new Promise((resolve, reject) => {
      // initialize list to process:
      let filesCore = [];
      let filesCustom = [];
      let filesS3 = {};

      // read handlers from database, AWS S3, and filesystem:
      //
      // get list of handlers from files in core and custom directories:
      filesCore = rFS.readdirSync(`${this.configs.paths.cwd}${this.configs.paths.handlers}`);
      // get custom handlers:
      if (this.configs.paths.appRoot && this.configs.paths.cwd !== this.configs.paths.appRoot) {
        // process.env.vxPathsAppRoot
        filesCustom = rFS.readdirSync(
          `${this.configs.paths.appRoot}${this.configs.paths.handlers}`
        );
      }
      //
      // get object from aws s3:
      this.readS3().then(
        results => {
          // initialize object:
          let handlersAll = {};

          // read core handlers inside module path:
          if (filesCore) {
            if (Array.isArray(filesCore)) {
              filesCore.map(file => {
                if (rPath.extname(file) === '.js') {
                  // clear extension:
                  let handlerName = file.replace('.js', '');
                  // assign required:
                  let handlerCurrent = require(`${this.configs.paths.cwd}${
                    this.configs.paths.handlers
                  }/${handlerName}`);
                  // merge object keys:
                  Object.assign(handlersAll, handlerCurrent);
                }
              });
            }
          }

          // read custom handlers from main application path:
          if (filesCustom) {
            if (Array.isArray(filesCustom)) {
              filesCustom.map(file => {
                if (rPath.extname(file) === '.js') {
                  // clear extension:
                  let handlerName = file.replace('.js', '');
                  // assign required:
                  let handlerCurrent = require(`${this.configs.paths.appRoot}${
                    this.configs.paths.handlers
                  }/${handlerName}`);
                  // merge object keys:
                  Object.assign(handlersAll, handlerCurrent);
                }
              });
            }
          }

          // process dynamic object from S3:
          if (this.configs.aws.s3.active) {
            if (typeof results === 'object') {
              Object.keys(results).map(fun => {
                // compile functions:
                module._compile(results[fun], __filename);
                // merge object keys:
                handlersAll[fun] = module.exports[fun];
              });
            }
          }

          // return collection of all handlers:
          resolve(handlersAll);
        },
        error => {
          // empty object and logs error:
          this.log.error(__filename, 'load', error);
          resolve({});
        }
      );
    });
  }

  /**
   * read S3 bucket if required by configuration:
   */
  readS3() {
    this.log.verbose(__filename, 'readS3');

    return new Promise((resolve, reject) => {
      if (this.configs.aws.s3.active) {
        // set aws region:
        rAWS.config.update({ region: this.configs.aws.s3.region });
        // bucket info:
        let s3Bucket = this.configs.aws.s3.s3bucket;
        let s3FileKey = this.configs.aws.s3.s3key;
        let s3Params = { Bucket: s3Bucket, Key: s3FileKey };

        // get object and parse the JSON:
        rS3.getObject(s3Params, (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            // convert body to text:
            let body = data.Body.toString();
            body = JSON.parse(body);
            resolve(body);
          }
        });
      } else {
        // empty object if not active:
        resolve({});
      }
    });
  }
};
