# Visual Express

[![vulnerabilities](https://snyk.io/test/npm/visual-express/badge.svg)](https://snyk.io/test/npm/visual-express)

VX is a dynamic layer for the well-known [express](https://www.npmjs.com/package/express), where listeners, routes and handlers are created from a configuration file, which can be modified using an intuitive user interface.

### Environments

With ease you can set your application to run in 3 different modes:
- As a single process
- As a cluster (multiple CPUs)
- Or as a Lambda function in AWS (Amazon Web Services)

### Zero Downtime

Due to its architecture, VX aims to deliver functionalities to allow zero downtime migrations.
The most important feature to be released, the auto-reload, will be able to accomplish that.

As new routes can be created on the fly to run any handler, temporary routes can be created to guarantee the integrity of new handlers running in a new environment.

After that, the new handler can be replaced by a permanent route, where the application will auto-reload only that route to start using the newly assigned handler.

It's an extra option when using a Canary approach is not available due to the lack of additional environments.

### Installation

Initialize a new NPM project and then install visual-express and aws-sdk.

```sh
$ npm init
$ npm install visual-express aws-sdk --save --save-exact
```

To be able to publish dynamic handlers, go inside *dynamic* folder and install node_minify.
Having node-minify in a separate node_modules makes the deployment package a lot smaller because you don't have to include any of these packages in the final product.

```sh
$ cd dynamic
$ npm install
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

Create another new server-start.js file with the following contents:

```javascript
'use strict';
var rServer = require('./server-config');

// start server:
rServer.start();
```

Initialize directories for custom configurations and dynamic handlers:

```sh
$ node node_modules/visual-express/vxpress-init.js
```

All good and ready to start the server!
Run the following command:

```sh
$ node server-start.js
```

### Documentation

Read the full [documentation wiki](https://github.com/fpenno/visual-express/wiki) for more details.
