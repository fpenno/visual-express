var rPath = require('path');
var rAWS = require('aws-sdk');
var rS3 = new rAWS.S3();
//
var rLogger = require('visual-express/lib/vx-logger');
var rConfigs = require('visual-express/lib/vx-configs');
//
var rDynHandlers = require('./handlers.json');

// load VX configurations:
// get app name from arguments (override default):
let appName = 'vxpress';
if (process.argv.length === 3) {
  appName = process.argv[2];
}
// set parent base path in application env:
process.env.vxPathsAppRoot = rPath.dirname(__dirname);
let log = new rLogger('error', 'vx');
let configs = new rConfigs(log, appName).load();

// set aws region:
rAWS.config.update({ region: configs.aws.s3.region });

function s3copy(data) {
  // set parameters:
  let s3Bucket = configs.aws.s3.s3bucket;
  let s3FileKey = configs.aws.s3.s3key;
  let params = { Bucket: s3Bucket, Key: s3FileKey, Body: data };
  // copy:
  rS3.putObject(params, (err, data) => {
    if (err) {
      console.error('s3copy', err);
    } else {
      console.log('s3copy', 'ETag', data.ETag);
    }
  });
}

/**
 * run:
 */
s3copy(JSON.stringify(rDynHandlers));
