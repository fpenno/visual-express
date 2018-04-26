var rFS = require('fs');
var rPath = require('path');
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();

module.exports = class vxExtensions {
  /**
   * add handlers that require core application objects to be assigned to them:
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
    //
    this.reloadFlagTag = null;
    this.stackCutIndex = 0;
  }

  /**
   * execute all extensions.
   * add calls to extensions here:
   * @param {*} expressApp
   */
  add(expressApp, definitions) {
    this.log.verbose(__filename, 'add');
    //
    this.coreObjects(expressApp);
    this.reloadHandlers(expressApp, definitions);
    //
    // must be last one:
    this.setStackCutIndex(expressApp);
  }

  /**
   * set routes stack index to cut when reloading:
   */
  setStackCutIndex(expressApp) {
    this.stackCutIndex = expressApp._router.stack.length;
  }

  /**
   * assign log and configs to request object:
   * @param {*} expressApp
   */
  coreObjects(expressApp) {
    this.log.verbose(__filename, 'coreObjects');

    expressApp.use((req, res, next) => {
      req.vxLog = this.log;
      req.vxConfigs = this.configs;
      next();
    });
  }

  /**
   * reload handlers on-the-fly. zero downtime:
   * @param {*} expressApp
   */
  reloadHandlers(expressApp, definitions) {
    this.log.verbose(__filename, 'reloadHandlers');

    expressApp.use((req, res, next) => {
      // check reload routes flag:
      this.checkReloadFlag().then(
        results => {
          let xApp = expressApp;
          let cutIdx = this.stackCutIndex;
          // cut stack removing from x to end:
          xApp._router.stack.splice(cutIdx);
          // reload routes:
          definitions.routes.create(expressApp).then(
            result => {
              // everything was reloaded, keep going:
              this.log.info(__filename, 'reloadHandlers', 'reload successful');
              next();
            },
            error => {
              // no rejection implemented in routes.create.
              this.log.error(__filename, 'reloadHandlers', error);
              next();
            }
          );
        },
        error => {
          // no flag or not implemented:
          this.log.warn(__filename, 'checkReloadFlag', error.syscall, error.code);
          next();
        }
      );
    });
  }

  /**
   * check for reload flags in the filesystem (single/cluster) or s3 (lambda):
   */
  checkReloadFlag() {
    return new Promise((resolve, reject) => {
      // set parent path:
      let basePath = rPath.dirname(__dirname);
      let reloadFlag = 'reload.flag';

      // delete according to environment:
      switch (this.configs.info.mode) {
        case 'lambda':
          if (this.configs.aws.s3.active) {
            // set aws region:
            rAWS.config.update({ region: this.configs.aws.s3.region });
            // bucket info:
            let s3Bucket = this.configs.aws.s3.s3bucket;
            let s3FileKey = reloadFlag;
            let s3Params = { Bucket: s3Bucket, Key: s3FileKey };

            // get object and check its contents:
            rS3.getObject(s3Params, (err, data) => {
              if (err) {
                this.log.error(__filename, 'getObject', err);
                reject(err);
              } else {
                let tag = data.Body.toString();
                // tag is null:
                if (!this.reloadFlagTag) {
                  // server just started and there's no need to reload:
                  this.reloadFlagTag = tag;
                  reject({});
                } else {
                  // check if tag returned is different:
                  if (this.reloadFlagTag !== tag) {
                    // update tag and reload:
                    this.reloadFlagTag = tag;
                    resolve({});
                  } else {
                    // same tag, no need to reload:
                    reject({});
                  }
                }
              }
            });
          } else {
            // empty object if not active:
            reject({});
          }
          break;
        case 'single':
        case 'cluster':
          rFS.readFile(rPath.join(basePath, 'dynamic', reloadFlag), (err, data) => {
            if (err) {
              this.log.error(__filename, 'readFile', err);
              reject(err);
            } else {
              let tag = data.toString();
              // tag is null:
              if (!this.reloadFlagTag) {
                // server just started and there's no need to reload:
                this.reloadFlagTag = tag;
                reject({});
              } else {
                // check if tag returned is different:
                if (this.reloadFlagTag !== tag) {
                  // update tag and reload:
                  this.reloadFlagTag = tag;
                  resolve({});
                } else {
                  // same tag, no need to reload:
                  reject({});
                }
              }
            }
          });
          break;
        default:
          // unknown mode:
          reject({});
          break;
      }
    });
  }
};
