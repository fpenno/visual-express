var rCluster = require('cluster');
var rCPUs = require('os').cpus().length;

/**
 * start as cluster if selected in mode
 * @param {*} expressApp 
 * @param {*} vXpress 
 * @param {*} startListeners 
 * @param {*} createRoutes 
 */
exports.init = function init(expressApp, vXpress, startListeners, createRoutes) {
  // master process will fork workers:
  if (rCluster.isMaster) {
    // display process id:
    console.info('[i] cluster ENABLED. master pid:', process.pid);
    console.info('[i] cluster TOTAL FORKS will be:', rCPUs);
    // forks a worker per cpu:
    for (let cpuIdx = 0; cpuIdx < rCPUs; cpuIdx++) {
      rCluster.fork();
    }
    // create a new fork if a worker exits for any reason:
    rCluster.on('exit', (worker, code, signal) => {
      console.info('[i] fork EXITED. worker pid:', worker.process.pid);
      // fork new worker to replace the exited:
      rCluster.fork();
    });
  } else {
    // starts a new server in each fork:
    console.info('[i] cluster FORK. worker pid:', process.pid);
    // forked server:
    startListeners(expressApp, vXpress);
    createRoutes(expressApp, vXpress);
  }
};
