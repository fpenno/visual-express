var rPath = require('path');
// @ts-ignore
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();
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

/**
 * initialize configurations:
 * @param {*} oLog
 * @param {*} appName
 */
async function init(oLog, appName) {
  try {
    // @ts-ignore
    let oConfigs = new rConfigs(oLog, appName);
    configs = await oConfigs.load().catch(error => {
      oLog.error(__filename, 'init', error);
      throw error;
    });
    // load handler:
    rDynHandlers = require(rPath.join(basePath, dynamic, configs.aws.s3.s3key));
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
function s3copy(handlers, reloadTag) {
  // new line to display better on console:
  console.log('');

  // set aws region:
  rAWS.config.update({ region: configs.aws.s3.region });
  // copy dynamic handlers:
  // set parameters:
  let s3Bucket = configs.aws.s3.s3bucket;
  let s3FileKey = configs.aws.s3.s3key;
  let params = { Bucket: s3Bucket, Key: s3FileKey, Body: handlers };
  rS3.putObject(params, (error, data) => {
    if (error) {
      console.error('s3copy', s3FileKey, error);
    } else {
      console.log('s3copy', s3FileKey, 'ETag', data.ETag);
      //
      // copy reload flag:
      s3FileKey = reloadFlag;
      params = { Bucket: s3Bucket, Key: s3FileKey, Body: reloadTag };
      rS3.putObject(params, (error, data) => {
        if (error) {
          console.error('s3copy', s3FileKey, error);
        } else {
          console.log('s3copy', s3FileKey, 'ETag', data.ETag);
        }
      });
    }
  });
}

/**
 * run:
 */
init(oLog, appName).then(result => {
  s3copy(JSON.stringify(rDynHandlers), rReload.reloadTag());
});
