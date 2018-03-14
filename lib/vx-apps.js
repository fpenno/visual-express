var rFS = require('fs');
var rBeautyJSON = require('json-beautify');
var rBeautyJs = require('js-beautify');

/**
 * create new node applications
 * @param {*} appName
 * @param {*} paths
 */
exports.appCreate = function appCreate(appName, paths) {
  // file modes must be converted from base 10 to 8:
  let fsModeDir = parseInt(paths.fsModeDir, 8);
  let fsModeFile = parseInt(paths.fsModeFile, 8);

  // create directory for the new app:
  try {
    rFS.mkdirSync(`${paths.cwd}/configs`, fsModeDir);
  } catch (error) {
    switch (error.code) {
      case 'EEXIST':
        // directory already exists.
        break;
      default:
        // TODO: check for other exceptions:
        console.error(`[err] /lib/vx-apps.js:appNew:${error.code}`);
    }
  }

  // set sources and targets:
  let configSource = `${paths.cwd}/configs/vxpress.json`;
  let configTarget = `${paths.cwd}/configs/${appName}.json`;
  if (configSource !== configTarget) {
    // copy from default:
    rFS.copyFileSync(configSource, configTarget);
    // set file mode:
    rFS.chmodSync(configTarget, fsModeFile);
  }

  // all good:
  return {
    status: 'ok'
  };
};

/**
 * update configuration file
 * @param {*} appName
 * @param {*} paths
 * @param {*} data
 */
exports.appUpdate = function(appName, paths, data) {
  // set config file path:
  let configTarget = `${paths.cwd}/configs/${appName}.json`;
  // beautify file contents:
  let fileContents = rBeautyJSON(data, null, 2, 1);
  // update contents:
  rFS.writeFileSync(configTarget, fileContents);

  // all good:
  return {
    status: 'ok'
  };
};
