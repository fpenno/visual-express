var rPath = require('path');
var rWinston = require('winston');
require('winston-daily-rotate-file');

// npm logging levels are prioritized from 0 to 5 (highest to lowest):
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
//
// in RFC5424 the syslog levels are prioritized from 0 to 7 (highest to lowest).
// { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }

class vxLogger {

  /**
   * application wide logging
   * @param {*} logLevel 
   * @param {*} logPrefix 
   */
  constructor(logLevel = 'silly', logPrefix = 'vx') {
    // default log level:
    this.default = logLevel;
    // log file prefix:
    this.prefix = logPrefix;
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
      //this.logFiles[file] ? this.addFile(file) : false;
      this.logFiles[file] ? this.addFileRotate(file) : false;
    });
    // assign console:
    Object.keys(this.logConsole).map(con => {
      this.logConsole[con] ? this.addConsole(con) : false;
    });
  }

  /**
   * spread operator to take all function parameters.
   * execute transformations and call the actual log function:
   * @param {*} params
   */
  error(...params) {
    this.logLevel('error', params);
  }
  warn(...params) {
    this.logLevel('warn', params);
  }
  info(...params) {
    this.logLevel('info', params);
  }
  verbose(...params) {
    this.logLevel('verbose', params);
  }
  debug(...params) {
    this.logLevel('debug', params);
  }
  silly(...params) {
    this.logLevel('silly', params);
  }

  /**
   * parses __filename path and returns the base file name:
   * @param {*} params
   */
  parseBaseFile(params) {
    if (params.length > 0) {
      // first argument is the file path (must be string):
      let fileName = params.shift().toString();
      params.unshift(rPath.basename(fileName));
      return params.join('|');
    }
    return '<empty>';
  }

  /**
   * execute logging function for the specified level:
   * @param {*} lvl
   * @param {*} params
   */
  logLevel(lvl, params) {
    this.logger[lvl][lvl](this.parseBaseFile(params));
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
      prettyPrint: false,
      timestamp: true,
      showLevel: false
    };
    this.logger[lvl].add(rWinston.transports.File, params);
  }

  /**
   * add file rotate transport to level:
   * @param {*} lvl
   */
  addFileRotate(lvl) {
    let params = {
      name: `${this.prefix}-${lvl}-filerotate`,
      filename: `./logs/${this.prefix}-%DATE%-${lvl}.log`,
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxSize: '100m',
      maxFiles: '30d',
      json: true,
      timestamp: true,
      showLevel: true
    };
    this.logger[lvl].add(rWinston.transports.DailyRotateFile, params);
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
module.exports = vxLogger;
