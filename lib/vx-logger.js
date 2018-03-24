var rWinston = require('winston');

// npm logging levels are prioritized from 0 to 5 (highest to lowest):
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
//
// in RFC5424 the syslog levels are prioritized from 0 to 7 (highest to lowest).
// { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }

/**
 * application wide logging
 */
class vxLogger {
  /**
   * initialize log levels
   */
  constructor() {
    // default log level:
    this.default = 'silly';
    // log file prefix:
    this.prefix = 'vx';
    // logger levels:
    this.logger = {};
    // toggle levels:
    this.logFiles = { error: true, warn: true, info: true, verbose: true, debug: true, silly: true };
    this.logConsole = { error: true, warn: true, info: true, verbose: true, debug: true, silly: true };

    // create loggers:
    Object.keys(this.logFiles).map(level => {
      this.createLogger(level);
    });
    // assign file:
    Object.keys(this.logFiles).map(file => {
      this.logFiles[file] ? this.addFile(file) : false;
    });
    // assign console:
    Object.keys(this.logConsole).map(con => {
      this.logConsole[con] ? this.addConsole(con) : false;
    });
  }

  /**
   * getters for log levels:
   */
  get error() {
    return this.logLevel('error');
  }
  get warn() {
    return this.logLevel('warn');
  }
  get info() {
    return this.logLevel('info');
  }
  get verbose() {
    return this.logLevel('verbose');
  }
  get debug() {
    return this.logLevel('debug');
  }
  get silly() {
    return this.logLevel('silly');
  }

  /**
   * return object for the specified level:
   * @param {*} lvl
   */
  logLevel(lvl) {
    return this.logger[lvl][lvl];
  }

  /**
   * create new logger object for each level:
   * @param {*} lvl
   */
  createLogger(lvl) {
    this.logger[lvl] = new rWinston.Logger({
      level: this.default
    });
  }

  /**
   * add file transport to level:
   * @param {*} lvl
   */
  addFile(lvl) {
    let params = {
      name: `${this.prefix}-${lvl}-file`,
      filename: `./logs/${this.prefix}-${lvl}.log`,
      json: true,
      prettyPrint: true,
      timestamp: true,
      showLevel: false
    };
    this.logger[lvl].add(rWinston.transports.File, params);
  }

  /**
   * add console to log level:
   * @param {*} lvl
   */
  addConsole(lvl) {
    let params = {
      name: `${this.prefix}-${lvl}-console`,
      colorize: true
    };
    this.logger[lvl].add(rWinston.transports.Console, params);
  }
}

/**
 * exports available logging levels:
 */
module.exports = new vxLogger();
