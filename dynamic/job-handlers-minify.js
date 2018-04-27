'use strict';
var rFS = require('fs');
var rPath = require('path');
var rCompressor = require('node-minify');

/**
 * create json with all handlers to publish in S3 and use in lambda:
 * node job-handlers-publish.js
 */

let pathCustomHandlers = 'custom';
let pathDynamic = 'dynamic';
let pathBase = rPath.dirname(__dirname);

/**
 * create json file with dynamic custom handlers:
 */
function handlersMinify() {
  // read custom handlers:
  let handlersCustom = [];
  handlersCustom = rFS.readdirSync(rPath.join(pathBase, pathCustomHandlers));

  // add file code to object:
  if (handlersCustom) {
    if (Array.isArray(handlersCustom)) {
      handlersCustom.map(file => {
        if (rPath.extname(file) === '.js') {
          // replace file extension:
          let fileMin = file.replace('.js', '.min');

          // minify using: Google Closure Compiler
          rCompressor.minify({
            compressor: 'gcc',
            input: rPath.join(pathBase, pathCustomHandlers, file),
            output: rPath.join(pathBase, pathDynamic, fileMin),
            callback: function(err, min) {
              if (err) {
                console.error('minify', file, err);
              } else {
                console.log('minified', file, fileMin);
              }
            }
          });
        }
      });
    }
  }

  console.log('Dynamic handlers minified.');
}

/**
 * run:
 */
handlersMinify();
