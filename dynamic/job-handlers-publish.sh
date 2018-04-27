#!/bin/bash -x

# set base path for dynamic scripts:
DYN='dynamic'

# minify handlers for faster data transfer:
node ./$DYN/job-handlers-minify.js

# generate new dynamic file:
node ./$DYN/job-handlers-create.js

# create reload flag lock:
node ./$DYN/job-handlers-reload.js > ./$DYN/reload.flag

# copy dynamic handlers and reload flag to S3:
# aws s3 cp ./handlers/handlers.json s3://bucket-name/handlers.json
node ./$DYN/job-handlers-s3copy.js vxpress-local

# cleanup minified files:
rm ./$DYN/*.min
