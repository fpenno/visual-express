var rFS = require('fs');
var rBeautyJSON = require('json-beautify');
var rVxDb = require('../lib/vx-database');
//
var log = {};
var configs = {};
var db = new rVxDb(log, configs);

/**
 * set configurations to be used in this module:
 * @param {*} objConfigs
 */
exports.setConfigs = function setConfigs(objConfigs) {
  configs = objConfigs;
};

/**
 * set log object for logging in this module:
 * @param {*} objLog
 */
exports.setLog = function setLog(objLog) {
  log = objLog;
};

/**
 * CRUD operations according to action and target.
 * Create, Read, Update and Delete.
 * @param {*} req
 * @param {*} res
 */
exports.vxAppCrud = function vxAppCrud(req, res) {
  // set body contents:
  let body = req.body;
  let action = body.action;
  let target = body.target;
  let appName = body.appName;
  let data = body.data;
  let resJson = {};

  // set default error:
  let defaultError = `vxAppCrud: no matching action/target: ${action}/${target}`;

  // -------------------------
  if (action == 'create') {
    switch (target) {
      case 'application':
        // create new app:
        resJson = db.create('template');
        break;
      default:
        log.error(__filename, defaultError);
    }
  }

  // -------------------------
  if (action == 'read') {
    switch (target) {
      case 'configs':
        resJson = db.getConfigs(appName);
        break;
      case 'configs-editor':
        resJson = db.getConfigsEditor();
        break;
      default:
        log.error(__filename, defaultError);
    }
  }

  // -------------------------
  if (action == 'update') {
    switch (target) {
      case 'configs':
        resJson = db.setConfigs(appName, data);
        break;
      case 'configs-editor':
        resJson = db.setConfigsEditor(data);
        break;
      case 'apps':
        // update app configs:
        resJson = db.update(appName, body.data);
        break;
      default:
        log.error(__filename, defaultError);
    }
  }

  // -------------------------
  if (action == 'delete') {
    switch (target) {
      case 'todo':
        break;
      default:
        log.error(__filename, defaultError);
    }
  }

  //
  res.json(resJson);
};
