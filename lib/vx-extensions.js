var rFS = require('fs');
var rPath = require('path');
var rConfigs = require('./vx-configs');

// @ts-ignore
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();
// https://aws.amazon.com/blogs/developer/support-for-promises-in-the-sdk/
rAWS.config.setPromisesDependency(null);

// @ts-ignore
var rMoment = require('moment');
// customize Moment.js:
rMoment.locale('en-gb');
// update time format:
rMoment.updateLocale('en-gb', {
  longDateFormat: {
    // replace LT by a specific for reload flag:
    LT: 'YYYYMMDDHHmmss'
  }
});

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
    // how many seconds to wait until fetching reload.flag again.
    // 0 means all the time, for every request. default is 30 seconds.
    this.fetchFrequency = 30;
    this.fetchLastTime = new rMoment();
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
   * reload handlers on-the-fly, at runtime, with zero downtime:
   * @param {*} expressApp
   */
  reloadHandlers(expressApp, definitions) {
    this.log.verbose(__filename, 'reloadHandlers');

    expressApp.use(async (req, res, next) => {
      await this.resetHandlers(expressApp, definitions).catch(error => {
        this.log.error(__filename, 'resetHandlers', error);
        // throw error;
      });
      next();
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
      let validTag = await this.checkReloadFlag().catch(error => {
        this.log.error(__filename, 'checkReloadFlag', error);
        throw error;
      });
      this.log.verbose(__filename, 'resetHandlers', validTag);
      //
      if (validTag) {
        // reload configs:
        let oConfigs = new rConfigs(this.log, process.env.vxInfoApp);
        // reset current configs in object:
        oConfigs.current = this.configs;
        this.configs = await oConfigs.reload().catch(error => {
          this.log.error(__filename, 'resetHandlers:reload', error);
          throw error;
        });
        // get index position to cut:
        let cutIdx = this.stackCutIndex;
        // cut stack removing from x to end:
        expressApp._router.stack.splice(cutIdx);
        // reload routes:
        await definitions.routes.create(expressApp).catch(error => {
          this.log.error(__filename, 'resetHandlers:create', error);
          throw error;
        });
        //
        this.log.info(__filename, 'resetHandlers', 'routes RELOADED');
      }
    } catch (error) {
      this.log.error(__filename, 'resetHandlers', error);
      return error;
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

    let fetchFlag = false;
    // check if a new fetch is already allowed:
    let diffSeconds = rMoment().diff(this.fetchLastTime, 'seconds');
    this.log.info(__filename, 'seconds since last fetch', diffSeconds, this.fetchFrequency);
    if (diffSeconds > this.fetchFrequency) {
      // reset fetch last time and allow new fetch:
      this.fetchLastTime = new rMoment();
      fetchFlag = true;
    }

    // delete according to environment:
    try {
      if (fetchFlag) {
        switch (this.configs.info.mode) {
          case 'lambda': {
            goNoGo = await this.readS3(reloadFlag).catch(error => {
              throw error;
            });
            if (goNoGo) {
              if (Object.keys(goNoGo).length > 0) {
                let tag = goNoGo.Body.toString();
                this.log.info(__filename, 'readS3', 'tag', tag);
                goNoGo = this.checkTag(tag);
              }
            }
            break;
          }
          case 'single':
          case 'cluster': {
            goNoGo = await this.readFS(basePath, reloadFlag).catch(error => {
              throw error;
            });
            if (goNoGo) {
              let tag = goNoGo.toString();
              this.log.info(__filename, 'readFS', 'tag', tag);
              goNoGo = this.checkTag(tag);
            }
            break;
          }
          default: {
            // unknown mode:
            this.log.error(__filename, 'checkReloadFlag', 'unknown mode');
            break;
          }
        }
      }
    } catch (error) {
      this.log.error(__filename, 'checkReloadFlag', error);
      return error;
    }
    //
    return new Promise(resolve => {
      resolve(goNoGo);
    });
  }

  /**
   * check returned tag agains object tag and decide if relod is needed:
   * @param {*} tag
   */
  checkTag(tag) {
    let goNoGo = null;
    // first run:
    if (!this.reloadFlagTag) {
      // server just started and there's no need to reload:
      this.reloadFlagTag = tag;
    }
    // check if tag returned is different from object tag:
    if (this.reloadFlagTag !== tag) {
      // update tag and reload:
      this.reloadFlagTag = tag;
      goNoGo = tag;
    } else {
      // same tag, no need to reload:
    }
    //
    return goNoGo;
  }

  /**
   * read S3 to get reload file tag:
   * @param {*} fileKey
   */
  readS3(fileKey) {
    this.log.verbose(__filename, 'readS3');

    try {
      if (this.configs.aws.s3.active) {
        // set aws region:
        rAWS.config.update({ region: this.configs.aws.s3.region });
        // bucket info:
        let s3Bucket = this.configs.aws.s3.s3bucket;
        let s3FileKey = fileKey;
        let s3Params = { Bucket: s3Bucket, Key: s3FileKey };

        // get object and check its contents:
        return rS3.getObject(s3Params).promise();
      } else {
        // empty object if not active:
        return null;
      }
    } catch (error) {
      this.log.error(__filename, 'readS3', error);
      return error;
    }
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
        rFS.readFile(rPath.join(basePath, 'dynamic', reloadFlag), (error, data) => {
          if (error) {
            this.log.error(__filename, 'readFS', error);
            reject(error);
          } else {
            resolve(data);
          }
        });
      } catch (error) {
        this.log.error(__filename, 'readFile', error);
        reject(error);
      }
    });
  }
};
