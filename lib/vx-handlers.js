var rFS = require('fs');

/**
 * set application handlers
 * @param {*} configs
 */
exports.handlers = function handlers(configs) {
  // initialize list to process:
  let dirFiles = [];

  // TODO: from db (database)
  let readFrom = 'fs';

  // read handlers from database or filesystem:
  switch (readFrom) {
    case 'db':
      // get list of handlers from configuration:
      configs.routes.map(item => {
        dirFiles.push(item.handler);
      });
      break;
    case 'fs':
      // get list of handlers from files in directory:
      dirFiles = rFS.readdirSync(`${configs.paths.cwd}${configs.paths.handlers}`);
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
        let handlerCurrent = require(`${configs.paths.cwd}${configs.paths.handlers}/${handlerName}`);
        // merge all keys into object:
        Object.assign(handlersAll, handlerCurrent);
      });
    }
  }
  // return collection of all handlers:
  return handlersAll;
};
