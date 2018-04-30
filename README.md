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
The most important feature is the auto-reload, where routes can be created or changed on the fly during runtime.

As an example, temporary routes can be created to test new handlers, and once these handlers are tested they can be reassigned to permanent routes.

It's a good approach to guarantee the integrity of new handlers running in a new environment for the first time, where they can even run in the same production environment (with temporary routes) without affecting the whole system.

### Installation

Initialize a new NPM project and then install visual-express and aws-sdk:

```sh
$ npm init
$ npm install visual-express aws-sdk --save --save-exact
```

Initialize directories for custom configurations and dynamic handlers:

```sh
$ node node_modules/visual-express/vxpress-init.js
```

To be able to publish dynamic handlers, go inside *dynamic* folder and initialize it running:

```sh
$ cd dynamic
$ yarn-install.sh
```

Note: the reason dynamic has its own node_modules is to avoid having node-minify and a bunch of related packages as part of the main deployed product, meaning almost 20 megabytes bigger.


All set and ready to go, let's start the server!
Run the following command:

```sh
$ node server-start.js
```

### Documentation

Read the full [documentation wiki](https://github.com/fpenno/visual-express/wiki) for more details.
