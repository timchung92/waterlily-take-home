#!/bin/bash

source "$(dirname "$0")/util.sh"

SERVER_PATH="$(realpath "${SCRIPT_DIR}/../packages/server")"

if [[ ! -f "$CERT_PRIVATE_PATH" ]]; then
  "$SCRIPT_DIR/trust-dev-cert.sh"
fi

cd $SERVER_PATH
npm start