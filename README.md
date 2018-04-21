# Visual Express

[![vulnerabilities](https://snyk.io/test/npm/visual-express/badge.svg)](https://snyk.io/test/npm/visual-express)

VX is a dynamic layer for the well-known [express](https://www.npmjs.com/package/express), where listeners, routes and handlers are created from a configuration file, which can be modified using an intuitive [user interface](https://www.npmjs.com/package/visual-express-ui).

See how to install/execute [visual-express-ui](https://www.npmjs.com/package/visual-express-ui#installation)

### Environments

With ease you can set your application to run in 3 different modes:
- As a single process
- As a cluster (multiple CPUs)
- Or as a Lambda function in AWS (Amazon Web Services)

### Releases

This project is still an alpha release, although it's already simple, stable and reliable.
Priorities for the next release are CORS enhancements, HTTPS implementation, and auto-reload of listeners and routes.
If you are planning to run it as a Lambda function via API Gateway, this next release won't affect you.

### Zero Downtime

Due to its architecture, VX aims to deliver functionalities to allow zero downtime migrations.
The most important feature in the next release, the auto-reload, will be able to accomplish that.

As new routes can be created on the fly to run any handler, temporary routes can be created to guarantee the integrity of new handlers running in a new environment.

After that, the new handler can be replaced from a permanent route, where the application will auto-reload only that route to start using the newly assigned handler.

It's an extra option when using a Canary approach is not available due to the lack of additional environments.

### Handlers

These are the only objects you will have to care about.
For every new handler you create, you need to map it via the UI, or straight into the JSON configuration file once your skills get more advanced.

### Documentation

A comprehensive step-by-step from setup to extensions will be part of the next release.

### Installation

Initialize a new NPM project and then install visual-express and visual-express-ui:

```sh
$ npm init
$ npm install visual-express visual-express-ui
```

Create a new server-config.js file with the following contents:

```javascript
'use strict';
var rVx = require('visual-express');

// required if using custom config files and handlers:
rVx.setAppRoot(__dirname);

// set an application name to get configs from:
// can also be set via environment variable (vxInfoApp):
rVx.setAppName('vxpress');

// ready to be started:
exports.start = rVx.start;
```

Create another new server-start.js with the following contents:

```javascript
'use strict';
var rServer = require('./server-config');

// start server:
rServer.start();
```

Initialize the directories for custom configurations and handlers:

```sh
$ node node_modules/visual-express/vxpress-init.js
```

And then execute it:

```sh
$ node server-start.js
```

### Customize

New handlers are store inside */handlers*, and configurations inside */configs*.

While a more complete documentation is being prepared and still you're willing to explore what's done so far, have a look inside *node_modules/visual-express/*, more specifically inside *handlers* directory for other examples.

*vx-loopback* is a good handler to use as a base to build others. Create a copy, add your code, and that's it.
Then map your new handler inside *configs/vxpress.json* and reload the app. You should see it listing on the console.
