'use strict';
var rFS = require('fs');
var rPath = require('path');

/**
 * create json with all handlers to publish in S3 and use in lambda:
 * node job-handlers-publish.js
 */

let pathDynamic = 'dynamic';
let pathBase = rPath.dirname(__dirname);
let dynFile = 'handlers.json';

/**
 * create json file with dynamic handlers:
 */
function handlersCreate() {
  // read custom handlers:
  let handlersCustom = [];
  handlersCustom = rFS.readdirSync(rPath.join(pathBase, pathDynamic));

  // add file code to object:
  let handlersAll = {};
  if (handlersCustom) {
    if (Array.isArray(handlersCustom)) {
      handlersCustom.map(file => {
        if (rPath.extname(file) === '.min') {
          // clear file extension:
          let handlerName = file.replace('.min', '');
          // read file contents:
          let handlerCurrent = rFS.readFileSync(rPath.join(pathBase, pathDynamic, file));
          // convert to string:
          let content = handlerCurrent.toString();
          // add to object:
          handlersAll[handlerName] = content;
        }
      });
    }
  }

  // save json file:
  rFS.writeFileSync(
    rPath.join(pathBase, pathDynamic, dynFile),
    JSON.stringify(handlersAll)
  );
  console.log('Dynamic handlers created.');
}

/**
 * run:
 */
handlersCreate();
