var rPath = require('path');
// @ts-ignore
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();
// https://aws.amazon.com/blogs/developer/support-for-promises-in-the-sdk/
rAWS.config.setPromisesDependency(null);
//
var rLogger = {};
var rConfigs = {};
try {
  // as a node_modules module:
  rLogger = require('visual-express/lib/vx-logger');
  rConfigs = require('visual-express/lib/vx-configs');
} catch (error) {
  // testing the actual module:
  console.log(error.code, 'using local mapping for actual module');
  rLogger = require('../lib/vx-logger');
  rConfigs = require('../lib/vx-configs');
}
//
var rReload = require('./job-handlers-reload');
// handlers:
var rDynHandlers = null;

// load VX configurations:
// get app name from arguments (override default):
let appName = 'vxpress';
if (process.argv.length === 3) {
  appName = process.argv[2];
}
// set parent base path in application env:
let dynamic = 'dynamic';
let reloadFlag = 'reload.flag';
let basePath = rPath.dirname(__dirname);
let configs = {};
process.env.vxPathsAppRoot = basePath;

// @ts-ignore
let oLog = new rLogger('error', 'vx');
let oConfigs = null;

/**
 * initialize configurations:
 * @param {*} oLog
 * @param {*} appName
 */
async function init(oLog, appName) {
  try {
    // @ts-ignore
    oConfigs = new rConfigs(oLog, appName);
    configs = await oConfigs.load().catch(error => {
      oLog.error(__filename, 'init', error);
      throw error;
    });
    // clear require cache to reload fresh changes:
    let pathDynHandlers = rPath.join(basePath, dynamic, configs.aws.s3.s3key);
    delete require.cache[require.resolve(pathDynHandlers)];
    // load handler:
    rDynHandlers = require(pathDynHandlers);
    //
    return new Promise(resolve => {
      resolve({});
    });
  } catch (error) {
    oLog.error(__filename, 'init', error);
  }
}

/**
 * create/update s3 object:
 * @param {*} handlers
 */
async function s3copy(handlers, reloadTag) {
  // new line to display better on console:
  console.log('');
  // override oLog in this context by console:
  let oLog = console;

  try {
    // set aws region:
    rAWS.config.update({ region: configs.aws.s3.region });
    let result = null;
    // copy dynamic handlers:
    result = await putS3(configs.aws.s3.s3key, handlers).catch(error => {
      throw error;
    });
    oLog.info(__filename, 's3copy', configs.aws.s3.s3key, 'ETag', result.$response.data.ETag);
    // copy reload flag:
    result = await putS3(reloadFlag, reloadTag).catch(error => {
      throw error;
    });
    oLog.info(__filename, 's3copy', reloadFlag, 'ETag', result.$response.data.ETag);
    // copy app configuration:
    let configFile = `${configs.info.app}.json`;
    result = await putS3(configFile, JSON.stringify(oConfigs.original)).catch(error => {
      throw error;
    });
    oLog.info(__filename, 's3copy', configFile, 'ETag', result.$response.data.ETag);
  } catch (error) {
    oLog.error(__filename, 's3copy:putS3', error.statusCode, error.code);
  }
}

/**
 * read S3 bucket if required by configuration:
 */
function putS3(fileKey, data) {
  oLog.verbose(__filename, 'putS3');

  try {
    if (configs.aws.s3.active) {
      // set aws region:
      rAWS.config.update({ region: configs.aws.s3.region });
      // bucket info:
      let s3Bucket = configs.aws.s3.s3bucket;
      let s3FileKey = fileKey;
      let s3Params = { Bucket: s3Bucket, Key: s3FileKey, Body: data };

      // get object and parse the JSON:
      return rS3.putObject(s3Params).promise();
    } else {
      // empty object if not active:
      return {};
    }
  } catch (error) {
    oLog.error(__filename, 'putS3', error);
    return error;
  }
}

/**
 * run:
 */
init(oLog, appName).then(result => {
  s3copy(JSON.stringify(rDynHandlers), rReload.reloadTag());
});
