var rFS = require('fs');

module.exports = class vxHandlers {
  /**
   * set application handlers
   * @param {*} log
   * @param {*} configs
   */
  constructor(log, configs) {
    this.log = log;
    this.configs = configs;
  }

  /**
   * load contents from filesystem or database:
   */
  load() {
    this.log.verbose(__filename, 'load');

    // initialize list to process:
    let dirFiles = [];

    // TODO: from db (database)
    let readFrom = 'fs';

    // read handlers from database or filesystem:
    switch (readFrom) {
      case 'db':
        // get list of handlers from configuration:
        this.configs.routes.map(item => {
          dirFiles.push(item.handler);
        });
        break;
      case 'fs':
        // get list of handlers from files in directory:
        dirFiles = rFS.readdirSync(`${this.configs.paths.cwd}${this.configs.paths.handlers}`);
        break;
    }

    // initialize object:
    let handlersAll = {};

    if (dirFiles) {
      if (Array.isArray(dirFiles)) {
        dirFiles.map(file => {
          // clear extension:
          let handlerName = file.replace('.js', '');
          // assign required:
          let handlerCurrent = require(`${this.configs.paths.cwd}${
            this.configs.paths.handlers
          }/${handlerName}`);
          // merge object keys:
          Object.assign(handlersAll, handlerCurrent);
        });
      }
    }
    // return collection of all handlers:
    return handlersAll;
  }
};
