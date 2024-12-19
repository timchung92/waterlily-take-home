#!/bin/bash

source "$(dirname "$0")/util.sh"
set -e

# run whole command in a sub-shell so we don't affect pwd or any other context
build_client_and_server() {

  rm -rf $BUILD_DIR

  echo "Building shared (validating only really).."
  cd $SHARED_PACKAGE_DIR
  npm run build

  echo "Building server.."
  cd $SERVER_PACKAGE_DIR
  npm run build

  echo "Building client.."
  cd $CLIENT_PACKAGE_DIR
  npm run build
}

(build_client_and_server | ts_echo)

ts_echo "Done!"
