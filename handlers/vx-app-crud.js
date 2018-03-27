var rVxDatabase = require('../lib/vx-database');

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

  // set database:
  let db = new rVxDatabase(req.vxLog, req.vxConfigs);
  // log action:
  req.vxLog.info(__filename, 'action', action);
  // set default error:
  let defaultError = `vxAppCrud: no matching action/target: ${action}/${target}`;

  // -------------------------
  if (action == 'create') {
    switch (target) {
      case 'application':
        // create new app:
        resJson = db.create(appName);
        break;
      default:
        req.vxLog.error(__filename, defaultError);
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
        req.vxLog.error(__filename, defaultError);
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
        req.vxLog.error(__filename, defaultError);
    }
  }

  // -------------------------
  if (action == 'delete') {
    switch (target) {
      case 'todo':
        break;
      default:
        req.vxLog.error(__filename, defaultError);
    }
  }

  //
  res.json(resJson);
};
