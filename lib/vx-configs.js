// @ts-ignore
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();
// https://aws.amazon.com/blogs/developer/support-for-promises-in-the-sdk/
rAWS.config.setPromisesDependency(null);

module.exports = class vxConfigs {
  /**
   * load configurations for the specified application:
   * @param {*} log
   * @param {*} appName
   */
  constructor(log, appName) {
    this.log = log;
    this.appName = appName;
    this.fileConfig = `${appName}.json`;
    this.configsOriginal = {};
    this.configs = {};
  }

  /**
   * load configurations from file:
   */
  async load() {
    this.log.verbose(__filename, 'load');

    try {
      // set default path:
      let vxPathsAppRoot = process.cwd();
      // override if already set by another env var:
      process.env.vxPathsAppRoot ? (vxPathsAppRoot = process.env.vxPathsAppRoot) : false;

      // clear require cache to reload fresh changes:
      let pathConfig = `${vxPathsAppRoot}/configs/${this.fileConfig}`;
      delete require.cache[require.resolve(pathConfig)];
      // load configurations file:
      let rConfigs = require(pathConfig);
      // set original local configuration file with no changes:
      this.configsOriginal = rConfigs;

      // flatten configuration structure (remove arrays):
      this.configs = this.flatten(rConfigs);

      // reload configs if remote mode is flagged overriding current configs:
      this.configs = await this.reload().catch(error => {
        this.log.error(__filename, 'load:reload', error);
      });

      return this.configs;
    } catch (error) {
      this.log.error(__filename, 'load', error);
      return error;
    }
  }

  /**
   * reload configurations from a remote location (S3):
   */
  async reload() {
    this.log.verbose(__filename, 'reload');

    try {
      // set configuration location:
      !process.env.vxInfoConfig ? (process.env.vxInfoConfig = this.configs.info.config) : false;

      // check if configuration must be read from local filesystem or remote (S3):
      // it will be always read from local filesystem, however overridden afterwards:
      let configsOverride = null;
      if (process.env.vxInfoConfig !== 'local') {
        configsOverride = await this.readS3(this.fileConfig).catch(error => {
          // some error happened retrieving the file:
          this.log.error(__filename, 'readS3', error.statusCode, error.code);
        });
        if (configsOverride) {
          // convert body to text and then parse to JSON:
          if (Object.keys(configsOverride).length > 0) {
            let body = configsOverride.Body.toString();
            let newConfigs = JSON.parse(body);
            // flatten configuration structure (remove arrays):
            newConfigs = this.flatten(newConfigs);
            // override only listeners and routes:
            this.configs.listeners = newConfigs.listeners;
            this.configs.routes = newConfigs.routes;
          }
        }
      }

      return this.configs;
    } catch (error) {
      this.log.error(__filename, 'reload', error);
      return error;
    }
  }

  /**
   * flatten configuration structure (remove arrays):
   * @param {*} obj
   */
  flatten(obj) {
    let flat = {
      info: obj.info[0],
      paths: obj.paths[0],
      aws: obj.aws[0],
      listeners: obj.listeners,
      routes: obj.routes
    };
    // load package file:
    // @ts-ignore
    let pack = require('../package.json');
    // update application version:
    flat.info.version = pack.version;
    //
    return flat;
  }

  /**
   * return original configuration file from local fs with no changes:
   */
  get original() {
    return this.configsOriginal;
  }

  /**
   * override current configurations:
   */
  set current(override) {
    this.configs = override;
  }

  /**
   * read S3 to get reload file tag:
   * @param {*} fileKey
   */
  async readS3(fileKey) {
    this.log.verbose(__filename, 'readS3');

    let lResolve = null;
    let lReject = null;
    let lPromise = new Promise((resolve, reject) => {
      lResolve = resolve;
      lReject = reject;
    });

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
};
