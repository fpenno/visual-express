### Dynamic Handlers

When dynamic handlers are enabled, you don't need to include the handlers in this directory in your deployment package,
because these handlers were already minified and added to dynamic/handlers.json.

However you can include them in case you want to disable dynamic handlers and start considering these handlers instead.
To enable dynamic handlers you need to set in your configuration file aws.s3.active equals to true.
