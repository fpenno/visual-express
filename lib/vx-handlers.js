var rFS = require('fs');
var rPath = require('path');
// @ts-ignore
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();
// https://aws.amazon.com/blogs/developer/support-for-promises-in-the-sdk/
rAWS.config.setPromisesDependency(null);

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
      filesCore = await this.dirList(rPath.join(this.configs.paths.cwd, this.configs.paths.handlers)).catch(error => {
        this.log.error(__filename, 'load:filesCore', error);
        throw error;
      });
      //
      filesCustom = await this.dirList(rPath.join(this.configs.paths.appRoot, this.configs.paths.handlersCustom)).catch(
        error => {
          this.log.error(__filename, 'load:filesCustom', error);
          throw error;
        }
      );
      //
      filesS3 = await this.readS3().catch(error => {
        this.log.error(__filename, 'load:filesS3', error);
        throw error;
      });
      // convert body to text and then parse to JSON:
      if (Object.keys(filesS3).length > 0) {
        let body = filesS3.Body.toString();
        filesS3 = JSON.parse(body);
      }
    } catch (error) {
      this.log.error(__filename, 'load', error);
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
              // full path for function file:
              let functionPath = rPath.join(this.configs.paths.appRoot, this.configs.paths.handlersCustom, fun + '.js');
              // @ts-ignore
              module._compile(filesS3[fun], functionPath);
              // merge object keys:
              handlersAll[fun] = module.exports[fun];
            });
          } else {
            this.log.warn(__filename, 'load:filesS3', 'invalid JSON');
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
        rFS.readdir(dirPath, (error, files) => {
          if (error) {
            this.log.error(__filename, 'dirList', dirPath, error);
            reject(error);
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

    try {
      if (this.configs.aws.s3.active) {
        // set aws region:
        rAWS.config.update({ region: this.configs.aws.s3.region });
        // bucket info:
        let s3Bucket = this.configs.aws.s3.s3bucket;
        let s3FileKey = this.configs.aws.s3.s3key;
        let s3Params = { Bucket: s3Bucket, Key: s3FileKey };

        // get object and parse the JSON:
        return rS3.getObject(s3Params).promise();
      } else {
        // empty object if not active:
        return {};
      }
    } catch (error) {
      this.log.error(__filename, 'readS3', error);
      return error;
    }
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
