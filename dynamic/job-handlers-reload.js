'use strict';
var rMoment = require('moment');

function reloadTag() {
  // customize Moment.js:
  rMoment.locale('en-gb');
  // update time format:
  rMoment.updateLocale('en-gb', {
    longDateFormat: {
      // replace LT by a specific for reload flag:
      LT: 'YYYYMMDDHHmmss'
    }
  });
  //
  return rMoment().format('LT');
};
exports.reloadTag = reloadTag;

// print to stdout with no new line like console.log():
process.stdout.write(reloadTag());
