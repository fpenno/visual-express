var rPath = require('path');
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();
//
var rLogger = require('visual-express/lib/vx-logger');
var rConfigs = require('visual-express/lib/vx-configs');
//
var rReload = require('./job-handlers-reload');

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
//
process.env.vxPathsAppRoot = basePath;
let log = new rLogger('error', 'vx');
let configs = new rConfigs(log, appName).load();

// load handler:
var rDynHandlers = require(rPath.join(basePath, dynamic, configs.aws.s3.s3key));
// set aws region:
rAWS.config.update({ region: configs.aws.s3.region });

/**
 * create/update s3 object:
 * @param {*} handlers
 */
function s3copy(handlers, reloadTag) {
  // set parameters:
  let s3Bucket = configs.aws.s3.s3bucket;

  // copy dynamic handlers:
  let s3FileKey = configs.aws.s3.s3key;
  let params = { Bucket: s3Bucket, Key: s3FileKey, Body: handlers };
  rS3.putObject(params, (err, data) => {
    if (err) {
      console.error('s3copy', s3FileKey, err);
    } else {
      console.log('s3copy', s3FileKey, 'ETag', data.ETag);
      //
      // copy reload flag:
      s3FileKey = reloadFlag;
      params = { Bucket: s3Bucket, Key: s3FileKey, Body: reloadTag };
      rS3.putObject(params, (err, data) => {
        if (err) {
          console.error('s3copy', s3FileKey, err);
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
s3copy(JSON.stringify(rDynHandlers), rReload.reloadTag());
