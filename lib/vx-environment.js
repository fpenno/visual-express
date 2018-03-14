let rPath = require('path');

// console.log('concat:', rPath.resolve(__dirname, 'vxpress.json'));
// console.log('parent concat:', rPath.join(__dirname, '..', 'configs'));
// console.log('parent:', rPath.join(__dirname, '..'));
// console.log('dir:', rPath.basename(__dirname));
// console.log('file:', rPath.basename(__filename));

/**
 * override configuration parameters from environment variables
 * @param {*} configs 
 * @param {*} lambdaEvent 
 */
exports.override = function override(configs, lambdaEvent = null) {
  // check current running mode:
  if (lambdaEvent) {
    // running in lambda mode:
    !process.env.vxInfoMode ? (process.env.vxInfoMode = configs.info.mode) : false;

    // set stage variables:
    let stageVars = lambdaEvent.stageVariables;
    //console.info('stageVars', stageVars);

    // was already set in getAppName(), no need to check:
    configs.info.app = stageVars.vxInfoApp;

    // required for correct paths of routes:
    !stageVars.vxPathsPrefix ? (stageVars.vxPathsPrefix = configs.paths.prefix) : false;
    configs.paths.prefix = stageVars.vxPathsPrefix;

    // set current working directory. same as process.env.LAMBDA_TASK_ROOT:
    stageVars.vxPathsCwd = rPath.join(__dirname, '..');
    //stageVars.vxPathsCwd = process.cwd();
    configs.paths.cwd = stageVars.vxPathsCwd;

    // initialize process.env for compatibility with other calls:
    process.env.vxInfoApp = configs.info.app;
    process.env.vxPathsPrefix = configs.paths.prefix;
    process.env.vxPathsCwd = configs.paths.cwd;
    stageVars.vxInfoMode = process.env.vxInfoMode;
    //console.info(`L:vxInfoApp:${process.env.vxInfoApp}, vxPathsPrefix:${process.env.vxPathsPrefix}, vxInfoMode:${process.env.vxInfoMode}`);
  } else {
    // running in single or cluster mode:
    !process.env.vxInfoMode ? (process.env.vxInfoMode = configs.info.mode) : false;

    // was already set in getAppName(), no need to check:
    configs.info.app = process.env.vxInfoApp;

    // required for correct paths of routes:
    !process.env.vxPathsPrefix ? (process.env.vxPathsPrefix = configs.paths.prefix) : false;
    configs.paths.prefix = process.env.vxPathsPrefix;

    // set current working directory:
    process.env.vxPathsCwd = rPath.join(__dirname, '..');
    //process.env.vxPathsCwd = process.cwd();
    configs.paths.cwd = process.env.vxPathsCwd;
    //console.info(`O:vxInfoApp:${process.env.vxInfoApp}, vxPathsPrefix:${process.env.vxPathsPrefix}, vxInfoMode:${process.env.vxInfoMode}`);
  }
};

/**
 * returns application name to be able to import the configuration file related to it:
 * @param {*} lambdaEvent 
 */
exports.getAppName = function getAppName(lambdaEvent = null) {
  // checks if this is a lambda environment:
  if (lambdaEvent) {
    // set stage variables:
    let stageVars = lambdaEvent.stageVariables;

    // required for loading the correct configuration. set default if not defined:
    !stageVars.vxInfoApp ? (stageVars.vxInfoApp = 'vxpress') : false;
    process.env.vxInfoApp = stageVars.vxInfoApp;
    console.info('[i] lib/vx-environment: appName:L:', process.env.vxInfoApp);
    return process.env.vxInfoApp;
  } else {
    // running in single or cluster mode:
    // required for loading the correct configuration. set default if not defined:
    !process.env.vxInfoApp ? (process.env.vxInfoApp = 'vxpress') : false;
    console.info('[i] lib/vx-environment: appName:O:', process.env.vxInfoApp);
    return process.env.vxInfoApp;
  }
};
