var rConfigs = require('./vx-configs').get();

/**
 * set application handlers
 * @param {*} paths
 */
exports.handlers = function handlers(paths) {
  // initialize list to process:
  let dirFiles = [];

  // TODO: from db (database)
  let readFrom = 'fs';

  // read handlers from database or filesystem:
  switch (readFrom) {
    case 'db':
      // get list of handlers from configuration:
      rConfigs.routes.map(item => {
        dirFiles.push(item.handler);
      });
      break;
    case 'fs':
      var rFS = require('fs');
      // get list of handlers from files in directory:
      dirFiles = rFS.readdirSync(`${paths.cwd}${paths.handlers}`);
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
        let handlerCurrent = require(`${paths.cwd}${paths.handlers}/${handlerName}`);
        // merge all keys into object:
        Object.assign(handlersAll, handlerCurrent);
      });
    }
  }
  // return collection of all handlers:
  return handlersAll;
};
