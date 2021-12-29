#!/usr/bin/env bash

set -e

if [ -x "$(command -v lerna)" ]; then lerna clean --y; fi
rm -rf node_modules
npm install
npm run install-all-packages
