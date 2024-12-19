#!/bin/bash

source "$(dirname "$0")/util.sh"

CLIENT_PATH="$(realpath "${SCRIPT_DIR}/../packages/client")"

echo "Waiting to give server a chance to start first..."
sleep 5

cd $CLIENT_PATH
npm start
