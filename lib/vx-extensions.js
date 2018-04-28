var rFS = require('fs');
var rPath = require('path');
// @ts-ignore
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
    // this.reloadHandlers(expressApp, definitions);
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
   * reload handlers on-the-fly, at runtime, with zero downtime:
   * @param {*} expressApp
   */
  reloadHandlers(expressApp, definitions) {
    this.log.verbose(__filename, 'reloadHandlers');

    expressApp.use((req, res, next) => {
      this.resetHandlers(expressApp, definitions).then(result => {
        next();
      });
    });
  }

  /**
   * if tag is valid, reset all handlers:
   * @param {*} expressApp
   * @param {*} definitions
   */
  async resetHandlers(expressApp, definitions) {
    try {
      // check reload routes flag:
      let validTag = await this.checkReloadFlag();
      this.log.verbose(__filename, 'resetHandlers', validTag);
      //
      if (validTag) {
        // get index position to cut:
        let cutIdx = this.stackCutIndex;
        // cut stack removing from x to end:
        expressApp._router.stack.splice(cutIdx);
        // reload routes:
        await definitions.routes.create(expressApp);
      }
    } catch (error) {
      if (error) {
        this.log.error(__filename, 'resetHandlers', error);
      } else {
        this.log.verbose(__filename, 'resetHandlers', error);
      }
    }
    // keep processing next():
    return new Promise(resolve => {
      resolve({});
    });
  }

  /**
   * check for reload flags in the filesystem (single/cluster) or s3 (lambda):
   */
  async checkReloadFlag() {
    this.log.verbose(__filename, 'checkReloadFlag');

    // set parent path:
    let basePath = rPath.dirname(__dirname);
    let reloadFlag = 'reload.flag';
    let goNoGo = null;

    // delete according to environment:
    try {
      switch (this.configs.info.mode) {
        case 'lambda': {
          goNoGo = await this.readS3(reloadFlag);
          break;
        }
        case 'single':
        case 'cluster': {
          goNoGo = await this.readFS(basePath, reloadFlag);
          break;
        }
        default: {
          // unknown mode:
          this.log.error(__filename, 'checkReloadFlag', 'unknown mode');
          break;
        }
      }
    } catch (error) {
      this.log.error(__filename, 'checkReloadFlag', error);
    }
    //
    return new Promise(resolve => {
      resolve(goNoGo);
    });
  }

  /**
   * read S3 to get reload file tag:
   * @param {*} reloadFlag
   */
  readS3(reloadFlag) {
    this.log.verbose(__filename, 'readS3');

    return new Promise((resolve, reject) => {
      try {
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
              this.log.error(__filename, 'readS3', err);
              reject(err);
            } else {
              let tag = data.Body.toString();
              this.log.info(__filename, 'readS3', 'tag', tag);
              // tag is null:
              if (!this.reloadFlagTag) {
                // server just started and there's no need to reload:
                this.reloadFlagTag = tag;
                resolve(null);
              } else {
                // check if tag returned is different:
                if (this.reloadFlagTag !== tag) {
                  // update tag and reload:
                  this.reloadFlagTag = tag;
                  resolve(tag);
                } else {
                  // same tag, no need to reload:
                  resolve(null);
                }
              }
            }
          });
        } else {
          // empty object if not active:
          resolve(null);
        }
      } catch (error) {
        this.log.error(__filename, 'readS3', error);
        reject(error);
      }
    });
  }

  /**
   * read filesystem to get dynamic handlers:
   * @param {*} basePath
   * @param {*} reloadFlag
   */
  readFS(basePath, reloadFlag) {
    this.log.verbose(__filename, 'readFS');

    return new Promise((resolve, reject) => {
      try {
        rFS.readFile(rPath.join(basePath, 'dynamic', reloadFlag), (err, data) => {
          if (err) {
            this.log.error(__filename, 'readFS', err);
            reject(err);
          } else {
            let tag = data.toString();
            // tag is null:
            if (!this.reloadFlagTag) {
              // server just started and there's no need to reload:
              this.reloadFlagTag = tag;
              resolve(null);
            } else {
              // check if tag returned is different:
              if (this.reloadFlagTag !== tag) {
                // update tag and reload:
                this.reloadFlagTag = tag;
                resolve(tag);
              } else {
                // same tag, no need to reload:
                resolve(null);
              }
            }
          }
        });
      } catch (error) {
        this.log.error(__filename, 'readFile', error);
        reject(error);
      }
    });
  }
};
