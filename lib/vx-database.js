var rFS = require('fs');
// @ts-ignore
var rBeautyJSON = require('json-beautify');

module.exports = class vxDatabase {
  /**
   * update vxpress configuration files:
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
  }

  /**
   * create new node application file:
   * @param {*} appName
   */
  create(appName) {
    // file modes must be converted from base 10 to 8:
    let fsModeDir = parseInt(this.configs.paths.fsModeDir, 8);
    let fsModeFile = parseInt(this.configs.paths.fsModeFile, 8);

    // create directory for the new app:
    try {
      rFS.mkdirSync(`${this.configs.paths.cwd}/configs`, fsModeDir);
    } catch (error) {
      switch (error.code) {
        case 'EEXIST': {
          // directory already exists.
          break;
        }
        default: {
          // TODO: check for other exceptions:
          this.log.error(__filename, error.code, error.message);
        }
      }
    }

    // set sources and targets:
    let configSource = `${this.configs.paths.cwd}/configs/vxpress.json`;
    let configTarget = `${this.configs.paths.cwd}/configs/${appName}.json`;
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
  }

  /**
   * update configuration file
   * @param {*} appName
   * @param {*} data
   */
  update(appName, data) {
    // set config file path:
    let configFile = `${this.configs.paths.cwd}/configs/${appName}.json`;
    // beautify file contents:
    let fileContents = rBeautyJSON(data, null, 2, 1);
    // update contents:
    rFS.writeFileSync(configFile, fileContents);

    // all good:
    return {
      status: 'ok'
    };
  }

  /**
   * get application configurations and send to editor
   * @param {*} appName
   */
  getConfigs(appName) {
    // load as module:
    let configSource = {};
    // try to read configurations:
    try {
      configSource = require(`../configs/${appName}.json`);
    } catch (error) {
      this.log.error(__filename, 'getConfigs', error.code, error.message);
    }
    return configSource;
  }

  /**
   * set application configurations from the editor
   * @param {*} appName
   * @param {*} jsonData
   */
  setConfigs(appName, jsonData) {
    // set config file path:
    let configTarget = `${this.configs.paths.cwd}/configs/${appName}.json`;
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
  getConfigsEditor() {
    // load as module:
    // @ts-ignore
    let rConfigsEditor = require('../configs/vxpress-editor.json');
    return rConfigsEditor;
  }

  /**
   * updates parameters used to render the configuration UI
   * @param {*} jsonData
   */
  setConfigsEditor(jsonData) {
    // set config file path:
    let configTarget = `${this.configs.paths.cwd}/configs/vxpress-editor.json`;
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
};
