#!/bin/bash -x

# to avoid having package installing node_modules for this sub-package,
# package.json has a suffix .src.

# run this script to create a copy from .src and then run yarn install for this sub-package.
rm -rf node_modules
cp package.json.src package.json
yarn install
rm package.json
