var rFS = require('fs');
var rBeautyJSON = require('json-beautify');
var rVxApps = require('../lib/vx-apps');
var rConfigs = require('../lib/vx-configs').get();

/**
 * CRUD operations according to action and target.
 * Create, Read, Update and Delete.
 * @param {*} req 
 * @param {*} res 
 */
exports.vxAppCrud = function vxAppCrud(req, res) {
  // set body contents:
  let payload = req.body;
  let reqAction = payload.action;
  let reqTarget = payload.target;
  let reqAppName = payload.appName;
  let reqData = payload.data;
  let resJson = {};

  // set default error:
  let defaultError = `[err] vxAppCrud: no matching action/target: ${reqAction}/${reqTarget}`;

  // -------------------------
  if (reqAction == 'create') {
    switch (reqTarget) {
      case 'application':
        // create new app:
        resJson = rVxApps.appCreate('template', rConfigs.paths);
        break;
      default:
        console.error(defaultError);
    }
  }

  // -------------------------
  if (reqAction == 'read') {
    switch (reqTarget) {
      case 'configs':
        resJson = getConfigs(reqAppName);
        break;
      case 'configs-editor':
        resJson = getConfigsEditor();
        break;
      default:
        console.error(defaultError);
    }
  }

  // -------------------------
  if (reqAction == 'update') {
    switch (reqTarget) {
      case 'configs':
        resJson = setConfigs(reqAppName, reqData);
        break;
      case 'configs-editor':
        resJson = setConfigsEditor(reqData);
        break;
      case 'apps':
        // update app configs:
        resJson = rVxApps.appUpdate(reqAppName, rConfigs.paths, payload.data);
        break;
      default:
        console.error(defaultError);
    }
  }

  // -------------------------
  if (reqAction == 'delete') {
    switch (reqTarget) {
      case 'todo':
        break;
      default:
        console.error(defaultError);
    }
  }

  //
  res.json(resJson);
};

/**
 * get application configurations and send to editor
 * @param {*} appName 
 */
function getConfigs(appName) {
  // load as module:
  let configSource = {};
  // try to read configurations:
  try {
    configSource = require(`../configs/${appName}.json`);
  } catch (error) {
    console.error('getConfigs:', error.code, error.message);
  }
  return configSource;
}

/**
 * set application configurations from the editor
 * @param {*} appName 
 * @param {*} jsonData 
 */
function setConfigs(appName, jsonData) {
  // set config file path:
  let configTarget = `${rConfigs.paths.cwd}/configs/${appName}.json`;
  // beautify file contents:
  let fileContents = rBeautyJSON(jsonData, null, 2, 1);
  // update contents:
  rFS.writeFileSync(configTarget, fileContents);

  // // file modes must be converted from base 10 to 8:
  // let fsModeFile = parseInt(rConfigs.paths.fsModeFile, 8);
  // // set file mode:
  // rFS.chmodSync(configTarget, fsModeFile);

  // all good:
  return {
    status: 200
  };
}

/**
 * this json is rendered by surveyjs builder running in the UI
 */
function getConfigsEditor() {
  // load as module:
  let rConfigsEditor = require(`../configs/vxpress-editor.json`);
  return rConfigsEditor;
}

/**
 * updates parameters used to render the configuration UI
 * @param {*} jsonData 
 */
function setConfigsEditor(jsonData) {
  // set config file path:
  let configTarget = `${rConfigs.paths.cwd}/configs/vxpress-editor.json`;
  // beautify file contents:
  let fileContents = rBeautyJSON(jsonData, null, 2, 1);
  // update contents:
  rFS.writeFileSync(configTarget, fileContents);

  // // file modes must be converted from base 10 to 8:
  // let fsModeFile = parseInt(rConfigs.paths.fsModeFile, 8);
  // // set file mode:
  // rFS.chmodSync(configTarget, fsModeFile);

  // all good:
  return {
    status: 200
  };
}
