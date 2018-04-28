var rFS = require('fs');
var rPath = require('path');
// @ts-ignore
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();

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
   * read handlers from database, AWS S3, and filesystem:
   */
  async load() {
    this.log.verbose(__filename, 'load');

    // get list of handlers from files in core and custom directories:
    let filesCore = [];
    let filesCustom = [];
    let filesS3 = {};

    try {
      filesCore = await this.dirList(rPath.join(this.configs.paths.cwd, this.configs.paths.handlers));
    } catch (error) {
      this.log.error(__filename, 'load:filesCore', error);
    }
    try {
      filesCustom = await this.dirList(rPath.join(this.configs.paths.appRoot, this.configs.paths.handlersCustom));
    } catch (error) {
      this.log.error(__filename, 'load:filesCustom', error);
    }
    try {
      filesS3 = await this.readS3();
    } catch (error) {
      this.log.error(__filename, 'load:filesS3', error);
    }

    return new Promise((resolve, reject) => {
      try {
        // initialize object:
        let handlersAll = {};

        // read core handlers inside module path:
        this.processFile(handlersAll, filesCore, `${this.configs.paths.cwd}${this.configs.paths.handlers}`);

        // only if s3 is disabled to avoid conflicts.
        if (!this.configs.aws.s3.active) {
          // read custom handlers from main application path:
          this.processFile(handlersAll, filesCustom, `${this.configs.paths.appRoot}${this.configs.paths.handlersCustom}`);
        } else {
          // read dynamic handlers from aws s3 bucket:
          if (typeof filesS3 === 'object') {
            Object.keys(filesS3).map(fun => {
              // compile functions:
              this.log.info(__filename, 'load:filesS3', 'compile', fun);
              // @ts-ignore
              module._compile(results[fun], __filename);
              // merge object keys:
              handlersAll[fun] = module.exports[fun];
            });
          }
        }
        //
        resolve(handlersAll);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * get list of files in a given directory:
   * @param {*} dirPath
   */
  dirList(dirPath) {
    this.log.verbose(__filename, 'dirList');

    return new Promise((resolve, reject) => {
      try {
        rFS.readdir(dirPath, (err, files) => {
          if (err) {
            this.log.error(__filename, 'dirList', dirPath, err);
            reject(err);
          } else {
            this.log.info(__filename, 'dirList', dirPath, files.length);
            resolve(files);
          }
        });
      } catch (error) {
        this.log.error(__filename, 'dirList', dirPath, error);
      }
    });
  }

  /**
   * read S3 bucket if required by configuration:
   */
  readS3() {
    this.log.verbose(__filename, 'readS3');

    return new Promise((resolve, reject) => {
      try {
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
              this.log.error(__filename, 'readS3:getObject', err);
              reject(err);
            } else {
              // convert body to text:
              let body = data.Body.toString();
              resolve(body);
            }
          });
        } else {
          // empty object if not active:
          resolve({});
        }
      } catch (error) {
        this.log.error(__filename, 'readS3', error);
        reject(error);
      }
    });
  }

  /**
   * read handlers from file and compile them:
   * @param {*} handlers
   * @param {*} dirList
   * @param {*} basePath
   */
  processFile(handlers, dirList, basePath) {
    this.log.verbose(__filename, 'processFile');

    try {
      if (Array.isArray(dirList)) {
        dirList.map(file => {
          if (rPath.extname(file) === '.js') {
            // clear extension:
            let handlerName = file.replace('.js', '');
            // assign required:
            this.log.info(__filename, 'require', basePath, file);
            let handlerCurrent = require(rPath.join(basePath, handlerName));
            // merge object keys:
            Object.assign(handlers, handlerCurrent);
          }
        });
      }
    } catch (error) {
      this.log.error(__filename, 'processFile', basePath, error);
    }
  }
};
