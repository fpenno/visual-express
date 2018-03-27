var rCluster = require('cluster');
var rCPUs = require('os').cpus().length;

class vxCluster {
  /**
   * start as cluster if selected in mode
   * @param {*} log
   * @param {*} configs
   * @param {*} definitions
   */
  constructor(log, configs, definitions) {
    this.log = log;
    this.configs = configs;
    this.definitions = definitions;
  }

  /**
   * initialize:
   * @param {*} expressApp
   */
  init(expressApp) {
    this.log.verbose(__filename, 'init');

    // master process will fork workers:
    if (rCluster.isMaster) {
      // display process id:
      this.log.info('cluster ENABLED. master pid', process.pid);
      this.log.info('cluster TOTAL FORKS will be', rCPUs);
      // forks a worker per cpu:
      for (let cpuIdx = 0; cpuIdx < rCPUs; cpuIdx++) {
        rCluster.fork();
      }
      // create a new fork if a worker exits for any reason:
      rCluster.on('exit', (worker, code, signal) => {
        this.log.info('fork EXITED. worker pid', worker.process.pid);
        // fork new worker to replace the exited:
        rCluster.fork();
      });
    } else {
      // starts a new server in each fork:
      this.log.info('cluster FORK. worker pid', process.pid);
      // forked server:
      this.definitions.listeners.start(expressApp);
      this.definitions.routes.create(expressApp);
    }
  }
}

/**
 * ...:
 */
module.exports = vxCluster;
